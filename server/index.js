const express = require('express');
const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');
const { google } = require('googleapis');
require('dotenv').config();
const session = require('express-session');
const crypto = require('node:crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();
const app = express();
app.use(express.json());
app.use(cors());


const sessionSecret = crypto.randomBytes(64).toString('hex');
const tokenSecret = crypto.randomBytes(64).toString('hex');

app.use(session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: true,
}));


app.use((req, res, next) => {
    next();
});

const createToken = (adminId) => {
    return jwt.sign({ adminId }, tokenSecret, { expiresIn: '1h' });
};

const authenticateJWT = (req, res, next) => {
    const token = req.session.token;

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    jwt.verify(token, tokenSecret, (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        req.admin = {
            id: decoded.adminId
        }

        next();
    });
};

const isAuthenticated = (req, res, next) => {
    if (req.session.token) {
        authenticateJWT(req, res, next);
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
};

app.get('/admin', isAuthenticated, (req, res) => {
    res.send({ admin: req.user });
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const hashPassword = async (password) => {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
};

const comparePasswords = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};

app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        const existingAdmin = await prisma.admin.findUnique({
            where: {
            username,
            },
        });
    
        if (existingAdmin) {
            return res.status(400).json({ success: false, message: "Username already exists" });
        }
    
        const hashedPassword = await hashPassword(password);
    
        const admin = await prisma.admin.create({
            data: {
            username,
            password: hashedPassword,
            },
        });
    
        req.session.token = createToken(admin.id);
    
        res.json({ success: true, message: "User created successfully", token: req.session.token });
    } catch (err) {
        console.log("Error during signup:", err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    try {
        const getAdmin = await prisma.admin.findUnique({
            where: {
                username,
            },
        });

    if (getAdmin) {
        if (getAdmin.password) {
        const passwordMatch = await comparePasswords(password, getAdmin.password);

        if (passwordMatch) {
            req.session.token = createToken(getAdmin.id);
            const adminData = {
                id: getAdmin.id,
                username: getAdmin.username
            };
            res.json({ success: true, token: req.session.token, admin: { id: getAdmin.id, username: getAdmin.username } });
        } else {
            res.status(401).json({ success: false, message: "Invalid Name or Password" });
        }
        } else {
        res.status(500).json({ success: false, message: "Hashed password not found for the user" });
        }
    } else {
        res.status(401).json({ success: false, message: "Invalid Name or Password" });
    }
    } catch (err) {
    console.log("Error during login:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
    }
});


// ! FOR TESTING PURPOSES ONLY
// cron.schedule('*/2 * * * *', async () => {
//     console.log('Running cleanup for future dates...');
//     try {
//         Set today's date to midnight and add one day to get tomorrow's date at midnight
//         const tomorrow = new Date(new Date().setHours(0, 0, 0, 0));
//         tomorrow.setDate(tomorrow.getDate() + 1);

//         console.log(`Deleting entries from date: ${tomorrow.toISOString()}`);

//         Delete entries where date is greater than or equal to tomorrow
//         const result = await prisma.availability.deleteMany({
//             where: {
//                 date: {
//                     gte: tomorrow
//                 }
//             }
//         });

//         console.log(`Removed future dates: ${result.count} entries deleted.`);
//     } catch (error) {
//         console.error('Failed to remove future dates:', error);
//     }
// });
// ! FOR TESTING PURPOSES ONLY


// Cleanup past dates every day at midnight
cron.schedule('0 0 * * *', async () => {
    console.log('Running cleanup for past dates...');
    try {
        const today = new Date(new Date().setHours(0, 0, 0, 0)); // Today's date at midnight

        const result = await prisma.availability.deleteMany({
            where: {
                date: {
                    lt: today
                }
            }
        });
        console.log(`Removed past dates: ${result.count} entries deleted.`);
    } catch (error) {
        console.error('Failed to remove past dates:', error);
    }
});

async function setTimezoneToUTC() {
    await prisma.$executeRaw`SET time_zone = '+00:00';`;
}

setTimezoneToUTC().catch(console.error);

function toUTC(date, time) {
    const localDate = new Date(`${date}T${time}:00`);
    return new Date(Date.UTC(localDate.getFullYear(), localDate.getMonth(), localDate.getDate(), localDate.getHours(), localDate.getMinutes()));
}


app.post('/availability', async (req, res) => {
    const { dates, startTime, endTime } = req.body;
    const availabilities = dates.map(date => {
        const adjustedDate = new Date(date);

        // Convert adjusted date to UTC string for date comparison
        const dateString = adjustedDate.toISOString().split('T')[0];

        // Adjust startTime and endTime using the modified date
        const startDateTime = toUTC(dateString, startTime);
        const endDateTime = toUTC(dateString, endTime);

        return {
            date: adjustedDate,
            startTime: startDateTime,
            endTime: endDateTime
        };
    });

    await prisma.availability.createMany({
        data: availabilities
    });
    res.status(201).send("Availability set");
});

app.get('/dates-with-availability', async (req, res) => {
    try {
        const availabilities = await prisma.availability.findMany({
            where: {
                status: "available"  // Fetch only availabilities that are not fully booked
            }
        });

        const availableDates = availabilities.map(availability => availability.date.toISOString().slice(0, 10));
        res.status(200).json(availableDates);
    } catch (error) {
        console.error('Failed to fetch available dates:', error);
        res.status(500).send('Error fetching dates');
    }
});


function generateTimeSlots(start, end, interval) {
    const slots = [];
    let current = new Date(start);
    const endTime = new Date(end);

    while (current < endTime) {
        const endSlot = new Date(current.getTime() + interval * 60000);
        slots.push(`${current.toISOString()} - ${endSlot.toISOString()}`);
        current = endSlot;
    }

    return slots;
}

app.get('/available-times/:date', async (req, res) => {
    const { date } = req.params;
    const queryDate = new Date(`${date}T00:00:00Z`); // Ensuring queryDate is considered in UTC
    queryDate.setDate(queryDate.getDate() + 1); // Correcting for time zone

    // Current UTC date and time with adjustments for your specific use case
    const now = new Date(new Date().getTime() + 2 * 60 * 60 * 1000); // Current time adjusted by +2 hours to match your time zone
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));


    try {
        const availabilities = await prisma.availability.findMany({
            where: {
                date: queryDate
            }
        });

        const bookings = await prisma.booking.findMany({
            where: {
                date: queryDate
            }
        });

        const bookedTimes = new Set(bookings.map(booking => {
            const startHour = booking.startTime.getUTCHours();
            const startMinute = booking.startTime.getUTCMinutes().toString().padStart(2, '0');
            const endHour = booking.endTime.getUTCHours();
            const endMinute = booking.endTime.getUTCMinutes().toString().padStart(2, '0');
            return `${startHour}:${startMinute}-${endHour}:${endMinute}`;
        }));

        const times = [];
        for (const availability of availabilities) {
            let currentTime = new Date(availability.startTime);

            while (currentTime < availability.endTime) {
                const endTimeSlot = new Date(currentTime.getTime() + 30 * 60000);
                const timeSlot = `${currentTime.getUTCHours()}:${currentTime.getUTCMinutes().toString().padStart(2, '0')}-${endTimeSlot.getUTCHours()}:${endTimeSlot.getUTCMinutes().toString().padStart(2, '0')}`;


                // Only filter past times if the requested date is today
                if (queryDate.toISOString().slice(0, 10) === today.toISOString().slice(0, 10)) {
                    if (currentTime > now && !bookedTimes.has(timeSlot)) {
                        times.push(timeSlot);
                    }
                } else {
                    if (!bookedTimes.has(timeSlot)) {
                        times.push(timeSlot);
                    }
                }

                currentTime = endTimeSlot;
            }
        }

        res.status(200).json(times);
    } catch (error) {
        console.error('Error fetching available times:', error);
        res.status(500).send('Error fetching available times');
    }
});



app.post('/book', async (req, res) => {
    const { date, timeSlot, clientName, clientEmail, services } = req.body;

    if (!timeSlot || !timeSlot.includes('-')) {
        return res.status(400).send('Invalid time slot format. Expected format "HH:MM-HH:MM".');
    }

    const [startTimeStr, endTimeStr] = timeSlot.split('-');
    const startDate = new Date(date);
    startDate.setUTCDate(startDate.getUTCDate() + 1); // Correcting for time zone

    const startTime = new Date(startDate);
    startTime.setUTCHours(Number.parseInt(startTimeStr.split(':')[0]), Number.parseInt(startTimeStr.split(':')[1]), 0);

    const endTime = new Date(startDate);
    endTime.setUTCHours(Number.parseInt(endTimeStr.split(':')[0]), Number.parseInt(endTimeStr.split(':')[1]), 0);

    const eventStartTime = new Date(startTime);
    const eventEndTime = new Date(endTime);
    
    // Subtract two hours from the new event start and end times
    eventStartTime.setHours(eventStartTime.getHours() - 2);
    eventEndTime.setHours(eventEndTime.getHours() - 2);

    const credentials = JSON.parse(process.env.REACT_APP_GOOGLE_API_KEY);
    const calendarId = process.env.REACT_APP_GOOGLE_CALENDAR_ID;
    const subjectEmail = process.env.REACT_APP_GOOGLE_MAIL;


    const auth = new google.auth.JWT(
        credentials.client_email,
        null,
        credentials.private_key,
        ["https://www.googleapis.com/auth/calendar.events"],
        subjectEmail,
        );

    const calendar = google.calendar({ version: "v3", auth });

    const event = {
        summary: 'Appointment Booking',
        description: `Booking for ${clientName}, Email: ${clientEmail}, Services: ${services}`,
        start: {
            dateTime: eventStartTime.toISOString(),
            timeZone: 'Europe/Stockholm'
        },
        end: {
            dateTime: eventEndTime.toISOString(),
            timeZone: 'Europe/Stockholm'
        }
    };

    calendar.events.insert({
        auth,
        calendarId,
        requestBody: event,
        conferenceDataVersion: 1,
        sendNotifications: false,
      }, (err, event) => {
        if (err) {
          // biome-ignore lint/style/useTemplate: <explanation>
          console.log('There was an error contacting the Calendar service: ' + err);
          return;
        }
        console.log('Event created: %s', event.data.htmlLink);
      });

    try {
        const availability = await prisma.availability.findFirst({
            where: {
                date: startDate,
                startTime: {
                    lte: startTime
                },
                endTime: {
                    gte: endTime
                },
                status: "available"  // Ensure the availability is not fully booked
            }
        });

        if (!availability) {
            return res.status(404).send('No available slot for this time or it is fully booked.');
        }

        const existingBooking = await prisma.booking.findFirst({
            where: {
                availabilityId: availability.id,
                OR: [
                    {
                        startTime: {
                            lte: startTime
                        },
                        endTime: {
                            gt: startTime
                        }
                    },
                    {
                        startTime: {
                            lt: endTime
                        },
                        endTime: {
                            gte: endTime
                        }
                    }
                ]
            }
        });

        if (existingBooking) {
            return res.status(400).send('This time slot is already booked.');
        }

        const newBooking = await prisma.booking.create({
            data: {
                date: startDate,
                startTime,
                endTime,
                clientName,
                clientEmail,
                availabilityId: availability.id
            }
        });

        // Check and update the availability status if necessary
        await updateAvailabilityStatus(availability.id);

        res.status(201).json(newBooking);
    } catch (error) {
        console.error('Failed to create booking:', error);
        res.status(500).send('Booking failed due to server error.');
    }
});

async function updateAvailabilityStatus(availabilityId) {
    const bookings = await prisma.booking.findMany({
        where: {
            availabilityId: availabilityId
        }
    });

    const availability = await prisma.availability.findUnique({
        where: {
            id: availabilityId
        }
    });

    const totalSlots = (availability.endTime - availability.startTime) / (30 * 60000); // 30-minute slots
    const bookedSlots = bookings.reduce((acc, booking) => {
        const duration = (booking.endTime - booking.startTime) / (30 * 60000); // Calculate each booking's duration in terms of slots
        return acc + duration;
    }, 0);

    // Update the status to 'fullyBooked' if all slots are booked
    if (bookedSlots >= totalSlots) {
        await prisma.availability.update({
            where: {
                id: availabilityId
            },
            data: {
                status: "fullyBooked"
            }
        });
    }
}




app.get('/bookings', async (req, res) => {
    try {
        const bookings = await prisma.booking.findMany({
            select: {
                date: true,
                startTime: true,
                endTime: true
            }
        });
        res.status(200).json(bookings);
    } catch (error) {
        console.error('Failed to fetch bookings:', error);
        res.status(500).send('Error fetching bookings');
    }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

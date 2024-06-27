import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import "../calendar.css";
import axios from 'axios';
import { sv } from 'date-fns/locale';
import { useNavigate } from "react-router-dom";


const AdminPage = () => {
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [startTime, setStartTime] = useState(new Date());
    const [endTime, setEndTime] = useState(new Date());


    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate("/login");
        }
    }, [navigate]);

    setTimeout(() => {
        localStorage.clear();
        if (!localStorage.getItem('token')) {
            navigate("/login");
        }
    }, 30 * 60000);
  
    const getDatesInRange = (start, end) => {
        const date = new Date(start.getTime());
        const dates = [];

        while (date <= end) {
            dates.push(new Date(date));
            date.setDate(date.getDate() + 1);
        }

        return dates;
    };

    const submitAvailability = async () => {
        const dates = getDatesInRange(startDate, endDate).map(date => date.toISOString().slice(0, 10));
        try {
            await axios.post('/availability', {
                dates,
                startTime: startTime.toTimeString().slice(0, 5),
                endTime: endTime.toTimeString().slice(0, 5)
            });
            alert('Availability updated successfully!');
        } catch (error) {
            alert('Failed to update availability');
            console.error(error);
        }
    };

    return (
        <div className='admin-page-form'>
            <div className='admin-page-form-container'>
                <h1>Admin Dashboard</h1>
                {/* <h2>Select Date Range</h2> */}
                <div className='admin-page-date-time'>
                    <DatePicker
                        selected={startDate}
                        onChange={([start, end]) => {
                            setStartDate(start);
                            setEndDate(end);
                        }}
                        startDate={startDate}
                        endDate={endDate}
                        selectsRange
                        inline
                        locale={sv}
                    />
                    {/* <h2>Select Start Time</h2> */}
                    <DatePicker
                        selected={startTime}
                        onChange={date => setStartTime(date)}
                        showTimeSelect
                        showTimeSelectOnly
                        timeIntervals={30}
                        timeCaption="Start Tid"
                        dateFormat="HH:mm"
                        inline
                        locale={sv}
                        minTime={new Date(0, 0, 0, 6, 0)}
                        maxTime={new Date(0, 0, 0, 23, 30)}
                    />
                    {/* <h2>Select End Time</h2> */}
                    <DatePicker
                        selected={endTime}
                        onChange={date => setEndTime(date)}
                        showTimeSelect
                        showTimeSelectOnly
                        timeIntervals={30}
                        timeCaption="Slut Tid"
                        dateFormat="HH:mm"
                        inline
                        locale={sv}
                        minTime={new Date(0, 0, 0, 6, 30)}
                        maxTime={new Date(0, 0, 0, 23, 30)}
                    />
                </div>
                <button className='admin-page-btn' type='button' onClick={submitAvailability}>Ställ in jobbtider</button>
            </div>
        </div>
    );
};

export default AdminPage;

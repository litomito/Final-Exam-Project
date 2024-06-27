import React, { useState, useEffect, useRef } from 'react';
import DatePicker from "react-datepicker";
import axios from 'axios';
import { sv } from 'date-fns/locale';
import "../calendar.css";
import ServiceSelector from '../components/services';
import Header from '../components/header';
import Navbar from '../components/navbar';
import About from '../components/about';
import Price from '../components/price';
import StepProgress from '../components/formSteps';


const ClientPage = () => {
    const [availableDates, setAvailableDates] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [availableTimes, setAvailableTimes] = useState([]);
    const [selectedTime, setSelectedTime] = useState('');
    const [clientName, setClientName] = useState('');
    const [clientEmail, setClientEmail] = useState('');
    const [selectedServices, setSelectedServices] = useState([]);
    const [currentStep, setCurrentStep] = useState(1);
    const elRef = useRef(null);
    
    useEffect(() => {
        fetchAvailableDates();
    }, []);


    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
        fetchAvailableTimes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedDate]);

    const fetchAvailableDates = async () => {
        try {
            const response = await axios.get('/dates-with-availability');
            const dates = response.data.map(dateStr => new Date(dateStr));
            setAvailableDates(dates);
        } catch (error) {
            console.error('Error fetching available dates', error);
        }
    };


    const fetchAvailableTimes = async () => {

        const padTime = time => {
            return time.split(":").map(part => part.padStart(2, '0')).join(":");
        };
        
        // Function to format time ranges
        const formatTimeRange = timeRange => {
            return timeRange.split("-").map(padTime).join("-");
        };

        if (selectedDate) {
            const formattedDate = selectedDate.toISOString().slice(0, 10);
            try {
                const response = await axios.get(`/available-times/${formattedDate}`);
                const formattedTimes = response.data.map(formatTimeRange);
                setAvailableTimes(formattedTimes);
                setSelectedTime('');
            } catch (error) {
                console.error('Error fetching times', error);
                setAvailableTimes([]);
                setSelectedTime('');
            }
        }
    };

    const handleTimeSelection = (time) => {
        setSelectedTime(time);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedTime || !clientName || !clientEmail) {
            alert('Please fill all fields and select a time slot.');
            return;
        }

        try {
            const response = await axios.post('/book', {
                date: selectedDate.toISOString().slice(0, 10),
                timeSlot: selectedTime,
                clientName,
                clientEmail,
                services: selectedServices
            });
            if (response.status === 201) {
                alert('Booking successful!');
                fetchAvailableDates(); // Refresh dates to check new availability
                fetchAvailableTimes(); // Refresh times for the selected date
            } else {
                throw new Error('Failed to book');
            }
        } catch (error) {
            alert(`Booking failed: ${error.response ? error.response.data.message : error.message}`);
            if (window.confirm) {
                window.location.reload(); // Reload the page to reset the form
            }
            console.error('Booking error:', error);
        }
    };


    useEffect(() => {
        const handleScroll = () => {
            if (elRef.current) {
              const scrollPosition = window.scrollY + window.innerHeight;
              const elementPosition = elRef.current.offsetTop + (elRef.current.offsetHeight * 0.7);
      
              if (scrollPosition >= elementPosition) {
                elRef.current.classList.add('visible');
              }
            }
          };
      
          window.addEventListener('scroll', handleScroll);
          return () => {
            window.removeEventListener('scroll', handleScroll);
          };
    }, []);


    return (
        <div className='client-page-container'>
            <Navbar />
            <Header />
            <About />
            <Price />
            <div id='book' className='client-page-date-time'>
                <div ref={elRef} className='client-page-form-container'>
                    <h2 className='book-time'>Boka Tid</h2>
                    {currentStep === 1 && (
                        <div className='form-section-container'>
                            <StepProgress currentStep={currentStep} />
                            <div className='form-sections'>
                                <DatePicker
                                    selected={selectedDate}
                                    onChange={date => setSelectedDate(date)}
                                    includeDates={availableDates}
                                    dateFormat="MMMM d, yyyy"
                                    locale={sv}
                                    inline
                                />
                                {selectedDate && (
                                    <div className='client-page-time-form'>
                                        <div className='time-header'>
                                            <h2 className='header-text'>Select Time</h2>
                                            <div className="clientPage-time-list">
                                                {availableTimes.map(time => (
                                                    <button type='button' key={time} onClick={() => handleTimeSelection(time)} className={`time-slot-button ${selectedTime === time ? 'selected' : ''}`}>
                                                        {time}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    {currentStep === 2 && (
                        <div className='form-section-container'>
                            <StepProgress currentStep={currentStep} />
                            <ServiceSelector selectedServices={selectedServices} toggleService={setSelectedServices} />
                        </div>
                    )}
                    {currentStep === 3 && (
                        <div className='form-section-container'>
                            <StepProgress currentStep={currentStep} />
                            <h2>Fyll in detaljerna</h2>
                            <input className='input' type="text" placeholder="Full Name" value={clientName} onChange={e => setClientName(e.target.value)} required />
                            <input className='input' type="email" placeholder="Email" value={clientEmail} onChange={e => setClientEmail(e.target.value)} required/>
                        </div>
                    )}
                    <div className='form-navigation'>
                        {currentStep > 1 && <button className='back-btn' type='button' onClick={() => setCurrentStep(currentStep - 1)}>Bakåt</button>}
                        {currentStep < 3 ? (
                            <button className='next-btn' type='button' onClick={() => setCurrentStep(currentStep + 1)}>Nästa</button>
                        ) : (
                            <button className='next-btn' type='button' onClick={handleSubmit}>Boka</button>
                        )}
                    </div>
                </div>
            </div>
      </div>
    );
};

export default ClientPage;

import React from 'react';

const ServiceSelector = ({ selectedServices, toggleService }) => {
    const services = ["Fade ", "Taper ", "Buzz Cut ", "Line Up ", "Beard Trim ", "Hot Towel Shave ", "Eye Brow Trim ", "Undercut ", "Waves ", "Edgar Cut ", "Braids ", "Perm "];

    const handleToggleService = (service) => {
        toggleService(prevSelected => {
            if (prevSelected.includes(service)) {
                return prevSelected.filter(s => s !== service);
            }
                return [...prevSelected, service];
        });
    };

    return (
        <div className='service-form-container'>
                <h2>Välj Tjänster du vill göra</h2>
            <div className='service-btns'>
                {services.map((service) => (
                    <button
                        key={service}
                        type='button'
                        onClick={() => handleToggleService(service)}
                        style={{ backgroundColor: selectedServices.includes(service) ? '#9a64c7' : '#2a2a2a' }}
                        className='service-form-btns'
                    >
                        {service}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ServiceSelector;

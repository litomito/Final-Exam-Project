import React, { useEffect, useRef } from 'react';
import servicesData from './priceData';

const Price = () => {
    const elRef = useRef(null);
    const infoRef = useRef(null);
  
    useEffect(() => {
      const handleScroll = () => {
        if (elRef.current) {
          const scrollPosition = window.scrollY + window.innerHeight;
          const elementPosition = elRef.current.offsetTop + (elRef.current.offsetHeight * 0.3);
  
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
        <div ref={elRef} className='price-container' id='price'>
            <h2>Priser</h2>
            <div className='price'>
                {servicesData.map((service) => (
                        <div ref={infoRef} className='popup' key={service.name}>
                            <div className='popup-container'>
                                <h3>{service.name}</h3>
                                <p className='text'>{service.description}</p>
                                <p className='popup-price'>{service.price} kr</p>
                            </div>
                        </div>
                ))}
            </div>
        </div>
    );
};

export default Price;
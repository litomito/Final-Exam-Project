import React, { useRef, useEffect } from 'react';

const About = () => {
    const elRef = useRef(null);
  
    useEffect(() => {
      const handleScroll = () => {
        if (elRef.current) {
          const scrollPosition = window.scrollY + window.innerHeight;
          const elementPosition = elRef.current.offsetTop + (elRef.current.offsetHeight * 0.9);
  
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
        <div id='about'>
            <div ref={elRef} className='about-container'>
                <h2>Om Oss</h2>
                <div className='about-text'>
                    <p>
                        Välkommen till Faded, den ultimata destinationen för mäns grooming. 
                        På Faded specialiserar vi oss på att erbjuda förstklassiga klippningar, rakningar och styling exklusivt för män. 
                        Vårt team av skickliga barberare är dedikerade till att leverera den perfekta looken anpassad efter varje individs 
                        stil och preferenser. Med fokus på precision, moderna tekniker och klassiska barberingstraditioner säkerställer Faded 
                        att varje besök är en avslappnande och njutbar upplevelse. Kliv in i vår eleganta, moderna miljö, koppla av och lämna med ett 
                        snyggt utseende. På Faded tror vi att varje man förtjänar ett skarpt, självsäkert och välvårdat utseende. Följ med oss och höj din 
                        grooming-standard.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default About;
import React, { useRef, useEffect, useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInstagram, faFacebook, faTwitter } from '@fortawesome/free-brands-svg-icons'


const Navbar = () => {
    const [lastScrollY, setLastScrollY] = useState(0);
    const ref = useRef(null);
    const handleScroll = () => {
        const currentScrollY = window.scrollY;
        if (currentScrollY > lastScrollY) {
            ref.current.classList.add("navbar-scroll");
        } else {
            ref.current.classList.remove("navbar-scroll");
        }
        setLastScrollY(currentScrollY);
    }

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
        window.removeEventListener("scroll", handleScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lastScrollY]);

    return (
        <div ref={ref} className="navbar">
            <div className="navbar-container">
                <div className="navbar-subcontainer">
                    <a className="home" href="#home">Faded</a>
                    <div className="nav-items">
                        <a href="#about">Oss</a>
                        <a href="#price">Priser</a>
                        <a href="#book">Bokning</a>
                    </div>
                    <div className="nav-media">
                        <FontAwesomeIcon className="icon insta" icon={faInstagram} />
                        <FontAwesomeIcon className="icon face" icon={faFacebook} />
                        <FontAwesomeIcon className="icon twit" icon={faTwitter} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Navbar;
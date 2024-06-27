import React, { useEffect, useRef } from "react";


const Header = () => {
    const videoRef = useRef(null);

    useEffect(() => {
        videoRef.current.playbackRate = 0.6;
    }, []);

    return (
        <div>
            <div id="home" className="client-page-video-container">
                <div className="client-page-video-subcontainer">
                    <video ref={videoRef} muted autoPlay loop onContextMenu={e => e.preventDefault()}>
                        <source src="/videos/Short-Video-Exam.webm" type="video/webm" />
                    </video>
                    <div className="client-page-video-overlay-text">
                        <h1>Faded</h1>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Header;
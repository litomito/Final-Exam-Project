import React, { useState, useEffect } from 'react';

const StepProgress = ({ currentStep }) => {
    const [animateStep, setAnimateStep] = useState(0);

    useEffect(() => {
        setAnimateStep(currentStep);
    }, [currentStep]);

    return (
        <div className="step-progress">
            <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>1</div>
            <div className={`step-line ${currentStep >= 2 ? 'active' : ''} ${animateStep === 2 ? 'animate' : ''}`} />
            <div className={`step ${currentStep >= 2 ? 'active' : ''} ${animateStep === 2 ? 'animate' : ''}`}>2</div>
            <div className={`step-line ${currentStep >= 3 ? 'active' : ''} ${animateStep === 3 ? 'animate' : ''}`} />
            <div className={`step ${currentStep >= 3 ? 'active' : ''} ${animateStep === 3 ? 'animate' : ''}`}>3</div>
        </div>
    );
};

export default StepProgress;

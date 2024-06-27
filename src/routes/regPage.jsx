import React, { useState } from 'react';
import axios from 'axios';

const SignUp = () => {
    const [errorMessage, setErrorMessage] = useState("");
    const [admin, setAdmin] = useState({
        username: '',
        password: '',
    })

    const handleChange = (e) => {
        setAdmin((prev) => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (admin) {
            try {
                const response = await axios.post("/register", admin);
                const { success, token } = response.data;

                if (success) {
                    localStorage.setItem('token', token);
                    window.location.href = "/login";
                }
            } catch (err) {
                if (err.response.data.message === "Username already exists" && err.message === "Request failed with status code 400") {
                    setErrorMessage("Name already taken. Please choose a different name or login if you have an account");
                    console.log(err);
                } else {
                    setErrorMessage("Error signing up");
                    console.log(err);
                }
            }
        }
    }

    return (
        <div className='container'>
            <div className='card-container'>
                <div className='card'>
                    <h1 className='card-header'>Sign Up</h1>
                    {errorMessage && <p className='err-msg'>{errorMessage}</p>}
                    <form method='POST' onSubmit={handleSubmit}>
                        <input className="inputs" type='text' placeholder='Enter your Name' name='username' id="username" onChange={handleChange} required />
                        <input className="inputs" type='password' placeholder='Choose a Password' name='password' onChange={handleChange} required />
                        <button className='btn' type='submit'>Submit</button>
                    </form>
                </div>
            </div>
        </div>
    )
};

export default SignUp;
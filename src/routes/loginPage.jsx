import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const LogIn = () => {
    const [errorMessage, setErrorMessage] = useState("");
    const [admin, setAdmin] = useState({
        username: "",
        password: "",
    });
    const navigate = useNavigate();

    useEffect(() => {
        const checkLoginStatus = async () => {
            try {
                const res = await axios.get("/login");
                if (res.data.isLoggedIn) {
                    localStorage.setItem('token', res.data.token);
                    navigate("/admin");
                }
            } catch (err) {
                console.error("Error checking login status:", err);
            }
        };

        checkLoginStatus();
    }, [navigate]);

    const handleChange = (e) => {
        setAdmin((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        if (admin) {
            try {
                const response = await axios.post("/login", admin);
                const { success, token, admin: adminData } = response.data;

                if (success) {
                    setAdmin(adminData);
                    localStorage.setItem('admin', JSON.stringify(adminData));
                    localStorage.setItem('token', token);
                    navigate("/admin");
                }
            } catch (err) {
                if (err.response && err.response.data.message === "Invalid Name or Password") {
                    setErrorMessage(`${err.response.data.message}. Try again or create an account if you don't have one`);
                } else {
                    setErrorMessage("Internal server error");
                }
            }
        }
    };

    return (
        <div className="container">
            <div className="card-container">
                <div className="card">
                    <h1 className="card-header">Log In</h1>
                    {errorMessage && <p className="err-msg">{errorMessage}</p>}
                    <form method="POST" onSubmit={handleLogin}>
                        <input className="inputs" type="text" placeholder="Your Name" name="username" id="username" onChange={handleChange} required />
                        <input className="inputs" type="password" placeholder="Enter your Password" name="password" id="password" onChange={handleChange} required />
                        <button className="btn" type="submit">Login</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LogIn;
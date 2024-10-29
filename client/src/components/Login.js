// src/components/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './css/Auth.css';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch('/user/login/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      localStorage.setItem('isLoggedIn', 'true'); // Save login state
      localStorage.setItem('username', username); // Save username
      navigate('/');
    } else {
      setErrorMessage('*username and password do not match');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Username:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={errorMessage ? 'error' : ''}
            />
            {errorMessage && <p className="error-message">{errorMessage}</p>}
          </div>
          <button type="submit" className="login-button">Login</button>
        </form>
        <p className="signup-link" onClick={() => navigate('/signup')}>Sign Up</p>
      </div>
    </div>
  );
}

export default Login;
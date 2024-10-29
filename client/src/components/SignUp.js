// src/components/SignUp.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './css/Auth.css';

function SignUp() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrorMessage('*passwords must match');
      return;
    }

    const response = await fetch('/user/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      navigate('/login');
    } else {
      setErrorMessage('Sign-up failed');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Sign Up</h2>
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
            />
          </div>
          <div className="input-group">
            <label>Confirm Password:</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className={errorMessage ? 'error' : ''}
            />
            {errorMessage && <p className="error-message">{errorMessage}</p>}
          </div>
          <button type="submit" className="login-button">Create Account</button>
        </form>
        <p className="signup-link" onClick={() => navigate('/login')}>Login</p>
      </div>
    </div>
  );
}

export default SignUp;
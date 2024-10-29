import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from './TopBars';
import './css/MainPage.css';

const MainPage = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');

  useEffect(() => {
    // Check if the user is logged in by checking localStorage
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const storedUsername = localStorage.getItem('username');
    setIsLoggedIn(loggedIn);
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  return (
    <div>
      <TopBar
        isLoggedIn={isLoggedIn}
        username={username}
      />
      <div className="main-page">
        <button className="custom-button" onClick={() => navigate('/host')}>Host Game</button>
        <button className="custom-button" onClick={() => navigate('/join')}>Join Game</button>
      </div>
    </div>
  );
};

export default MainPage;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './css/MainPage.css';
import './css/Sidebar.css';
import './css/Hamburger.css';
import './css/Buttons.css';
import './css/Icons.css';
import './css/Logos.css';

/**
 * Cards with premade games should be displayed on the main page.
 * One card should be for creating a custom game.
 * There should also be a join game button
 */

const MainPage = () => {
  const navigate = useNavigate();
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [rightSidebarVisible, setRightSidebarVisible] = useState(false);
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

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  const toggleRightSidebar = () => {
    setRightSidebarVisible(!rightSidebarVisible);
  };

  const closeSidebars = () => {
    setSidebarVisible(false);
    setRightSidebarVisible(false);
  };

  const handleSignOut = async () => {
    const response = await fetch('/user/logout/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('username');
      setIsLoggedIn(false);
      setUsername('');
      closeSidebars();
      navigate('/');
    } else {
      alert('Sign out failed');
    }
  };

  const userIcon = isLoggedIn ? (
    <div className="user-initial">{username.charAt(0).toUpperCase()}</div>
  ) : (
    <img src="/not_logged_in.png" alt="User Icon" />
  );

  return (
    <div className="main-page">
      <div className="top-bar">
        <div className="hamburger" onClick={toggleSidebar}>&#9776;</div>
        <div className="name-logo">Guessify</div>
        <div className="user-icon" onClick={toggleRightSidebar}>
          {userIcon}
        </div>
      </div>
      {(sidebarVisible || rightSidebarVisible) && (
        <div className="overlay" onClick={closeSidebars}></div>
      )}
      <div className={`sidebar ${sidebarVisible ? 'visible' : ''}`}>
        <div className="sidebar-content">
          <div className="logo"></div> {/* Logo placeholder */}
          <div className="close-button" onClick={toggleSidebar}>&times;</div>
          <p onClick={() => navigate('/')}>Home</p>
          <p>Menu Item 2</p>
          <p>Menu Item 3</p>
        </div>
      </div>
      <div className={`right-sidebar ${rightSidebarVisible ? 'visible' : ''}`}>
        <div className="sidebar-content">
          <div className="logo"></div> {/* Logo placeholder */}
          <div className="close-button" onClick={toggleRightSidebar}>&times;</div>
          {isLoggedIn ? (
            <>
              <p onClick={() => navigate('/profile')}>Profile</p>
              <p onClick={handleSignOut}>Sign Out</p>
            </>
          ) : (
            <>
              <p onClick={() => navigate('/login')}>Login</p>
              <p onClick={() => navigate('/signup')}>Sign Up</p>
            </>
          )}
        </div>
      </div>
      <div className="content">
        <button className="custom-button" onClick={() => navigate('/host')}>Host Game</button>
        <button className="custom-button" onClick={() => navigate('/join')}>Join Game</button>
      </div>
    </div>
  );
};

export default MainPage;
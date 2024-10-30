// src/components/TopBar.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './css/TopBar.css';
import './css/Sidebar.css';
import './css/Hamburger.css';
import './css/Buttons.css';
import './css/Icons.css';
import './css/Logos.css';

const TopBar = ({ isLoggedIn, username }) => {
  const navigate = useNavigate();
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [rightSidebarVisible, setRightSidebarVisible] = useState(false);

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

  const userIcon = isLoggedIn ? (
    <img src="/logo192.png" alt="User Icon" />
  ) : (
    <img src="/not_logged_in.png" alt="User Icon" />
  );

  return (
    <div>
      <div className="top-bar">
        <div className="hamburger" onClick={toggleSidebar}>&#9776;</div>
        <div className="name-logo" onClick={() => navigate('/')}>Guessify</div>
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
              <p onClick={() => {
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('username');
                navigate('/');
              }}>Sign Out</p>
            </>
          ) : (
            <>
              <p onClick={() => navigate('/login')}>Login</p>
              <p onClick={() => navigate('/signup')}>Sign Up</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopBar;
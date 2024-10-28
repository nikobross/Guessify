import React, { useState } from 'react';
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

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  return (
    <div className="main-page">
      <div className="top-bar">
        <div className="hamburger" onClick={toggleSidebar}>&#9776;</div>
        <div className="name-logo">Guessify</div>
        <div className="user-icon" onClick={() => navigate('/login')}>
          <img src="/not_logged_in.png" alt="User Icon" />
        </div>
      </div>
      <div className={`sidebar ${sidebarVisible ? 'visible' : ''}`}>
        <div className="sidebar-content">
          <div className="logo"></div> {/* Logo placeholder */}
          <div className="close-button" onClick={toggleSidebar}>&times;</div>
          <p onClick={() => navigate('/login')}>Login</p>
          <p>Menu Item 2</p>
          <p>Menu Item 3</p>
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
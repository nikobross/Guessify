import React from 'react';
import { useNavigate } from 'react-router-dom';
import './MainPage.css';

const MainPage = () => {
  const navigate = useNavigate();

  return (
    <div className="main-page">
      <button className="custom-button" onClick={() => navigate('/host')}>Host Game</button>
      <button className="custom-button" onClick={() => navigate('/join')}>Join Game</button>
    </div>
  );
};

export default MainPage;
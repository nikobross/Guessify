import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './css/Card.css';

const Card = ({ playlistUri, playlistName, image, onClick, tooltip, imageClass = 'card-image-perfect-center', isLoggedIn, username }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (isModalVisible) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }
  }, [isModalVisible]);

  const handleCardClick = () => {
    if (onClick) {
      onClick(playlistUri);
    } else {
      document.body.classList.add('no-scroll');
      setIsModalVisible(true);
    }
  };

  const handleCloseModal = () => {
    document.body.classList.remove('no-scroll');
    setIsModalVisible(false);
    setErrorMessage('');
  };

  const handleStartGame = async () => {
    try {
      const response = await fetch('/create-game', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ playlist_uri: playlistUri }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Game created:', data);
        navigate('/host-waiting-room', { state: { gameCode: data.game.game_code, userId: data.user_id } });
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message);
      }
    } catch (error) {
      console.error('Error creating game:', error);
      setErrorMessage('An unexpected error occurred');
    }
  };

  return (
    <>
      <div className="card" onClick={handleCardClick}>
        <div className={`${imageClass}`} style={{ backgroundImage: `url(${image})` }}></div>
        {tooltip && (
          <div className="tooltip">
            <span className="tooltip-icon">?</span>
            <span className="tooltip-text">{tooltip}</span>
          </div>
        )}
      </div>
      {isModalVisible && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={handleCloseModal}>×</button>
            <div className={`${imageClass} modal-image`} style={{ backgroundImage: `url(${image})` }}></div>
            <button className="start-game-button" onClick={handleStartGame}>Start Game</button>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
          </div>
        </div>
      )}
    </>
  );
};

export default Card;
import React, { useState, useEffect } from 'react';
import './css/Card.css';

const Card = ({ playlistUri, playlistName, image, onClick, tooltip, imageClass = 'card-image-perfect-center' }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    if (isModalVisible) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }
  }, [isModalVisible]);

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    } else {
      document.body.classList.add('no-scroll');
      setIsModalVisible(true);
    }
  };

  const handleCloseModal = () => {
    document.body.classList.remove('no-scroll');
    setIsModalVisible(false);
  };

  const handleStartGame = () => {
    document.body.classList.remove('no-scroll');
    setIsModalVisible(false);
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
            <h2>{playlistName}</h2>
            <button className="start-game-button" onClick={handleStartGame}>Start Game</button>
          </div>
        </div>
      )}
    </>
  );
};

export default Card;
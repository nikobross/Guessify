import React from 'react';
import './css/Card.css';

const Card = ({ playlistUri, playlistName, image, onCreateGame, tooltip, imageClass = 'card-image-perfect-center' }) => {
  return (
    <div className="card" onClick={() => onCreateGame(playlistUri)}>
      <div className={`${imageClass}`} style={{ backgroundImage: `url(${image})` }}></div>
      {tooltip && (
        <div className="tooltip">
          <span className="tooltip-icon">?</span>
          <span className="tooltip-text">{tooltip}</span>
        </div>
      )}
    </div>
  );
};

export default Card;
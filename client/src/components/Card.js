import React from 'react';
import './css/Card.css';

const Card = ({ playlistUri, playlistName, image, onCreateGame, tooltip }) => {
  return (
    <div className="card" onClick={() => onCreateGame(playlistUri)}>
      <div className="card-image" style={{ backgroundImage: `url(${image})` }}></div>
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
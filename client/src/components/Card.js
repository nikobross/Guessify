import React from 'react';
import './css/Card.css';

const Card = ({ playlistUri, playlistName, image, onCreateGame }) => {
  return (
    <div className="card" onClick={() => onCreateGame(playlistUri)}>
      <div className="card-image" style={{ backgroundImage: `url(${image})` }}></div>
    </div>
  );
};

export default Card;
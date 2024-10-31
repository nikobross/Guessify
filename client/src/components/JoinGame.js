import React from 'react';
import TopBar from './TopBars';
import './css/JoinGame.css';

const JoinGame = ({ isLoggedIn, username }) => {
  return (
    <div>
      <TopBar isLoggedIn={isLoggedIn} username={username} />
      <div className="join-game-container">
        <div className="join-game-box">
          <h1>Join a Game</h1>
          <input type="text" className="join-game-input" placeholder="Enter Game Code" />
          <button className="join-game-button">Join</button>
        </div>
      </div>
    </div>
  );
};

export default JoinGame;
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from './TopBars';
import './css/JoinGame.css';

const JoinGame = ({ isLoggedIn, username }) => {
  const [gameCode, setGameCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleJoinGame = async () => {
    try {
      const response = await fetch('/join-game', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ game_code: gameCode }),
      });

      if (response.ok) {
        navigate('/waiting-room', { state: { gameCode: gameCode } });
      } else {
        setErrorMessage('Game could not be found');
      }
    } catch (error) {
      console.error('Error joining game:', error);
      setErrorMessage('Game could not be found');
    }
  };

  return (
    <div>
      <TopBar isLoggedIn={isLoggedIn} username={username} />
      <div className="join-game-container">
        <div className="join-game-box">
          <h1>Join a Game</h1>
          <input
            type="text"
            className="join-game-input"
            placeholder="Enter Game Code"
            value={gameCode}
            onChange={(e) => setGameCode(e.target.value)}
          />
          <button className="join-game-button" onClick={handleJoinGame}>
            Join
          </button>
          {errorMessage && <p className="error-message">{errorMessage}</p>}
        </div>
      </div>
    </div>
  );
};

export default JoinGame;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from './TopBars';
import './css/JoinGame.css';

const JoinGame = ({ isLoggedIn, username }) => {
  const [gameCode, setGameCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSpotifyLoggedIn, setIsSpotifyLoggedIn] = useState(false);
  const [gameData, setGameData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSpotifyLogin = async () => {
      try {
        const response = await fetch('/is-spotify-logged-in');
        if (response.ok) {
          const data = await response.json();
          setIsSpotifyLoggedIn(data.spotify_logged_in);
        }
      } catch (error) {
        console.error('Error checking Spotify login status:', error);
      }
    };

    checkSpotifyLogin();
  }, []);

  const handleJoinGame = async () => {
    try {
      const response = await fetch('/check-game', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ game_code: gameCode.replace(/-/g, '') }),
      });

      if (response.ok) {
        const data = await response.json();
        setGameData(data);
        setIsModalOpen(true);
      } else {
        setErrorMessage('Game could not be found');
      }
    } catch (error) {
      console.error('Error checking game:', error);
      setErrorMessage('Game could not be found');
    }
  };

  const handleJoinWithAudio = async () => {
    try {
      const response = await fetch('/join-game', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ game_code: gameCode.replace(/-/g, ''), with_audio: true }),
      });

      if (response.ok) {
        const data = await response.json();
        navigate('/waiting-room', { state: { gameCode: gameCode, userId: data.user_id, withAudio: true } });
      } else {
        setErrorMessage('Failed to join game with audio');
      }
    } catch (error) {
      console.error('Error joining game with audio:', error);
      setErrorMessage('Failed to join game with audio');
    }
  };

  const handleJoinWithoutAudio = () => {
    // Placeholder for future implementation
    alert('Join without audio is not implemented yet.');
  };

  const formatGameCode = (code) => {
    const cleanedCode = code.replace(/\D/g, ''); // Remove non-numeric characters
    const formattedCode = cleanedCode.match(/.{1,3}/g)?.join('-') || ''; // Insert dash after every 3 characters
    return formattedCode.slice(0, 7); // Limit to 7 characters (xxx-xxx)
  };

  const handleInputChange = (e) => {
    const rawValue = e.target.value.replace(/-/g, '');
    setGameCode(formatGameCode(rawValue));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Backspace' && gameCode.endsWith('-')) {
      e.preventDefault();
      setGameCode(gameCode.slice(0, -1));
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
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
          />
          <button className="join-game-button" onClick={handleJoinGame}>Join</button>
          {errorMessage && <p className="error-message">{errorMessage}</p>}
        </div>
      </div>
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={() => setIsModalOpen(false)}>×</button>
            <h2>Join Game</h2>
            <button
              className="modal-button"
              onClick={handleJoinWithAudio}
              disabled={!isSpotifyLoggedIn}
            >
              Play with Audio
            </button>
            <button className="modal-button" onClick={handleJoinWithoutAudio}>
              Play without Audio
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default JoinGame;
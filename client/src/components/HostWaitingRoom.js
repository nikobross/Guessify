import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import TopBar from './TopBars';
import './css/WaitingRoom.css';

const HostWaitingRoom = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { gameCode, userId } = location.state || {};
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [players, setPlayers] = useState([]);
  const [gameState, setGameState] = useState('waiting');

  useEffect(() => {
    // Check if the user is logged in by checking localStorage
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const storedUsername = localStorage.getItem('username');
    setIsLoggedIn(loggedIn);
    if (storedUsername) {
      setUsername(storedUsername);
    }

    const fetchPlayers = () => {
      if (gameCode) {
        fetch(`/get-players-in-game/${gameCode}`)
          .then(response => response.json())
          .then(data => {
            if (data.players) {
              setPlayers(data.players);
            }
          })
          .catch(error => console.error('Error fetching players:', error));
      }
    };

    const fetchGameState = () => {
      if (gameCode) {
        fetch(`/get-gamestate/${gameCode}`)
          .then(response => response.json())
          .then(data => {
            setGameState(data.gamestate);
            if (data.gamestate === 'playing') {
              navigate('/playing-song', { state: { gameCode, userId } });
            }
          })
          .catch(error => console.error('Error fetching game state:', error));
      }
    };

    // Fetch players and game state immediately and then periodically
    fetchPlayers();
    fetchGameState();
    const intervalId = setInterval(() => {
      fetchPlayers();
      fetchGameState();
    }, 5000); // Fetch players and game state every 5 seconds

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [gameCode, navigate, userId]);

  const handleNext = () => {
    // Change the game state to "playing"
    fetch('/change-gamestate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ game_code: gameCode, new_state: 'playing' }),
    })
      .then(response => response.json())
      .then(data => {
        console.log('Game state changed:', data);
        setGameState('playing');
        navigate('/playing-song', { state: { gameCode, userId } });
      })
      .catch(error => console.error('Error changing game state:', error));
  };

  return (
    <div>
      <TopBar isLoggedIn={isLoggedIn} username={username} />
      <div className="waiting-room-container">
        <div className="waiting-room-box">
          <h1>Host Waiting Room</h1>
          <p>Game Code: {gameCode}</p>
          <h2>Players:</h2>
          <ul>
            {players.map((player, index) => (
              <li key={index}>{player.username}</li>
            ))}
          </ul>
          <button className="custom-button" onClick={handleNext}>Next</button>
        </div>
      </div>
    </div>
  );
};

export default HostWaitingRoom;
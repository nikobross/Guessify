import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import TopBar from './TopBars';
import './css/Leaderboard.css';

const Leaderboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { gameCode, userId, isHost } = location.state || {};
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [players, setPlayers] = useState([]);

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
            console.log('Players:', data);
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
            if (data.gamestate === 'playing') {
              navigate('/playing-song', { state: { gameCode, userId, isHost } });
            }
          })
          .catch(error => console.error('Error fetching game state:', error));
      }
    };

    // Fetch players and next song immediately
    fetchPlayers();
    const intervalId = setInterval(fetchGameState, 1000); // Check game state every 5 seconds

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [gameCode, navigate, userId]);

  const handleNextQuestion = () => {
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
        navigate('/playing-song', { state: { gameCode, userId, isHost } });
      })
      .catch(error => console.error('Error changing game state:', error));
  };

  return (
    <div>
      <TopBar isLoggedIn={isLoggedIn} username={username} />
      <div className="leaderboard-container">
        <div className="leaderboard-box">
          <h1>Leaderboard</h1>
          <p>Game Code: {gameCode}</p>
          <h2>Players:</h2>
          <ul>
            {players.map((player, index) => (
              <li key={index}>{player.username}: {player.score}</li>
            ))}
          </ul>
          {isHost && (
            <button className="next-question-button" onClick={handleNextQuestion}>
              Next Question
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
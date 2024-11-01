import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import TopBar from './TopBars';
import './css/WaitingRoom.css';

const WaitingRoom = () => {
  const location = useLocation();
  const { gameCode } = location.state || {};
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

    // Fetch players immediately and then periodically
    fetchPlayers();
    const intervalId = setInterval(fetchPlayers, 5000); // Fetch players every 5 seconds

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [gameCode]);

  return (
    <div>
      <TopBar isLoggedIn={isLoggedIn} username={username} />
      <div className="waiting-room-container">
        <div className="waiting-room-box">
          <h1>Waiting Room</h1>
          <p>Game Code: {gameCode}</p>
          <h2>Players:</h2>
          <ul>
            {players.map((player, index) => (
              <li key={index}>{player.username}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default WaitingRoom;
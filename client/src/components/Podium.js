import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import TopBar from './TopBars';
import './css/Podium.css';

const Podium = () => {
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
              // Sort players by score in descending order
              const sortedPlayers = data.players.sort((a, b) => b.score - a.score);
              setPlayers(sortedPlayers.slice(0, 3)); // Get top 3 players
            }
          })
          .catch(error => console.error('Error fetching players:', error));
      }
    };

    // Fetch players immediately
    fetchPlayers();
  }, [gameCode]);

  return (
    <div>
      <TopBar isLoggedIn={isLoggedIn} username={username} />
      <div className="podium-container">
        <div className="podium-box">
          <h1>Podium</h1>
          <div className="podium">
            {players.length > 1 && (
              <div className="second-place">
                <div className="player">{players[1].username}</div>
                <div className="box">2</div>
              </div>
            )}
            {players.length > 0 && (
              <div className="first-place">
                <div className="player">{players[0].username}</div>
                <div className="box">1</div>
              </div>
            )}
            {players.length > 2 && (
              <div className="third-place">
                <div className="player">{players[2].username}</div>
                <div className="box">3</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Podium;
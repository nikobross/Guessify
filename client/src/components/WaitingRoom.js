import React, { useEffect, useState } from 'react';
import TopBar from './TopBars';
import './css/WaitingRoom.css';

const WaitingRoom = ({ isLoggedIn, username, gameCode }) => {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
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
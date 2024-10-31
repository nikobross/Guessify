import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from './TopBars';
import Card from './Card';
import './css/MainPage.css';
import MoreGames from './MoreGames'; // Ensure this import is correct

const MainPage = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [playlists, setPlaylists] = useState([
    {
      uri: '37i9dQZF1DXcBWIGoYBM5M',
      name: 'Top 50 - USA',
      image: '/top50global.jpeg'
    },
    {
      uri: '37i9dQZF1DXcBWIGoYBM5M',
      name: 'Top 50 - Global',
      image: '/top50us.jpeg'
    },
    {
      uri: '37i9dQZF1DX4JAvHpjipBk',
      name: 'Viral Hits',
      image: '/viralhits2.jpeg'
    },
    {
      uri: '37i9dQZF1DX4JAvHpjipBk',
      name: 'Viral Hits',
      image: '/viralhits2.jpeg'
    },
    {
      uri: '37i9dQZF1DX4JAvHpjipBk',
      name: 'Viral Hits',
      image: '/viralhits2.jpeg'
    },
    {
      uri: '37i9dQZF1DX4JAvHpjipBk',
      name: 'Viral Hits',
      image: '/viralhits2.jpeg'
    },
    {
      uri: '37i9dQZF1DX4JAvHpjipBk',
      name: 'Create Custom Game',
      image: '/customgame.jpeg'
    }
  ]);

  const seeGames = {
    uri: 'URI not used',
    name: 'See More',
    image: '/seegames.jpeg'
  };

  const customGame = {
    uri: '37i9dQZF1DX4JAvHpjipBk',
    name: 'Custom Game',
    image: '/customgame.jpeg'
  };

  useEffect(() => {
    // Check if the user is logged in by checking localStorage
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const storedUsername = localStorage.getItem('username');
    setIsLoggedIn(loggedIn);
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  const createGame = async (playlistUri) => {
    try {
      const response = await fetch('/create-game', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ playlist_uri: playlistUri }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Game created! Game Code: ${data.game_code}`);
        navigate(`/game/${data.game_id}`);
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error creating game:', error);
      alert('Error creating game');
    }
  };

  const seeMoreGames = async (playlistUri) => {  
    navigate('/more-games', { state: { isLoggedIn, username } });
  }

  return (
    <div>
      <TopBar isLoggedIn={isLoggedIn} username={username} />
      <div className="main-page-content">
        <div className="left-section">
          <h2 className='cards-container-text'>Popular Now</h2>
          <div className="cards-container">
            {playlists.map((playlist, index) => (
              <Card
                key={`${playlist.uri}-${index}`} // Ensure unique keys
                playlistUri={playlist.uri}
                playlistName={playlist.name}
                image={playlist.image}
                onCreateGame={createGame}
              />
            ))}
            <Card
              key={`${seeGames.uri}`} // Ensure unique key for custom game
              playlistUri={seeGames.uri}
              playlistName={seeGames.name}
              image={seeGames.image}
              onCreateGame={seeMoreGames}
              tooltip="Click to see more!"
            />
          </div>
        </div>
        <div className="right-sections">
          <div className="top-right-section">
          <h2 className='cards-container-text'>Join an ongoing game</h2>
          <button className="custom-button" onClick={() => navigate('/join-game')}>Join a game</button>
          </div>
          <div className="bottom-right-section">
            <h2 className='cards-container-text'>Create Custom Game</h2>
            <Card
              key={`${customGame.uri}-custom`} // Ensure unique key for custom game
              playlistUri={customGame.uri}
              playlistName={customGame.name}
              image={customGame.image}
              onCreateGame={createGame}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainPage;
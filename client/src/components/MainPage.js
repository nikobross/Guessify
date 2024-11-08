import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from './TopBars';
import Card from './Card';
import './css/MainPage.css';

const MainPage = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [playlists] = useState([
    {
      uri: '37i9dQZEVXbLRQDuF5jeBp',
      name: 'Top 50 - USA',
      image: '/popular/top50us.jpeg'
    },
    {
      uri: '37i9dQZF1DX4JAvHpjipBk',
      name: 'New Music Friday',
      image: '/popular/newmusicfriday.jpeg'
    },
    {
      uri: '37i9dQZF1DX2L0iB23Enbq',
      name: 'Viral Hits',
      image: '/popular/viralhits.jpeg'
    },
    {
      uri: '37i9dQZF1DX4JAvHpjipBk',
      name: 'All out 1960s',
      image: '/allout/allout1960s.jpeg'
    },
    {
      uri: '37i9dQZF1DX4JAvHpjipBk',
      name: 'All out 1980s',
      image: '/allout/allout1980s.jpeg'
    },
    {
      uri: '37i9dQZF1DXcBWIGoYBM5M',
      name: 'Pop Right Now',
      image: '/genres/poprightnow.jpeg'
    },
    {
      uri: '37i9dQZF1DX4JAvHpjipBk',
      name: 'Viva Latino',
      image: '/genres/vivalatino.jpeg'
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

  const seeMoreGames = async () => {  
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
              />
            ))}
            <Card
              key={`${seeGames.uri}`} // Ensure unique key for custom game
              playlistUri={seeGames.uri}
              playlistName={seeGames.name}
              image={seeGames.image}
              onClick={seeMoreGames}
              tooltip="Click to see more!"
            />
          </div>
        </div>
        <div className="right-sections">
          <div className="top-right-section">
          <button className="big-custom-button" onClick={() => navigate('/join-game')}>Join a Game</button>
          </div>
          <div className="bottom-right-section">
            <h2 className='cards-container-text'>Custom Game</h2>
            <Card
              key={`${customGame.uri}-custom`} // Ensure unique key for custom game
              playlistUri={customGame.uri}
              playlistName={customGame.name}
              image={customGame.image}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainPage;
import React, { useState, useEffect } from 'react';
import TopBar from './TopBars';
import Card from './Card';
import './css/MoreGames.css';

const MoreGames = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');

  useEffect(() => {
    // Retrieve authentication state from local storage
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const storedUsername = localStorage.getItem('username');
    setIsLoggedIn(loggedIn);
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  const [topGames] = useState([
    {
      uri: '37i9dQZEVXbLRQDuF5jeBp',
      name: 'Top 50 - USA',
      image: '/popular/top50global.jpeg'
    },
    {
      uri: '37i9dQZF1DXcBWIGoYBM5M',
      name: 'Top 50 - Global',
      image: '/popular/top50us.jpeg'
    },
    {
      uri: '37i9dQZF1DX4JAvHpjipBk',
      name: 'Viral Hits',
      image: '/popular/viralhits.jpeg'
    },
    {
      uri: '37i9dQZF1DX4JAvHpjipBk',
      name: 'New Music Friday',
      image: '/popular/newmusicfriday.jpeg'
    },
    {
      uri: '37i9dQZF1DX4JAvHpjipBk',
      name: 'Most Streamed',
      image: '/popular/moststreamed.jpeg'
    },
    {
      uri: '37i9dQZF1DX4JAvHpjipBk',
      name: 'Viral Hits',
      image: '/popular/viralhits.jpeg'
    }
  ]);

  const [throughTheYears] = useState([
    {
      uri: '37i9dQZF1DXcBWIGoYBM5M',
      name: 'All out 2010s',
      image: '/allout/allout2010s.jpeg'
    },
    {
      uri: '37i9dQZF1DXcBWIGoYBM5M',
      name: 'All out 2000s',
      image: '/allout/allout2000s.jpeg'
    },
    {
      uri: '37i9dQZF1DX4JAvHpjipBk',
      name: 'All out 1990s',
      image: '/allout/allout1990s.jpeg'
    },
    {
      uri: '37i9dQZF1DX4JAvHpjipBk',
      name: 'All out 1980s',
      image: '/allout/allout1980s.jpeg'
    },
    {
      uri: '37i9dQZF1DX4JAvHpjipBk',
      name: 'All out 1970s',
      image: '/allout/allout1970s.jpeg'
    },
    {
      uri: '37i9dQZF1DX4JAvHpjipBk',
      name: 'All out 1960s',
      image: '/allout/allout1960s.jpeg'
    }
  ]);

  const [genreGames] = useState([
    {
      uri: '37i9dQZF1DXcBWIGoYBM5M',
      name: 'Rap Caviar',
      image: '/genres/rapcaviar.jpeg'
    },
    {
      uri: '37i9dQZF1DXcBWIGoYBM5M',
      name: 'Pop Right Now',
      image: '/genres/poprightnow.jpeg'
    },
    {
      uri: '37i9dQZF1DX4JAvHpjipBk',
      name: 'Hot Country',
      image: '/genres/hotcountry.jpeg'
    },
    {
      uri: '37i9dQZF1DX4JAvHpjipBk',
      name: 'Viva Latino',
      image: '/genres/vivalatino.jpeg'
    },
    {
      uri: '37i9dQZF1DX4JAvHpjipBk',
      name: 'Rock Classics',
      image: '/genres/rockclassics.jpeg'
    },
    {
      uri: '37i9dQZF1DX4JAvHpjipBk',
      name: 'All New Dance',
      image: '/genres/allnewdance.jpeg'
    }
  ]);

  return (
    <div>
      <TopBar isLoggedIn={isLoggedIn} username={username} />
      <div className="more-games-content">
        <div className="section">
          {topGames.map((card, index) => (
            <Card
              key={`${card.uri}-${index}-section1`}
              playlistUri={card.uri}
              playlistName={card.name}
              image={card.image}
              isLoggedIn={isLoggedIn}
              username={username}
            />
          ))}
        </div>
        <div className="section">
          {throughTheYears.map((card, index) => (
            <Card
              key={`${card.uri}-${index}-section2`}
              playlistUri={card.uri}
              playlistName={card.name}
              image={card.image}
              isLoggedIn={isLoggedIn}
              username={username}
            />
          ))}
        </div>
        <div className="section">
          {genreGames.map((card, index) => (
            <Card
              key={`${card.uri}-${index}-section3`}
              playlistUri={card.uri}
              playlistName={card.name}
              image={card.image}
              isLoggedIn={isLoggedIn}
              username={username}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MoreGames;
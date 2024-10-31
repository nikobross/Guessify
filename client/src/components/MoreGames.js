import React, { useState } from 'react';
import TopBar from './TopBars';
import Card from './Card';
import './css/MoreGames.css';

const MoreGames = ({ isLoggedIn, username }) => {

    const [topGames, setTopGames] = useState([
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
                  onCreateGame={() => {}}
                />
              ))}
            </div>
            <div className="section">
              {topGames.map((card, index) => (
                <Card
                  key={`${card.uri}-${index}-section2`}
                  playlistUri={card.uri}
                  playlistName={card.name}
                  image={card.image}
                  onCreateGame={() => {}}
                />
              ))}
            </div>
            <div className="section">
              {topGames.map((card, index) => (
                <Card
                  key={`${card.uri}-${index}-section3`}
                  playlistUri={card.uri}
                  playlistName={card.name}
                  image={card.image}
                  onCreateGame={() => {}}
                />
              ))}
            </div>
          </div>
        </div>
      );
    };

export default MoreGames;
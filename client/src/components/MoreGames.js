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
          name: 'New Music Friday?',
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

    const [throughTheYears, setThroughTheYears] = useState([
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
    
    const [genreGames, setGenreGames] = useState([
        {
            uri: '37i9dQZF1DXcBWIGoYBM5M',
            name: 'Rap Caviar',
            image: '/genres/rapcaviar.jpeg'
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
              {throughTheYears.map((card, index) => (
                <Card
                  key={`${card.uri}-${index}-section2`}
                  playlistUri={card.uri}
                  playlistName={card.name}
                  image={card.image}
                  onCreateGame={() => {}}
                  imageClass='card-image-through-years'
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
                  onCreateGame={() => {}}
                />
              ))}
            </div>
          </div>
        </div>
      );
    };

export default MoreGames;
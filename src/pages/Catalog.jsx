import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Styles/CatalogStyle.css';

const CLOUDINARY_BASE = "https://res.cloudinary.com/dytjuv6qt/image/upload/";

const Catalog = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:5083/api/Movie/GetMovies')
      .then((res) => res.json())
      .then((data) => {
        const list = data.data || data;
        setMovies(list || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const filteredMovies = movies.filter((movie) => {
    const title = movie.title || movie.Title || '';
    return title.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getImageUrl = (movie) => {
    const imgName = movie.imageUrl || movie.img || movie.Img || movie.ImageUrl;
    if (!imgName) return null;
    if (imgName.startsWith('http')) return imgName;
    return `${CLOUDINARY_BASE}${imgName}`;
  };

  return (
    <div className="catalog-page">
      
      <div className="top-bar">
        
        <div className="nav-left">
          <button className="nav-back-btn" onClick={() => navigate('/')}>
            ← Vissza
          </button>
          
          
        </div>
        
        <div className="search-container">
          <input 
            type="text" 
            placeholder="Keresés..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <button className="filter-btn">Szűrés</button>
      </div>

      <div className="content-area">
        {loading ? (
          <div className="msg">Betöltés...</div>
        ) : (
          <div className="movie-grid">
            {filteredMovies.map((movie) => {
              const id = movie.id || movie.movieId || movie.MovieId || movie.movie_id;
              const title = movie.title || movie.Title || 'Névtelen';
              const genre = movie.genre || movie.Genre || 'Ismeretlen';
              const rating = movie.rating || movie.Rating || '-';
              const imageSrc = getImageUrl(movie);

              return (
                <div key={id} className="movie-card">
                  <div className="poster">
                    {imageSrc ? (
                      <img 
                        src={imageSrc} 
                        alt={title}
                        onError={(e) => {e.target.style.display='none'}}
                      />
                    ) : (
                      <div className="no-img">Nincs Kép</div>
                    )}
                    <span className="rating">{rating}</span>
                  </div>

                  <div className="info">
                    <h3>{title}</h3>
                    <p>{genre}</p>
                  </div>

                  <button 
                    className="details-btn"
                    onClick={() => id ? navigate(`/movie/${id}`) : alert("Hiba: Nincs ID")}
                  >
                    Részletek
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Catalog;
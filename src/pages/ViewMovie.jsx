import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../Styles/ViewMovieStyle.css';

const CLOUDINARY_BASE = "https://res.cloudinary.com/dytjuv6qt/image/upload/";

const ViewMovie = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [movie, setMovie] = useState(null);
  const [showtimeId, setShowtimeId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id || id === 'undefined') {
        setError('Hiba: Érvénytelen film azonosító.');
        setLoading(false);
        return;
    }

    fetch(`http://localhost:5083/api/Movie/MovieById/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Hálózati hiba vagy a film nem található.');
        return res.json();
      })
      .then((data) => {
        const movieData = data.data || data;
        setMovie(movieData);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Nem sikerült betölteni az adatokat.');
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (!movie) return;

    const movieId = movie.movieId || movie.MovieId || movie.movie_id || movie.id;
    const movieTitle = (movie.title || movie.Title || '').toLowerCase().trim();

    fetch('http://localhost:5083/api/Showtime/GetAllShowtimes')
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : (data.data || []);

        const byMovieId = list.find((st) => {
          const stMovieId = st.movieId || st.MovieId || st.movie?.movieId || st.movie?.MovieId || st.movie?.id;
          return stMovieId && movieId && String(stMovieId) === String(movieId);
        });

        if (byMovieId) {
          setShowtimeId(byMovieId.showtimeId || byMovieId.ShowtimeId);
          return;
        }

        const byTitle = list.find((st) => {
          const stTitle = (st.movieTitle || st.MovieTitle || '').toLowerCase().trim();
          return stTitle && movieTitle && stTitle === movieTitle;
        });

        setShowtimeId(byTitle ? (byTitle.showtimeId || byTitle.ShowtimeId) : null);
      })
      .catch((err) => {
        console.error('Hiba a vetítések betöltésekor:', err);
        setShowtimeId(null);
      });
  }, [movie]);

  const getImageUrl = (imgName) => {
    if (!imgName) return null;
    if (imgName.startsWith('http')) return imgName;
    return `${CLOUDINARY_BASE}${imgName}`;
  };

  const getReleaseDate = (m) => {
    if (!m) return null;
    return m.release_date || m.releaseDate || m.ReleaseDate || m.date || m.Date || m.created_at; 
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Ismeretlen dátum';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'Érvénytelen dátum';
    return date.toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getYear = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;
    return date.getFullYear();
  };

  const handleBack = () => {
    navigate('/Catalog'); 
  };

  const handleBooking = () => {
    if (!showtimeId) {
      alert('Ehhez a filmhez jelenleg nincs elérhető vetítés.');
      return;
    }
    navigate(`/booking/${showtimeId}`);
  };

  if (loading) return <div className="view-page"><div className="loading-text">Betöltés...</div></div>;
  
  if (error || !movie) {
    return (
        <div className="view-page">
            <button className="back-btn" onClick={handleBack}>← Vissza a Katalógusba</button>
            <div className="error-text">{error || "A film nem található."}</div>
        </div>
    );
  }

  const title = movie.title || movie.Title;
  const description = movie.description || movie.Description;
  const genre = movie.genre || movie.Genre;
  const rating = movie.rating || movie.Rating;
  const duration = movie.duration || movie.Duration;
  
  const releaseDate = getReleaseDate(movie);
  const imgUrl = getImageUrl(movie.img || movie.Img || movie.imageUrl || movie.ImageUrl);
  const releaseYear = getYear(releaseDate);

  return (
    <div className="view-page">
      <div 
        className="background-layer" 
        style={imgUrl ? { backgroundImage: `url(${imgUrl})` } : {}}
      ></div>

      <button className="back-btn" onClick={handleBack}>
        ← Vissza a Katalógusba
      </button>

      <div className="movie-content">
        <div className="poster-section">
          {imgUrl ? (
            <img src={imgUrl} alt={title} />
          ) : (
            <div className="no-poster-placeholder">Nincs kép</div>
          )}
        </div>

        <div className="info-section">
          <h1 className="movie-title">{title}</h1>

          <div className="meta-tags">
            {rating && <span className="tag rating">{rating}</span>}
            {genre && <span className="tag">{genre}</span>}
            {duration > 0 && <span className="tag">⏱ {duration} perc</span>}
            {releaseYear && <span className="tag">{releaseYear}</span>}
          </div>

          <p className="description">
            {description || "Ehhez a filmhez még nincs leírás megadva."}
          </p>

          <div className="action-buttons">
            <button className="play-btn" onClick={handleBooking}>🎫 Jegyfoglalás</button>
          </div>

          <div className="secondary-info">
            <p><strong>Megjelenés:</strong> {formatDate(releaseDate)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewMovie;
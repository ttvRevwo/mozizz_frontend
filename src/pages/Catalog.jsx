import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Styles/CatalogStyle.css';

const CLOUDINARY_BASE = "https://res.cloudinary.com/dytjuv6qt/image/upload/";

const GENRES = [
    'Akció', 'Vígjáték', 'Dráma', 'Horror', 'Sci-fi',
    'Thriller', 'Animáció', 'Fantasy'
];

const Catalog = () => {
    const [movies,       setMovies]       = useState([]);
    const [loading,      setLoading]      = useState(true);
    const [searchTerm,   setSearchTerm]   = useState('');
    const [filterOpen,   setFilterOpen]   = useState(false);
    const [activeGenres, setActiveGenres] = useState([]);
    const filterRef = useRef(null);
    const navigate  = useNavigate();

    useEffect(() => {
        fetch('http://localhost:5083/api/Movie/GetMovies')
            .then(res => res.json())
            .then(data => { setMovies(data.data || data || []); })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        const handler = (e) => {
            if (filterRef.current && !filterRef.current.contains(e.target)) {
                setFilterOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const toggleGenre = (genre) => {
        setActiveGenres(prev =>
            prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
        );
    };

    const clearFilters = () => setActiveGenres([]);

    const getImageUrl = (movie) => {
        const imgName = movie.imageUrl || movie.img || movie.Img || movie.ImageUrl;
        if (!imgName) return null;
        if (imgName.startsWith('http')) return imgName;
        return `${CLOUDINARY_BASE}${imgName}`;
    };

    const filteredMovies = movies.filter(movie => {
        const title = (movie.title || movie.Title || '').toLowerCase();
        const genre = (movie.genre || movie.Genre || '').toLowerCase();

        const matchSearch = title.includes(searchTerm.toLowerCase());
        const matchGenre  = activeGenres.length === 0 || activeGenres.some(g =>
            genre.includes(g.toLowerCase())
        );
        return matchSearch && matchGenre;
    });

    return (
        <div className="catalog-page">
            <div className="top-bar">
                <div className="top-bar-left">
                    <button className="nav-back-btn" onClick={() => navigate('/')}>
                        ← Vissza
                    </button>
                </div>

                <h2 className="catalog-title">Filmkatalógus</h2>

                <div className="top-bar-right">
                    <div className="search-wrap" ref={filterRef}>
                        <div className="search-field">
                            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8" />
                                <path d="M21 21l-4.35-4.35" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Film keresése..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                            {searchTerm && (
                                <button className="search-clear" onClick={() => setSearchTerm('')}>✕</button>
                            )}
                        </div>

                        <button
                            className={`filter-btn ${filterOpen ? 'open' : ''} ${activeGenres.length > 0 ? 'has-active' : ''}`}
                            onClick={() => setFilterOpen(v => !v)}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
                                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                            </svg>
                            Szűrő
                            {activeGenres.length > 0 && (
                                <span className="filter-badge">{activeGenres.length}</span>
                            )}
                        </button>

                        {filterOpen && (
                            <div className="filter-panel">
                                <div className="filter-panel-header">
                                    <span>Műfaj szerinti szűrés</span>
                                    {activeGenres.length > 0 && (
                                        <button className="filter-clear-btn" onClick={clearFilters}>
                                            Törlés
                                        </button>
                                    )}
                                </div>
                                <div className="filter-genre-grid">
                                    {GENRES.map(genre => (
                                        <label key={genre} className={`filter-genre-item ${activeGenres.includes(genre) ? 'checked' : ''}`}>
                                            <input
                                                type="checkbox"
                                                checked={activeGenres.includes(genre)}
                                                onChange={() => toggleGenre(genre)}
                                            />
                                            <span className="filter-checkmark">
                                                {activeGenres.includes(genre) && (
                                                    <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" width="10" height="10">
                                                        <polyline points="1.5 6 4.5 9 10.5 3" />
                                                    </svg>
                                                )}
                                            </span>
                                            {genre}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {activeGenres.length > 0 && (
                <div className="active-filters-bar">
                    {activeGenres.map(g => (
                        <span key={g} className="active-filter-chip" onClick={() => toggleGenre(g)}>
                            {g} ✕
                        </span>
                    ))}
                </div>
            )}

            <div className="content-area">
                {loading ? (
                    <div className="msg">
                        <div className="catalog-spinner" />
                        Filmek betöltése...
                    </div>
                ) : filteredMovies.length === 0 ? (
                    <div className="msg">Nincs találat a megadott feltételekre.</div>
                ) : (
                    <>
                        <p className="results-count">
                            {filteredMovies.length} film
                            {(searchTerm || activeGenres.length > 0) && ' a szűrési feltételekre'}
                        </p>
                        <div className="movie-grid">
                            {filteredMovies.map(movie => {
                                const id        = movie.movieId || movie.MovieId || movie.movie_id || movie.id;
                                const title     = movie.title  || movie.Title  || 'Névtelen';
                                const genre     = movie.genre  || movie.Genre  || 'Ismeretlen';
                                const rating    = movie.rating || movie.Rating || '-';
                                const imageSrc  = getImageUrl(movie);

                                return (
                                    <div key={id} className="movie-card" onClick={() => id && navigate(`/movie/${id}`)}>
                                        <div className="poster">
                                            {imageSrc ? (
                                                <img
                                                    src={imageSrc}
                                                    alt={title}
                                                    onError={e => { e.target.style.display = 'none'; }}
                                                />
                                            ) : (
                                                <div className="no-img">Nincs kép</div>
                                            )}
                                            <span className="rating">{rating}</span>
                                        </div>
                                        <div className="info">
                                            <h3>{title}</h3>
                                            <p>{genre}</p>
                                        </div>
                                        <button className="details-btn">Részletek</button>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Catalog;
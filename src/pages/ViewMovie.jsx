import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../Styles/ViewMovieStyle.css';
import ShowtimeSelector from '../Pages/ShowtimeSelector';

const CLOUDINARY_BASE = "https://res.cloudinary.com/dytjuv6qt/image/upload/";

const ViewMovie = () => {
    const { id }     = useParams();
    const navigate   = useNavigate();
    const [movie,    setMovie]   = useState(null);
    const [loading,  setLoading] = useState(true);
    const [error,    setError]   = useState(null);

    useEffect(() => {
        if (!id || id === 'undefined') {
            setError('Hiba: Érvénytelen film azonosító.');
            setLoading(false);
            return;
        }
        fetch(`http://localhost:5083/api/Movie/MovieById/${id}`)
            .then(res => {
                if (!res.ok) throw new Error('A film nem található.');
                return res.json();
            })
            .then(data => { setMovie(data.data || data); })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [id]);

    const getImageUrl = (imgName) => {
        if (!imgName) return null;
        if (imgName.startsWith('http')) return imgName;
        return `${CLOUDINARY_BASE}${imgName}`;
    };

    const getReleaseDate = (m) => m
        ? (m.release_date || m.releaseDate || m.ReleaseDate || m.date || m.Date || m.created_at)
        : null;

    const formatDate = (dateStr) => {
        if (!dateStr) return 'Ismeretlen dátum';
        const d = new Date(dateStr);
        return isNaN(d.getTime()) ? 'Érvénytelen dátum'
            : d.toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const getYear = (dateStr) => {
        if (!dateStr) return null;
        const d = new Date(dateStr);
        return isNaN(d.getTime()) ? null : d.getFullYear();
    };

    const handleBack = () => {
        window.history.length > 1 ? navigate(-1) : navigate('/Catalog');
    };

    if (loading) return (
        <div className="view-page view-page--center">
            <div className="view-spinner" />
        </div>
    );

    if (error || !movie) return (
        <div className="view-page view-page--center">
            <button className="back-btn" onClick={handleBack}>← Vissza</button>
            <p className="error-text">{error || 'A film nem található.'}</p>
        </div>
    );

    const title       = movie.title       || movie.Title;
    const description = movie.description || movie.Description;
    const genre       = movie.genre       || movie.Genre;
    const rating      = movie.rating      || movie.Rating;
    const duration    = movie.duration    || movie.Duration;
    const director    = movie.director    || movie.Director;
    const releaseDate = getReleaseDate(movie);
    const imgUrl      = getImageUrl(movie.img || movie.Img || movie.imageUrl || movie.ImageUrl);
    const releaseYear = getYear(releaseDate);

    return (
        <div className="view-page">
            <div className="bg-layer" style={imgUrl ? { backgroundImage: `url(${imgUrl})` } : {}} />

            <button className="back-btn" onClick={handleBack}>← Vissza</button>

            <div className="vm-layout">
                <aside className="vm-poster">
                    {imgUrl
                        ? <img src={imgUrl} alt={title} />
                        : <div className="vm-no-poster">Nincs kép</div>
                    }
                </aside>

                <div className="vm-body">
                    <div className="vm-info">
                        <h1 className="vm-title">{title}</h1>

                        <div className="vm-tags">
                            {rating    && <span className="vm-tag vm-tag--gold">{rating}</span>}
                            {genre     && <span className="vm-tag">{genre}</span>}
                            {duration > 0 && <span className="vm-tag">⏱ {duration} perc</span>}
                            {releaseYear  && <span className="vm-tag">{releaseYear}</span>}
                        </div>

                        <p className="vm-desc">
                            {description || 'Ehhez a filmhez még nincs leírás megadva.'}
                        </p>

                        {director && (
                            <p className="vm-director">
                                <span>Rendező</span> {director}
                            </p>
                        )}

                        <p className="vm-release">
                            <span>Megjelenés</span> {formatDate(releaseDate)}
                        </p>
                    </div>

                    <div className="vm-showtimes">
                        <h3 className="vm-showtimes-title">Foglalj jegyet</h3>
                        <ShowtimeSelector movieId={id} movieTitle={title} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewMovie;
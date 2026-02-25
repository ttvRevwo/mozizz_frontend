import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import '../styles/MovieDetailsStyle.css';

const CLOUDINARY_BASE = "https://res.cloudinary.com/dytjuv6qt/image/upload/";

function MovieDetails() {
    const { id } = useParams(); 
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);
    
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    const [movieData, setMovieData] = useState({
        movie_id: '',
        title: '',
        genre: '',
        duration: '',
        rating: '',
        description: '',
        release_date: '',
        created_at: '',
        img: '' 
    });

    useEffect(() => {
        const url = `http://localhost:5083/api/Movie/MovieById/${id}`;
        
        fetch(url)
            .then(res => {
                if (!res.ok) throw new Error(`Szerver hiba: ${res.status}`);
                return res.json();
            })
            .then(data => {
                const movie = data.data || data;
                
                const loadedId = movie.movieId || movie.movie_id || movie.MovieId || movie.id || '';
                const rawDate = movie.release_date || movie.ReleaseDate || movie.releaseDate;
                let formattedDate = '';
                if (rawDate) {
                    formattedDate = rawDate.split('T')[0];
                }
                const rawCreated = movie.created_at || movie.CreatedAt || movie.createdAt;

                setMovieData({
                    movie_id: loadedId, 
                    title: movie.title || movie.Title || '',
                    genre: movie.genre || movie.Genre || '',
                    duration: movie.duration || movie.Duration || '',
                    rating: movie.rating || movie.Rating || '',
                    description: movie.description || movie.Description || '',
                    release_date: formattedDate,
                    created_at: rawCreated,
                    img: movie.img || movie.Img || '' 
                });
            })
            .catch(err => {
                console.error(err);
                setMessage({ type: 'error', text: 'Nem sikerült betölteni a filmet.' });
            })
            .finally(() => setLoading(false));
    }, [id]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setMovieData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSave = () => {
        const formData = new FormData();

        formData.append('MovieId', movieData.movie_id);
        formData.append('Title', movieData.title);
        formData.append('Genre', movieData.genre);
        formData.append('Duration', movieData.duration);
        formData.append('Rating', movieData.rating);
        formData.append('Description', movieData.description);
        formData.append('Img', movieData.img);
        
        let finalReleaseDate = "2000-01-01T00:00:00";
        if (movieData.release_date) {
            finalReleaseDate = `${movieData.release_date}T00:00:00`;
        }
        formData.append('ReleaseDate', finalReleaseDate);

        if (movieData.created_at) {
             formData.append('CreatedAt', movieData.created_at);
        }

        if (selectedFile) {
            formData.append('imageFile', selectedFile);
        }

        fetch('http://localhost:5083/api/Movie/ModifyMovie', {
            method: 'PUT',

            body: formData
        })
        .then(async response => {
            if (response.ok) {
                const jsonResp = await response.json(); 
                setMessage({ type: 'success', text: jsonResp.üzenet || 'Sikeres mentés!' });
                
                if (jsonResp.uj_fajlnev) {
                    setMovieData(prev => ({ ...prev, img: jsonResp.uj_fajlnev }));
                    setPreviewUrl(null);
                    setSelectedFile(null);
                }

                setTimeout(() => setMessage(null), 3000);
            } else {
                const errorText = await response.text();
                console.error("Backend hiba:", errorText);
                setMessage({ type: 'error', text: `Hiba: ${errorText}` });
            }
        })
        .catch(error => {
            console.error(error);
            setMessage({ type: 'error', text: 'Hálózati hiba történt.' });
        });
    };

    const handleDelete = () => {
        if (window.confirm("Biztosan törölni szeretnéd ezt a filmet?")) {
            fetch(`http://localhost:5083/api/Movie/DeleteMovie/${id}`, {
                method: 'DELETE'
            })
            .then(response => {
                if (response.ok) {
                    alert("Film sikeresen törölve!");
                    navigate('/admin');
                } else {
                    alert("Hiba történt a törlés során.");
                }
            })
            .catch(error => {
                alert("Hálózati hiba történt.");
            });
        }
    };

    if (loading) {
        return (
            <div className="app-container">
                <div style={{ color: '#c79c0f', fontSize: '1.5rem' }}>Film betöltése...</div>
            </div>
        );
    }

    const displayCreatedAt = movieData.created_at ? movieData.created_at.replace('T', ' ').substring(0, 19) : '-';

    let imageSrc = null;
    if (previewUrl) {
        imageSrc = previewUrl;
    } else if (movieData.img) {
        if (movieData.img.startsWith('http')) {
             imageSrc = movieData.img;
        } else {
             imageSrc = `${CLOUDINARY_BASE}${movieData.img}`;
        }
    }

    return (
        <div className="movie-details-page">
            <Link to="/admin" className="back-to-home movie-details-back">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} width={20} height={20}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
                Vissza az admin felületre
            </Link>

            <div className="movie-details-container">
                <h2 className="register-title movie-details-title">
                    Film szerkesztése
                </h2>

                {message && (
                    <div className={`register-message ${message.type}`} style={{ marginBottom: '20px' }}>
                        {message.text}
                    </div>
                )}

                <div className="movie-details-row movie-details-top-row">
                    <div style={{ 
                        width: '120px', 
                        height: '180px', 
                        backgroundColor: '#111', 
                        border: '1px solid #444', 
                        borderRadius: '8px', 
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        position: 'relative'
                    }}>
                        {imageSrc ? (
                            <img 
                                src={imageSrc} 
                                alt="Borítókép" 
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                onError={(e) => {e.target.style.display='none'}} 
                            />
                        ) : (
                            <span style={{color: '#666', fontSize: '0.8rem'}}>Nincs kép</span>
                        )}
                    </div>

                    <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                        <label style={{ color: '#c79c0f', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>
                            Borítókép cseréje
                        </label>
                        
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="form-input"
                            style={{ padding: '10px' }}
                        />
                        
                        <small style={{color: '#888', marginTop: '5px', display: 'block'}}>
                            Válassz új képet a cseréhez. A mentés gomb megnyomásakor kerül feltöltésre a szerverre.
                        </small>
                    </div>
                </div>

                <div className="movie-details-row">
                    <div className="form-group" style={{ flex: 1 }}>
                        <label style={{ color: '#c79c0f', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Movie ID</label>
                        <input
                            type="text"
                            value={movieData.movie_id}
                            disabled
                            className="form-input"
                            style={{ backgroundColor: '#222', color: '#666', borderColor: '#444', cursor: 'not-allowed' }}
                        />
                    </div>
                    
                    <div className="form-group" style={{ flex: 1 }}>
                        <label style={{ color: '#c79c0f', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Megjelenés dátuma</label>
                        <input
                            type="date"
                            name="release_date"
                            value={movieData.release_date}
                            onChange={handleInputChange}
                            className="form-input"
                            style={{ colorScheme: 'dark' }}
                        />
                    </div>
                </div>

                <div className="movie-details-row">
                    <div className="form-group" style={{ flex: 2 }}>
                        <label style={{ color: '#c79c0f', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Film Címe</label>
                        <input
                            type="text"
                            name="title"
                            value={movieData.title}
                            onChange={handleInputChange}
                            className="form-input"
                        />
                    </div>

                    <div className="form-group" style={{ flex: 1 }}>
                        <label style={{ color: '#c79c0f', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Műfaj</label>
                        <input
                            type="text"
                            name="genre"
                            value={movieData.genre}
                            onChange={handleInputChange}
                            className="form-input"
                        />
                    </div>
                </div>

                <div className="movie-details-row">
                    <div className="form-group" style={{ flex: 1 }}>
                        <label style={{ color: '#c79c0f', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Hossz (perc)</label>
                        <input
                            type="number"
                            name="duration"
                            value={movieData.duration}
                            onChange={handleInputChange}
                            className="form-input"
                        />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                        <label style={{ color: '#c79c0f', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Korhatár / Típus</label>
                        <input
                            type="text"
                            name="rating"
                            value={movieData.rating}
                            onChange={handleInputChange}
                            className="form-input"
                            placeholder="Pl. PG-13"
                        />
                    </div>
                </div>

                <div className="form-group movie-details-description-group">
                    <label style={{ color: '#c79c0f', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Leírás</label>
                    <textarea
                        name="description"
                        value={movieData.description}
                        onChange={handleInputChange}
                        className="form-input"
                        style={{ resize: 'vertical', fontFamily: 'inherit', lineHeight: '1.5' }}
                    />
                </div>

                <div className="form-group movie-details-created-group">
                    <label style={{ color: '#888', fontSize: '0.9rem', display: 'block', marginBottom: '5px' }}>
                        Rendszeradat: Létrehozva (Nem módosítható)
                    </label>
                    <input
                        type="text"
                        value={displayCreatedAt}
                        disabled
                        className="form-input"
                        style={{ backgroundColor: '#1a1a1a', color: '#888', borderColor: '#333', fontSize: '0.9rem', cursor: 'default' }}
                    />
                </div>

                <div className="movie-details-actions">
                    <button 
                        onClick={handleSave}
                        className="reg-button movie-details-save"
                    >
                        Mentés
                    </button>

                    <button 
                        onClick={handleDelete}
                        className="delete-button movie-details-delete"
                    >
                        Film törlése
                    </button>
                </div>

            </div>
        </div>
    );
}

export default MovieDetails;
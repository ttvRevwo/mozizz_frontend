import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import '../App.css';

function MovieDetails() {
    const { id } = useParams(); 
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);
    const [originalData, setOriginalData] = useState(null);
    
    const [movieData, setMovieData] = useState({
        movie_id: '',
        title: '',
        genre: '',
        duration: '',
        rating: '',
        description: '',
        release_date: ''
    });

    useEffect(() => {
        const url = `http://localhost:5083/api/Movie/MovieById?id=${id}`;
        
        fetch(url)
            .then(res => {
                if (!res.ok) throw new Error(`Szerver hiba: ${res.status}`);
                return res.json();
            })
            .then(data => {
                const movie = data.data || data;
                setOriginalData(movie);
                
                let formattedDate = '';
                if (movie.release_date) {
                    formattedDate = movie.release_date.split('T')[0];
                } else if (movie.ReleaseDate) {
                    formattedDate = movie.ReleaseDate.split('T')[0];
                }

                setMovieData({
                    movie_id: movie.movie_id || movie.MovieId || movie.id,
                    title: movie.title || movie.Title || '',
                    genre: movie.genre || movie.Genre || '',
                    duration: movie.duration || movie.Duration || '',
                    rating: movie.rating || movie.Rating || '',
                    description: movie.description || movie.Description || '',
                    release_date: formattedDate
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

    const handleSave = () => {
        if (!originalData) return;

        let finalDateToSend = "2000-01-01T00:00:00";

        if (movieData.release_date) {
            finalDateToSend = `${movieData.release_date}T00:00:00`;
        }

        const bodyToSend = {
            MovieId: parseInt(movieData.movie_id), 
            Title: movieData.title,
            Genre: movieData.genre,
            Duration: parseInt(movieData.duration) || 0,
            Rating: movieData.rating,
            Description: movieData.description,
            ReleaseDate: finalDateToSend
        };

        console.log("Küldött adat (JSON):", JSON.stringify(bodyToSend)); 

        fetch('http://localhost:5083/api/Movie/ModifyMovie', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bodyToSend)
        })
        .then(async response => {
            if (response.ok) {
                // Sikeres válasz (200 OK)
                const textResp = await response.text(); 
                setMessage({ type: 'success', text: textResp || 'Sikeres mentés!' });
                setTimeout(() => setMessage(null), 3000);
            } else {
                // Hiba válasz (400 Bad Request)
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
            fetch(`http://localhost:5083/api/Movie/DelMovie?id=${id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
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

    return (
        <div className="app-container" style={{ flexDirection: 'column', justifyContent: 'center', padding: '40px 0' }}>
            <Link to="/admin" className="back-to-home" style={{ position: 'absolute', top: '20px', left: '20px' }}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} width={20} height={20}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
                Vissza az admin felületre
            </Link>

            <div className="register-container" style={{ maxWidth: '800px', width: '90%', borderColor: '#c79c0f', padding: '30px' }}>
                <h2 className="register-title" style={{ fontSize: '2rem', marginBottom: '30px', borderBottom: '1px solid #444', paddingBottom: '10px' }}>
                    Film szerkesztése
                </h2>

                {message && (
                    <div className={`register-message ${message.type}`} style={{ marginBottom: '20px' }}>
                        {message.text}
                    </div>
                )}

                <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
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

                <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
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

                <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
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

                <div className="form-group" style={{ marginBottom: '30px' }}>
                    <label style={{ color: '#c79c0f', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Leírás</label>
                    <textarea
                        name="description"
                        value={movieData.description}
                        onChange={handleInputChange}
                        className="form-input"
                        style={{ minHeight: '120px', resize: 'vertical', fontFamily: 'inherit', lineHeight: '1.5' }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
                    <button 
                        onClick={handleSave}
                        className="reg-button" 
                        style={{ flex: 1, margin: 0, fontSize: '1.1rem' }}
                    >
                        Mentés
                    </button>

                    <button 
                        onClick={handleDelete}
                        className="delete-button"
                        style={{ flex: 1, margin: 0 }}
                    >
                        Film törlése
                    </button>
                </div>
            </div>
        </div>
    );
}

export default MovieDetails;
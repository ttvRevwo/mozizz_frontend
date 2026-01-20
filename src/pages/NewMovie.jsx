import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/newmoviestyle.css';

const NewMovie = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    
    // Az űrlap adatai
    const [formData, setFormData] = useState({
        Title: '',
        Description: '',
        Genre: '',
        ReleaseDate: '',
        Director: '',
        Rating: '' // Most már szöveges lesz (pl. "R")
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);

        // Adatok előkészítése
        const payload = {
            ...formData,
            // Dátum formázása: YYYY-MM-DD -> YYYY-MM-DDT00:00:00
            ReleaseDate: formData.ReleaseDate ? `${formData.ReleaseDate}T00:00:00` : null,
            // A Rating most már sima string, nem kell átalakítani
        };

        // API hívás
        fetch('http://localhost:5083/api/Movie/NewMovie', { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        })
        .then(response => {
            if (response.ok) {
                alert('Film sikeresen létrehozva!');
                navigate('/admin');
            } else {
                alert('Hiba történt a mentés során.');
            }
        })
        .catch(error => console.error('Hiba:', error))
        .finally(() => setLoading(false));
    };

    return (
        <div className="new-movie-page">
            <div className="new-movie-container">
                
                <h2 className="new-movie-title">Új film felvétele</h2>

                <form onSubmit={handleSubmit} className="new-movie-form">
                    
                    {/* Cím */}
                    <div className="form-group">
                        <label>Cím</label>
                        <input 
                            type="text" 
                            name="Title" 
                            value={formData.Title} 
                            onChange={handleChange} 
                            required 
                            placeholder="Pl. A Keresztapa"
                        />
                    </div>

                    {/* Műfaj */}
                    <div className="form-group">
                        <label>Műfaj</label>
                        <input 
                            type="text" 
                            name="Genre" 
                            value={formData.Genre} 
                            onChange={handleChange} 
                            required 
                            placeholder="Pl. Dráma, Akció"
                        />
                    </div>

                    {/* Rendező */}
                    <div className="form-group">
                        <label>Rendező</label>
                        <input 
                            type="text" 
                            name="Director" 
                            value={formData.Director} 
                            onChange={handleChange} 
                            required 
                            placeholder="Rendező neve"
                        />
                    </div>

                    {/* Rating (Korhatár) - JAVÍTVA: Szöveges mező */}
                    <div className="form-group">
                        <label>Korhatár besorolás (Rating)</label>
                        <input 
                            type="text" 
                            name="Rating" 
                            value={formData.Rating} 
                            onChange={handleChange} 
                            required 
                            placeholder="Pl. R, PG-13, 16+"
                        />
                    </div>

                    {/* Megjelenés Dátuma */}
                    <div className="form-group full-width-mobile">
                        <label>Megjelenés dátuma</label>
                        <input 
                            type="date" 
                            name="ReleaseDate" 
                            value={formData.ReleaseDate} 
                            onChange={handleChange} 
                            required 
                        />
                    </div>

                    {/* Leírás */}
                    <div className="form-group full-width">
                        <label>Leírás</label>
                        <textarea 
                            name="Description" 
                            value={formData.Description} 
                            onChange={handleChange} 
                            rows="5"
                            required
                            placeholder="A film rövid leírása..."
                        />
                    </div>

                    {/* Gombok */}
                    <div className="button-group">
                        <Link to="/admin" className="cancel-btn">
                            Mégse
                        </Link>
                        
                        <button type="submit" className="save-btn" disabled={loading}>
                            {loading ? 'Mentés...' : 'Mentés'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewMovie;
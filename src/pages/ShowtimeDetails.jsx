import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import '../styles/ShowtimeDetailsStyle.css';

const ShowtimeDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        showtimeId: id,
        movieId: '',
        hallId: '',
        showDate: '',
        showTime1: '',
        createdAt: ''
    });

    const [movies, setMovies] = useState([]);
    const [halls, setHalls] = useState([]);
    
    const [originalData, setOriginalData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [resShow, resMovies, resHalls] = await Promise.all([
                    fetch(`http://localhost:5083/api/Showtime/GetById/${id}`),
                    fetch('http://localhost:5083/api/Movie/GetMovies'),
                    fetch('http://localhost:5083/api/Hall/GetAllHall')
                ]);

                if (!resShow.ok) throw new Error("A vetítés nem található (vagy adatbázis hiba).");
                
                const showData = await resShow.json();
                const moviesData = await resMovies.json();
                const hallsData = await resHalls.json();

                const moviesList = Array.isArray(moviesData) ? moviesData : (moviesData.data || []);
                const hallsList = Array.isArray(hallsData) ? hallsData : (hallsData.data || []);

                setMovies(moviesList);
                setHalls(hallsList);
                setOriginalData(showData);

                const rawDate = showData.date || showData.Date || showData.showDate;
                const dateVal = rawDate ? rawDate.split('T')[0] : '';

                const rawTime = showData.time || showData.Time || showData.showTime1;
                const timeVal = rawTime ? rawTime.toString().substring(0, 5) : '';

                const foundMovie = moviesList.find(m => m.title === (showData.movieTitle || showData.MovieTitle));
                const foundHall = hallsList.find(h => h.name === (showData.hallName || showData.HallName));

                setFormData({
                    showtimeId: id,
                    movieId: foundMovie ? (foundMovie.id || foundMovie.movieId) : '',
                    hallId: foundHall ? (foundHall.hallId) : '',
                    showDate: dateVal,
                    showTime1: timeVal,
                    createdAt: showData.createdAt || new Date().toISOString()
                });

            } catch (err) {
                console.error(err);
                setError("Hiba történt az adatok betöltésekor: " + err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const stripLists = (obj) => {
        if (!obj) return null;
        const cleanObj = { ...obj };
        
        Object.keys(cleanObj).forEach(key => {
            if (Array.isArray(cleanObj[key])) {
                delete cleanObj[key];
            }
            if (key.toLowerCase().includes('showtime') || 
                key.toLowerCase().includes('reservation') || 
                key.toLowerCase().includes('collection')) {
                delete cleanObj[key];
            }
        });
        
        if (cleanObj.createdAt) cleanObj.createdAt = new Date().toISOString();
        
        return cleanObj;
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        if(!formData.movieId || !formData.hallId || !formData.showDate || !formData.showTime1) {
            setError("Minden mezőt ki kell tölteni!");
            setSaving(false);
            return;
        }

        const selectedMovie = movies.find(m => (m.id || m.movieId) == formData.movieId);
        const selectedHall = halls.find(h => h.hallId == formData.hallId);

        if (!selectedMovie || !selectedHall) {
            setError("Hiba: A kiválasztott film vagy terem adatai nem találhatók.");
            setSaving(false);
            return;
        }

        const safeMovie = stripLists(selectedMovie);
        const safeHall = stripLists(selectedHall);

        const payload = {
            showtimeId: parseInt(id),
            movieId: parseInt(formData.movieId),
            hallId: parseInt(formData.hallId),
            
            showDate: formData.showDate,
            showTime1: formData.showTime1.length === 5 ? formData.showTime1 + ":00" : formData.showTime1,
            
            createdAt: formData.createdAt || new Date().toISOString(),

            movie: safeMovie,
            hall: safeHall
        };

        console.log("Mentés payload:", payload);

        try {
            const res = await fetch(`http://localhost:5083/api/Showtime/ModifyShowtime`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => null);
                if (errorData && errorData.errors) {
                    const messages = Object.values(errorData.errors).flat().join(", ");
                    throw new Error(messages || "Validációs hiba történt.");
                }
                const txt = await res.text();
                if (txt.includes("<!DOCTYPE html>")) throw new Error("Szerver hiba (500).");
                throw new Error(txt || "Sikertelen mentés.");
            }

            alert("Vetítés sikeresen módosítva!");
            navigate('/admin');

        } catch (err) {
            console.error("Mentési hiba:", err);
            setError("Hiba: " + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if(window.confirm("Biztosan törölni szeretnéd ezt a vetítést?")) {
             try {
                const res = await fetch(`http://localhost:5083/api/Showtime/DeleteShowtime/${id}`, {
                    method: 'DELETE'
                });
                
                if(res.ok) {
                    alert("Törölve.");
                    navigate('/admin');
                } else {
                    alert("Hiba a törlésnél.");
                }
             } catch(err) {
                 alert("Szerver hiba.");
             }
        }
    };

    if (loading) return <div className="sd-loading">Betöltés...</div>;
    if (error && !formData.movieId) return (
        <div className="sd-error-page">
            {error} <br/>
            <Link to="/admin">Vissza</Link>
        </div>
    );

    return (
        <div className="sd-page">
            <div className="sd-container">
                <div className="sd-header">
                    <div>
                        <h2>Vetítés Szerkesztése</h2>
                        {originalData && <small className="sd-subtitle">{originalData.movieTitle || originalData.MovieTitle}</small>}
                    </div>
                    <Link to="/admin" className="sd-back-btn">Mégse</Link>
                </div>

                {error && <div className="sd-error-msg">{error}</div>}

                <form onSubmit={handleSave} className="sd-form">
                    
                    <div className="sd-form-group">
                        <label>Film:</label>
                        <select 
                            name="movieId" 
                            value={formData.movieId} 
                            onChange={handleChange}
                            required
                        >
                            <option value="">Válassz filmet...</option>
                            {movies.map(m => (
                                <option key={m.id || m.movieId} value={m.id || m.movieId}>
                                    {m.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="sd-form-group">
                        <label>Terem:</label>
                        <select 
                            name="hallId" 
                            value={formData.hallId} 
                            onChange={handleChange}
                            required
                        >
                            <option value="">Válassz termet...</option>
                            {halls.map(h => (
                                <option key={h.hallId} value={h.hallId}>
                                    {h.name} (Férőhely: {h.seatingCapacity})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="sd-row">
                        <div className="sd-form-group half">
                            <label>Dátum:</label>
                            <input 
                                type="date" 
                                name="showDate" 
                                value={formData.showDate} 
                                onChange={handleChange} 
                                required 
                            />
                        </div>

                        <div className="sd-form-group half">
                            <label>Időpont:</label>
                            <input 
                                type="time" 
                                name="showTime1" 
                                value={formData.showTime1} 
                                onChange={handleChange} 
                                required 
                            />
                        </div>
                    </div>

                    <div className="sd-actions">
                        <button type="button" className="sd-delete-btn" onClick={handleDelete}>
                            Vetítés Törlése
                        </button>
                        <button type="submit" className="sd-save-btn" disabled={saving}>
                            {saving ? "Mentés..." : "Módosítások Mentése"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ShowtimeDetails;
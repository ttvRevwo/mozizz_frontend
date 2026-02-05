import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import '../Styles/ShowtimesStyle.css'; 

const Showtimes = () => {
    const { id } = useParams();y
    const navigate = useNavigate();
    const isEditMode = id && id !== 'new';

    const [formData, setFormData] = useState({
        movieId: '',
        hallId: '',
        showDate: '',
        showTime1: ''
    });

    const [movies, setMovies] = useState([]);
    const [halls, setHalls] = useState([]);
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadResources = async () => {
            try {
                const [resMovies, resHalls] = await Promise.all([
                    fetch('http://localhost:5083/api/Movie/GetMovies'),
                    fetch('http://localhost:5083/api/Hall/GetAllHall') 
                ]);
                
                const moviesData = await resMovies.json();
                const hallsData = await resHalls.json();

                setMovies(Array.isArray(moviesData) ? moviesData : (moviesData.data || []));
                setHalls(Array.isArray(hallsData) ? hallsData : (hallsData.data || []));

                if (isEditMode) {
                    const resShow = await fetch(`http://localhost:5083/api/Showtime/GetById/${id}`);
                    if (!resShow.ok) throw new Error("Nem található a vetítés.");
                    const showData = await resShow.json();
                    
                    const rawDate = showData.date || showData.Date || showData.showDate;
                    const dateVal = rawDate ? rawDate.split('T')[0] : '';
                    
                    const rawTime = showData.time || showData.Time || showData.showTime1;
                    const timeVal = rawTime ? rawTime.toString().substring(0, 5) : '';

                    setFormData({
                        movieId: moviesData.find(m => m.title === (showData.movieTitle || showData.MovieTitle))?.movieId || '',
                        hallId: hallsData.find(h => h.name === (showData.hallName || showData.HallName))?.hallId || '',
                        
                        showDate: dateVal,
                        showTime1: timeVal
                    });
                }
            } catch (err) {
                console.error(err);
                setError("Hiba az adatok betöltésekor. (Ellenőrizd a backend futását)");
            } finally {
                setLoading(false);
            }
        };

        loadResources();
    }, [id, isEditMode]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        const url = isEditMode 
            ? `http://localhost:5083/api/Showtime/ModifyShowtime`
            : `http://localhost:5083/api/Showtime/NewShowtime`;
        
        const method = isEditMode ? 'PUT' : 'POST';

        const payload = {
            movieId: parseInt(formData.movieId),
            hallId: parseInt(formData.hallId),
            showDate: formData.showDate,
            showTime1: formData.showTime1 + ":00",
            
            ...(isEditMode && { showtimeId: parseInt(id) })
        };

        try {
            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const txt = await res.text();
                throw new Error(txt || "Mentés sikertelen");
            }

            alert(isEditMode ? "Vetítés frissítve!" : "Új vetítés létrehozva!");
            navigate('/admin'); 

        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="st-page">Betöltés...</div>;

    return (
        <div className="st-page">
            <div className="st-container">
                <div className="st-header">
                    <h2>{isEditMode ? "Vetítés Szerkesztése" : "Új Vetítés Létrehozása"}</h2>
                    <Link to="/admin" className="st-back-btn">Mégse</Link>
                </div>

                {error && <div className="st-error">{error}</div>}

                <form onSubmit={handleSubmit} className="st-form">
                    
                    <div className="form-group">
                        <label>Film Kiválasztása:</label>
                        <select 
                            name="movieId" 
                            value={formData.movieId} 
                            onChange={handleChange}
                            required
                        >
                            <option value="">-- Válassz filmet --</option>
                            {movies.map(m => (
                                <option key={m.id || m.movieId} value={m.id || m.movieId}>
                                    {m.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Terem:</label>
                        <select 
                            name="hallId" 
                            value={formData.hallId} 
                            onChange={handleChange}
                            required
                        >
                            <option value="">-- Válassz termet --</option>
                            {halls.map(h => (
                                <option key={h.hallId} value={h.hallId}>
                                    {h.name} (Helyek: {h.seatingCapacity})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group half">
                        <label>Dátum:</label>
                        <input 
                            type="date" 
                            name="showDate" 
                            value={formData.showDate} 
                            onChange={handleChange} 
                            required 
                        />
                    </div>

                    <div className="form-group half">
                        <label>Kezdés Időpontja:</label>
                        <input 
                            type="time" 
                            name="showTime1" 
                            value={formData.showTime1} 
                            onChange={handleChange} 
                            required 
                        />
                    </div>

                    <button type="submit" className="st-save-btn" disabled={saving}>
                        {saving ? "Mentés..." : "Mentés"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Showtimes;
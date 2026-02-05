import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/NewShowtimeStyle.css';

const NewShowtime = () => {
    const navigate = useNavigate();

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
        const fetchOptions = async () => {
            try {
                const [resMovies, resHalls] = await Promise.all([
                    fetch('http://localhost:5083/api/Movie/GetMovies'),
                    fetch('http://localhost:5083/api/Hall/GetAllHall')
                ]);

                const moviesData = await resMovies.json();
                const hallsData = await resHalls.json();

                setMovies(Array.isArray(moviesData) ? moviesData : (moviesData.data || []));
                setHalls(Array.isArray(hallsData) ? hallsData : (hallsData.data || []));

            } catch (err) {
                console.error("Betöltési hiba:", err);
                setError("Nem sikerült betölteni a listákat.");
            } finally {
                setLoading(false);
            }
        };

        fetchOptions();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
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
            setError("Hiba: A kiválasztott film vagy terem nem található.");
            setSaving(false);
            return;
        }

        const now = new Date().toISOString();

        const moviePayload = { ...selectedMovie };
        moviePayload.movieId = parseInt(formData.movieId);
        delete moviePayload.showtimes; 
        delete moviePayload.reservations;
        
        const hallPayload = { ...selectedHall };
        hallPayload.hallId = parseInt(formData.hallId);
        delete hallPayload.seats;
        delete hallPayload.showtimes;

        const payload = {
            showtimeId: 0,
            
            movieId: parseInt(formData.movieId),
            hallId: parseInt(formData.hallId),
            
            showDate: formData.showDate,
            showTime1: formData.showTime1.length === 5 ? formData.showTime1 + ":00" : formData.showTime1,
            createdAt: now,
            
            reservations: [],

            movie: moviePayload,
            hall: hallPayload
        };

        console.log("Küldött adat:", payload);

        try {
            const res = await fetch('http://localhost:5083/api/Showtime/NewShowtime', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const responseText = await res.text();
                try {
                    const errorData = JSON.parse(responseText);
                    if (errorData.errors) {
                         const messages = Object.entries(errorData.errors)
                            .map(([key, msgs]) => `${key}: ${msgs.join(', ')}`)
                            .join("\n");
                        throw new Error(messages);
                    }
                    if (errorData.title) throw new Error(errorData.title);
                } catch (e) {
                }
                throw new Error(responseText || "Sikertelen mentés.");
            }

            alert("Új vetítés sikeresen létrehozva!");
            navigate('/admin');

        } catch (err) {
            console.error("Mentési hiba:", err);
            setError("Hiba: " + err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="ns-loading">Adatok betöltése...</div>;

    return (
        <div className="ns-page">
            <div className="ns-container">
                <div className="ns-header">
                    <h2>Új Vetítés Létrehozása</h2>
                    <Link to="/admin" className="ns-back-btn">Mégse</Link>
                </div>

                {error && <div className="ns-error-msg" style={{whiteSpace: 'pre-wrap'}}>{error}</div>}

                <form onSubmit={handleSave} className="ns-form">
                    
                    <div className="ns-form-group">
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

                    <div className="ns-form-group">
                        <label>Terem Kiválasztása:</label>
                        <select 
                            name="hallId" 
                            value={formData.hallId} 
                            onChange={handleChange}
                            required
                        >
                            <option value="">-- Válassz termet --</option>
                            {halls.map(h => (
                                <option key={h.hallId} value={h.hallId}>
                                    {h.name} (Férőhely: {h.seatingCapacity})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="ns-row">
                        <div className="ns-form-group half">
                            <label>Dátum:</label>
                            <input 
                                type="date" 
                                name="showDate" 
                                value={formData.showDate} 
                                onChange={handleChange} 
                                required 
                            />
                        </div>

                        <div className="ns-form-group half">
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

                    <div className="ns-actions">
                        <button type="submit" className="ns-save-btn" disabled={saving}>
                            {saving ? "Mentés..." : "Létrehozás"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewShowtime;
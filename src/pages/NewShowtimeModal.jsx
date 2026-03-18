import React, { useState, useEffect } from 'react';
import { authFetch } from '../utils/auth';

const NewShowtimeModal = ({ onClose, onSaved }) => {
    const [movies,  setMovies]  = useState([]);
    const [halls,   setHalls]   = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving,  setSaving]  = useState(false);
    const [error,   setError]   = useState(null);

    const [formData, setFormData] = useState({
        movieId:   '',
        hallId:    '',
        showDate:  '',
        showTime1: ''
    });

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const [resMovies, resHalls] = await Promise.all([
                    authFetch('http://localhost:5083/api/Movie/GetMovies'),
                    authFetch('http://localhost:5083/api/Hall/GetAllHall')
                ]);
                const moviesData = await resMovies.json();
                const hallsData  = await resHalls.json();
                setMovies(Array.isArray(moviesData) ? moviesData : (moviesData.data || []));
                setHalls(Array.isArray(hallsData)   ? hallsData  : (hallsData.data  || []));
            } catch (err) {
                setError('Nem sikerült betölteni a listákat.');
            } finally {
                setLoading(false);
            }
        };
        fetchOptions();
    }, []);

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.movieId || !formData.hallId || !formData.showDate || !formData.showTime1) {
            setError('Minden mezőt ki kell tölteni!');
            return;
        }
        setSaving(true);
        setError(null);

        const selectedMovie = movies.find(m => String(m.id || m.movieId) === String(formData.movieId));
        const selectedHall  = halls.find(h => String(h.hallId) === String(formData.hallId));

        if (!selectedMovie || !selectedHall) {
            setError('Hiba: A kiválasztott film vagy terem nem található.');
            setSaving(false);
            return;
        }

        const moviePayload = { ...selectedMovie, movieId: parseInt(formData.movieId) };
        delete moviePayload.showtimes;
        delete moviePayload.reservations;

        const hallPayload = { ...selectedHall, hallId: parseInt(formData.hallId) };
        delete hallPayload.seats;
        delete hallPayload.showtimes;

        const payload = {
            showtimeId: 0,
            movieId:    parseInt(formData.movieId),
            hallId:     parseInt(formData.hallId),
            showDate:   formData.showDate,
            showTime1:  formData.showTime1.length === 5 ? formData.showTime1 + ':00' : formData.showTime1,
            createdAt:  new Date().toISOString(),
            reservations: [],
            movie: moviePayload,
            hall:  hallPayload
        };

        try {
            const res = await authFetch('http://localhost:5083/api/Showtime/NewShowtime', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                onSaved();
                onClose();
            } else if (res.status === 401) {
                setError('Nincs jogosultság. Jelentkezz be újra admin fiókkal.');
            } else {
                const responseText = await res.text();
                try {
                    const errorData = JSON.parse(responseText);
                    if (errorData.errors) {
                        setError(Object.entries(errorData.errors).map(([k, v]) => `${k}: ${v.join(', ')}`).join('\n'));
                        return;
                    }
                    setError(errorData.title || responseText || 'Sikertelen mentés.');
                } catch {
                    setError(responseText || 'Sikertelen mentés.');
                }
            }
        } catch (err) {
            setError('Szerver hiba: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="buffet-modal-overlay" onClick={onClose}>
            <div className="buffet-modal" style={{ width: '500px' }} onClick={e => e.stopPropagation()}>

                <div className="buffet-modal-header">
                    <h3>Új vetítés létrehozása</h3>
                    <button className="buffet-modal-close" onClick={onClose}>✕</button>
                </div>

                {loading ? (
                    <div className="buffet-modal-body">
                        <p style={{ color: '#888', textAlign: 'center', padding: '30px' }}>Betöltés...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="buffet-modal-body">

                            <label className="buffet-modal-label">Film kiválasztása *</label>
                            <select
                                className="buffet-modal-input"
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

                            <label className="buffet-modal-label">Terem kiválasztása *</label>
                            <select
                                className="buffet-modal-input"
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

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <div style={{ flex: 1 }}>
                                    <label className="buffet-modal-label">Dátum *</label>
                                    <input
                                        className="buffet-modal-input"
                                        type="date"
                                        name="showDate"
                                        value={formData.showDate}
                                        onChange={handleChange}
                                        required
                                        style={{ colorScheme: 'dark' }}
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label className="buffet-modal-label">Időpont *</label>
                                    <input
                                        className="buffet-modal-input"
                                        type="time"
                                        name="showTime1"
                                        value={formData.showTime1}
                                        onChange={handleChange}
                                        required
                                        style={{ colorScheme: 'dark' }}
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="buffet-modal-error" style={{ whiteSpace: 'pre-wrap' }}>{error}</div>
                            )}
                        </div>

                        <div className="buffet-modal-footer">
                            <button type="button" className="details-button" onClick={onClose} disabled={saving}>Mégse</button>
                            <button
                                type="submit"
                                className="details-button"
                                style={{ backgroundColor: saving ? '#555' : '#005f73', color: 'white' }}
                                disabled={saving}
                            >
                                {saving ? 'Mentés...' : 'Vetítés létrehozása'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default NewShowtimeModal;
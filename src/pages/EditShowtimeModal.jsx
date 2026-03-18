import React, { useState, useEffect } from 'react';
import { authFetch } from '../utils/auth';

const EditShowtimeModal = ({ showtimeId, onClose, onSaved }) => {
    const [movies,       setMovies]       = useState([]);
    const [halls,        setHalls]        = useState([]);
    const [originalData, setOriginalData] = useState(null);
    const [loading,      setLoading]      = useState(true);
    const [saving,       setSaving]       = useState(false);
    const [error,        setError]        = useState(null);

    const [formData, setFormData] = useState({
        movieId:   '',
        hallId:    '',
        showDate:  '',
        showTime1: '',
        createdAt: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [resShow, resMovies, resHalls] = await Promise.all([
                    authFetch(`http://localhost:5083/api/Showtime/GetById/${showtimeId}`),
                    authFetch('http://localhost:5083/api/Movie/GetMovies'),
                    authFetch('http://localhost:5083/api/Hall/GetAllHall')
                ]);

                if (!resShow.ok) throw new Error('A vetítés nem található.');

                const showData   = await resShow.json();
                const moviesData = await resMovies.json();
                const hallsData  = await resHalls.json();

                const moviesList = Array.isArray(moviesData) ? moviesData : (moviesData.data || []);
                const hallsList  = Array.isArray(hallsData)  ? hallsData  : (hallsData.data  || []);

                setMovies(moviesList);
                setHalls(hallsList);
                setOriginalData(showData);

                const rawDate = showData.date || showData.Date || showData.showDate || '';
                const dateVal = rawDate ? rawDate.split('T')[0] : '';
                const rawTime = showData.time || showData.Time || showData.showTime1 || '';
                const timeVal = rawTime ? String(rawTime).substring(0, 5) : '';

                const foundMovie = moviesList.find(m => m.title === (showData.movieTitle || showData.MovieTitle));
                const foundHall  = hallsList.find(h  => h.name  === (showData.hallName  || showData.HallName));

                setFormData({
                    movieId:   foundMovie ? (foundMovie.id || foundMovie.movieId) : '',
                    hallId:    foundHall  ? foundHall.hallId : '',
                    showDate:  dateVal,
                    showTime1: timeVal,
                    createdAt: showData.createdAt || new Date().toISOString()
                });
            } catch (err) {
                setError('Hiba az adatok betöltésekor: ' + err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [showtimeId]);

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const stripLists = (obj) => {
        if (!obj) return null;
        const clean = { ...obj };
        Object.keys(clean).forEach(key => {
            if (Array.isArray(clean[key])) delete clean[key];
            if (key.toLowerCase().includes('showtime') ||
                key.toLowerCase().includes('reservation') ||
                key.toLowerCase().includes('collection')) delete clean[key];
        });
        clean.createdAt = new Date().toISOString();
        return clean;
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!formData.movieId || !formData.hallId || !formData.showDate || !formData.showTime1) {
            setError('Minden mezőt ki kell tölteni!');
            return;
        }
        setSaving(true);
        setError(null);

        const selectedMovie = movies.find(m => String(m.id || m.movieId) === String(formData.movieId));
        const selectedHall  = halls.find(h  => String(h.hallId) === String(formData.hallId));

        if (!selectedMovie || !selectedHall) {
            setError('Hiba: A kiválasztott film vagy terem nem található.');
            setSaving(false);
            return;
        }

        const payload = {
            showtimeId: parseInt(showtimeId),
            movieId:    parseInt(formData.movieId),
            hallId:     parseInt(formData.hallId),
            showDate:   formData.showDate,
            showTime1:  formData.showTime1.length === 5 ? formData.showTime1 + ':00' : formData.showTime1,
            createdAt:  formData.createdAt || new Date().toISOString(),
            movie: stripLists(selectedMovie),
            hall:  stripLists(selectedHall)
        };

        try {
            const res = await authFetch('http://localhost:5083/api/Showtime/ModifyShowtime', {
                method: 'PUT',
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
                        setError(Object.values(errorData.errors).flat().join(', '));
                        return;
                    }
                } catch {  }
                setError(responseText || 'Sikertelen mentés.');
            }
        } catch (err) {
            setError('Szerver hiba: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Biztosan törölni szeretnéd ezt a vetítést?')) return;
        try {
            const res = await authFetch(`http://localhost:5083/api/Showtime/DeleteShowtime/${showtimeId}`, { method: 'DELETE' });
            if (res.ok) {
                onSaved();
                onClose();
            } else if (res.status === 401) {
                setError('Nincs jogosultság a törléshez.');
            } else {
                setError('Hiba a törlésnél.');
            }
        } catch (err) {
            setError('Szerver hiba: ' + err.message);
        }
    };

    return (
        <div className="buffet-modal-overlay" onClick={onClose}>
            <div className="buffet-modal" style={{ width: '500px' }} onClick={e => e.stopPropagation()}>

                <div className="buffet-modal-header">
                    <h3>Vetítés szerkesztése</h3>
                    <button className="buffet-modal-close" onClick={onClose}>✕</button>
                </div>

                {loading ? (
                    <div className="buffet-modal-body">
                        <p style={{ color: '#888', textAlign: 'center', padding: '30px' }}>Betöltés...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSave}>
                        <div className="buffet-modal-body">
                            {originalData && (
                                <div style={{ marginBottom: '14px', padding: '8px 12px', background: 'rgba(224,170,62,0.08)', borderRadius: '6px', borderLeft: '3px solid #E0AA3E' }}>
                                    <span style={{ color: '#E0AA3E', fontSize: '0.8rem', fontWeight: 600 }}>
                                        {originalData.movieTitle || originalData.MovieTitle}
                                    </span>
                                    <span style={{ color: '#888', fontSize: '0.75rem', marginLeft: '8px' }}>
                                        #{showtimeId}
                                    </span>
                                </div>
                            )}

                            <label className="buffet-modal-label">Film *</label>
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

                            <label className="buffet-modal-label">Terem *</label>
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
                                <div className="buffet-modal-error">{error}</div>
                            )}
                        </div>

                        <div className="buffet-modal-footer" style={{ justifyContent: 'space-between' }}>
                            <button
                                type="button"
                                className="details-button"
                                style={{ backgroundColor: '#650f0f', color: 'white' }}
                                onClick={handleDelete}
                                disabled={saving}
                            >
                                Törlés
                            </button>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button type="button" className="details-button" onClick={onClose} disabled={saving}>Mégse</button>
                                <button
                                    type="submit"
                                    className="details-button"
                                    style={{ backgroundColor: saving ? '#555' : '#005f73', color: 'white' }}
                                    disabled={saving}
                                >
                                    {saving ? 'Mentés...' : 'Mentés'}
                                </button>
                            </div>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default EditShowtimeModal;
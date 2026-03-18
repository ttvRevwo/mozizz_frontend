import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const parseShowtimeDate = (dateRaw, timeRaw) => {
    if (!dateRaw || !timeRaw) return null;
    try {
        let isoDate = dateRaw;
        const huMatch = String(dateRaw).match(/(\d{4})[.\s]+(\d{1,2})[.\s]+(\d{1,2})/);
        if (huMatch) {
            isoDate = `${huMatch[1]}-${huMatch[2].padStart(2,'0')}-${huMatch[3].padStart(2,'0')}`;
        } else {
            const slashMatch = String(dateRaw).match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
            if (slashMatch) {
                isoDate = `${slashMatch[3]}-${slashMatch[1].padStart(2,'0')}-${slashMatch[2].padStart(2,'0')}`;
            }
        }
        return new Date(`${isoDate}T${String(timeRaw).substring(0, 5)}:00`);
    } catch { return null; }
};

const isShowtimeBookable = (dateRaw, timeRaw) => {
    const showDT = parseShowtimeDate(dateRaw, timeRaw);
    if (!showDT) return true;
    return new Date(showDT.getTime() + 30 * 60 * 1000) > new Date();
};

const getISODate = (dateRaw) => {
    if (!dateRaw) return '';
    const huMatch = String(dateRaw).match(/(\d{4})[.\s]+(\d{1,2})[.\s]+(\d{1,2})/);
    if (huMatch) return `${huMatch[1]}-${huMatch[2].padStart(2,'0')}-${huMatch[3].padStart(2,'0')}`;
    return String(dateRaw).split('T')[0];
};

const formatDateHU = (isoDate) => {
    const d = new Date(isoDate);
    if (isNaN(d.getTime())) return isoDate;
    return d.toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
};

const ShowtimeSelector = ({ movieId, movieTitle }) => {
    const navigate = useNavigate();
    const [showtimes, setShowtimes] = useState([]);
    const [loading,   setLoading]   = useState(true);
    const [error,     setError]     = useState(null);

    useEffect(() => {
        fetch('http://localhost:5083/api/Showtime/GetAllShowtimes')
            .then(res => res.json())
            .then(data => {
                const all = Array.isArray(data) ? data : (data.data || []);

                const filtered = all.filter(st => {
                    const stMovieId = st.movieId || st.MovieId || st.movie?.id;
                    if (stMovieId && String(stMovieId) === String(movieId)) return true;
                    const stTitle = st.movieTitle || st.MovieTitle || st.movie?.title;
                    if (stTitle && movieTitle) return stTitle.trim().toLowerCase() === movieTitle.trim().toLowerCase();
                    return false;
                });

                const bookable = filtered
                    .filter(st => isShowtimeBookable(st.date || st.Date, st.time || st.Time))
                    .sort((a, b) => {
                        const da = (a.date || a.Date || '') + (a.time || a.Time || '');
                        const db = (b.date || b.Date || '') + (b.time || b.Time || '');
                        return da.localeCompare(db);
                    });

                setShowtimes(bookable);
            })
            .catch(err => {
                console.error(err);
                setError('Nem sikerült betölteni az időpontokat.');
            })
            .finally(() => setLoading(false));
    }, [movieId, movieTitle]);

    if (loading) return <p className="st-status">Időpontok keresése...</p>;
    if (error)   return <p className="st-status error">{error}</p>;

    if (!showtimes.length) return (
        <div className="st-empty">
            Jelenleg nincs elérhető vetítés ehhez a filmhez.
            <small>A már elkezdett vagy 30 percen belül kezdődő vetítésekre nem lehet jegyet foglalni.</small>
        </div>
    );

    const todayISO = new Date().toISOString().split('T')[0];
    const grouped  = {};
    showtimes.forEach(st => {
        const key = getISODate(st.date || st.Date);
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(st);
    });

    const todaySlots   = grouped[todayISO] || [];
    const laterEntries = Object.entries(grouped).filter(([k]) => k !== todayISO);

    const renderSlotButtons = (slots) => (
        <div className="st-buttons">
            {slots.map(st => {
                const stId     = st.showtimeId || st.ShowtimeId || st.id;
                const timeRaw  = st.time  || st.Time;
                const hallName = st.hallName || st.HallName;
                const time     = timeRaw ? String(timeRaw).substring(0, 5) : '';

                return (
                    <button key={stId} className="st-btn" onClick={() => navigate(`/booking/${stId}`)}>
                        <span className="st-time">{time}</span>
                        {hallName && <span className="st-hall">{hallName}</span>}
                    </button>
                );
            })}
        </div>
    );

    const Divider = ({ label }) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <span style={{
                fontSize: '0.68rem', fontWeight: 700, letterSpacing: '1.5px',
                textTransform: 'uppercase', color: '#E0AA3E', whiteSpace: 'nowrap'
            }}>
                {label}
            </span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(224,170,62,0.15)' }} />
        </div>
    );

    const DateLabel = ({ isoDate }) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
            <span style={{
                fontSize: '0.75rem', fontWeight: 600, color: '#aaa',
                letterSpacing: '0.3px', whiteSpace: 'nowrap'
            }}>
                {formatDateHU(isoDate)}
            </span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
        </div>
    );

    return (
        <div className="st-selector">
            {todaySlots.length > 0 && (
                <div className="st-group">
                    <Divider label="🎬 Ma" />
                    {renderSlotButtons(todaySlots)}
                </div>
            )}

            {laterEntries.length > 0 && (
                <div className="st-group">
                    {todaySlots.length > 0 && <Divider label="📅 Közelgő vetítések" />}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {laterEntries.map(([dateKey, slots]) => (
                            <div key={dateKey}>
                                <DateLabel isoDate={dateKey} />
                                {renderSlotButtons(slots)}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShowtimeSelector;
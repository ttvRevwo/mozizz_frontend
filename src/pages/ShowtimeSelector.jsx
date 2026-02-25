import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ShowtimeSelector = ({ movieId, movieTitle }) => {
    const navigate = useNavigate();
    const [showtimes, setShowtimes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch('http://localhost:5083/api/Showtime/GetAllShowtimes')
            .then(res => res.json())
            .then(data => {
                const allShowtimes = Array.isArray(data) ? data : (data.data || []);
                
                const filtered = allShowtimes.filter(st => {
                    const stMovieId = st.movieId || st.MovieId || st.movie?.id;
                    if (stMovieId && String(stMovieId) === String(movieId)) {
                        return true;
                    }

                    const stTitle = st.movieTitle || st.MovieTitle || st.movie?.title;
                    if (stTitle && movieTitle) {
                        return stTitle.trim().toLowerCase() === movieTitle.trim().toLowerCase();
                    }

                    return false;
                });

                filtered.sort((a, b) => { 
                    const dateStrA = (a.date || a.Date || "") + (a.time || a.Time || "");
                    const dateStrB = (b.date || b.Date || "") + (b.time || b.Time || "");
                    
                    return dateStrA.localeCompare(dateStrB);
                });

                setShowtimes(filtered);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setError("Nem sikerült betölteni az időpontokat.");
                setLoading(false);
            });
    }, [movieId, movieTitle]);

    const handleSelect = (showtimeId) => {
        navigate(`/booking/${showtimeId}`);
    };

    if (loading) return <div style={{color: 'white', fontStyle: 'italic'}}>Időpontok keresése...</div>;
    if (error) return <div style={{color: '#ff6b6b'}}>{error}</div>;

    if (showtimes.length === 0) {
        return (
            <div style={{ 
                padding: '15px', 
                backgroundColor: 'rgba(255,255,255,0.05)', 
                borderRadius: '8px',
                color: '#aaa',
                border: '1px solid rgba(255,255,255,0.1)'
            }}>
                Jelenleg nincs meghirdetett vetítés ehhez a filmhez.
            </div>
        );
    }

    return (
        <div className="showtime-selector-container">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                {showtimes.map((st) => {
                    const stId = st.showtimeId || st.ShowtimeId || st.id;
                    const dateRaw = st.date || st.Date; 
                    const timeRaw = st.time || st.Time; 
                    const hallName = st.hallName || st.HallName;

                    const formattedTime = timeRaw ? timeRaw.substring(0, 5) : "";
                    
                    return (
                        <button 
                            key={stId}
                            onClick={() => handleSelect(stId)}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                padding: '12px 24px',
                                backgroundColor: '#e0aa3e',
                                color: '#1a1a1a',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 6px 12px rgba(224, 170, 62, 0.4)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.3)';
                            }}
                        >
                            <span style={{ fontSize: '1.2rem', fontWeight: '800', lineHeight: '1' }}>
                                {formattedTime}
                            </span>
                            <span style={{ fontSize: '0.85rem', marginTop: '4px', opacity: 0.9 }}>
                                {dateRaw}
                            </span>
                            {hallName && (
                                <span style={{ 
                                    fontSize: '0.75rem', 
                                    marginTop: '6px', 
                                    paddingTop: '4px',
                                    borderTop: '1px solid rgba(0,0,0,0.2)',
                                    width: '100%',
                                    textAlign: 'center'
                                }}>
                                    {hallName}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default ShowtimeSelector;
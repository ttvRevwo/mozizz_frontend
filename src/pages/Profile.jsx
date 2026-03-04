import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ProfileStyle.css'; 

const UserProfile = () => {
    const navigate = useNavigate();
    
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const currentUserId = 1; 

    useEffect(() => {
        const fetchReservations = async () => {
            try {
                const response = await fetch(`http://localhost:5083/api/Booking/GetUserReservations/${currentUserId}`);
                if (!response.ok) throw new Error("Nem sikerült betölteni a foglalásokat.");
                
                const data = await response.json();
                setReservations(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchReservations();
    }, [currentUserId]);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
        window.location.reload();
    };

    return (
        <div className="profile-page">
            <button className="profile-back-btn" onClick={() => navigate('/')}>
                ← Vissza a főoldalra
            </button>

            <div className="profile-container">
                <aside className="profile-sidebar">
                    <div className="profile-avatar">
                        <span>👤</span>
                    </div>
                    <h3>Saját Profil</h3>
                    <nav className="profile-nav">
                        <button className="nav-btn active">Saját jegyeim</button>
                        <button className="nav-btn logout-btn" onClick={handleLogout}>Kijelentkezés</button>
                    </nav>
                </aside>

                <main className="profile-content">
                    <h2>Lefoglalt jegyeim</h2>
                    
                    {loading && <p className="loading-text">Jegyeid betöltése folyamatban...</p>}
                    {error && <p className="error-text">Hiba: {error}</p>}

                    {!loading && !error && reservations.length === 0 && (
                        <div className="empty-reservations">
                            <p>Még nincsenek lefoglalt jegyeid.</p>
                            <button className="go-to-movies-btn" onClick={() => navigate('/')}>
                                Nézzük a filmeket!
                            </button>
                        </div>
                    )}

                    <div className="reservations-list">
                        {reservations.map(res => {
                            const showDate = new Date(res.date).toLocaleDateString('hu-HU', {
                                year: 'numeric', month: 'long', day: 'numeric'
                            });
                            const showTime = res.time ? res.time.substring(0, 5) : '';

                            return (
                                <div key={res.reservationId} className="reservation-card">
                                    <div className="res-header">
                                        <h3 className="res-movie-title">{res.movieTitle}</h3>
                                        <span className={`res-status ${res.status === 'confirmed' ? 'status-ok' : ''}`}>
                                            {res.status === 'confirmed' ? 'Véglegesítve' : res.status}
                                        </span>
                                    </div>
                                    <div className="res-details">
                                        <p><strong>Dátum:</strong> {showDate}</p>
                                        <p><strong>Időpont:</strong> {showTime}</p>
                                        <p><strong>Foglalt székek ({res.seats.length} db):</strong></p>
                                        <div className="res-seats-container">
                                            {res.seats.map(seatNum => (
                                                <span key={seatNum} className="res-seat-badge">{seatNum}   </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="res-footer">
                                        <small>Foglalás azonosító: #{res.reservationId}</small>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default UserProfile;
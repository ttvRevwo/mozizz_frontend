import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import '../styles/UserBookingsStyle.css';
import { authFetch } from '../utils/auth';

const UserBookings = () => {
    const { userId } = useParams();
    const [bookings, setBookings] = useState([]);
    const [userName, setUserName] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userRes = await authFetch(`http://localhost:5083/api/User/GetUser/${userId}`);
                if (userRes.ok) {
                    const userData = await userRes.json();
                    setUserName(userData.name || userData.username);
                }

                const res = await authFetch(`http://localhost:5083/api/Reservation/GetUserReservations/${userId}`);
                const data = await res.json();
                setBookings(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Hiba az adatok betöltésekor:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [userId]);

    if (loading) return <div className="loading-container"><div className="loader"></div></div>;

    return (
        <div className="bookings-page-container">
            <div className="bookings-header">
                <Link to="/admin" className="back-btn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 12H5M12 19l-7-7 7-7"/>
                    </svg>
                    Vissza az Adminhoz
                </Link>
                <h1><span>{userName}</span> foglalásai</h1>
            </div>

            {!bookings.length ? (
                <div className="no-bookings">
                    <p>Ennek a felhasználónak még nincs rögzített foglalása.</p>
                </div>
            ) : (
                <div className="bookings-grid">
                    {bookings.map((b) => (
                        <div key={b.reservationId} className="booking-card">
                            <div className="card-accent"></div>
                            <div className="booking-details">
                                <h3>{b.movieTitle}</h3>
                                <div className="info-row">
                                    <span className="label">Időpont:</span>
                                    <span className="value">{b.date} | {b.time}</span>
                                </div>
                                <div className="info-row">
                                    <span className="label">Székek:</span>
                                    <span className="value seats">{b.seats.join(', ')}</span>
                                </div>
                                <div className="info-row">
                                    <span className="label">Státusz:</span>
                                    <span className={`status-badge ${b.status?.toLowerCase() || 'active'}`}>
                                        {b.status || 'Aktív'}
                                    </span>
                                </div>
                            </div>
                            <div className="booking-id">#ID-{b.reservationId}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default UserBookings;
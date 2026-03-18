import React, { useState, useEffect } from 'react';
import { authFetch } from '../utils/auth';

const UserBookingsModal = ({ userId, userName, onClose }) => {
    const [bookings, setBookings] = useState([]);
    const [loading,  setLoading]  = useState(true);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const res = await authFetch(`http://localhost:5083/api/Booking/GetUserReservations/${userId}`);
                if (!res.ok) { setBookings([]); return; }
                const text = await res.text();
                if (!text) { setBookings([]); return; }
                const data = JSON.parse(text);
                setBookings(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error('Hiba a foglalások betöltésekor:', err);
                setBookings([]);
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, [userId]);

    return (
        <div className="buffet-modal-overlay" onClick={onClose}>
            <div className="buffet-modal" style={{ width: '580px' }} onClick={e => e.stopPropagation()}>

                <div className="buffet-modal-header">
                    <h3>{userName} foglalásai</h3>
                    <button className="buffet-modal-close" onClick={onClose}>✕</button>
                </div>

                <div className="buffet-modal-body" style={{ maxHeight: '460px', overflowY: 'auto' }}>
                    {loading ? (
                        <p style={{ color: '#888', textAlign: 'center', padding: '30px' }}>Betöltés...</p>
                    ) : !bookings.length ? (
                        <p style={{ color: '#888', textAlign: 'center', padding: '30px' }}>
                            Ennek a felhasználónak nincs foglalása.
                        </p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {bookings.map((b) => (
                                <div key={b.reservationId} style={{
                                    background: '#1f1f1f',
                                    border: '1px solid #333',
                                    borderLeft: '3px solid #E0AA3E',
                                    borderRadius: '8px',
                                    padding: '12px 16px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    gap: '12px'
                                }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ color: '#E0AA3E', fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px' }}>
                                            {b.movieTitle}
                                        </div>
                                        <div style={{ color: '#aaa', fontSize: '0.82rem', marginBottom: '4px' }}>
                                            {String(b.date).split('T')[0]} – {b.time}
                                        </div>
                                        <div style={{ color: '#ccc', fontSize: '0.82rem' }}>
                                            Székek: <strong>{b.seats.join(', ')}</strong>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                                        <span style={{
                                            fontSize: '0.72rem',
                                            padding: '3px 8px',
                                            borderRadius: '12px',
                                            background: b.status === 'Aktív' ? 'rgba(40,167,69,0.2)' : 'rgba(255,193,7,0.2)',
                                            color: b.status === 'Aktív' ? '#28a745' : '#ffc107',
                                            border: `1px solid ${b.status === 'Aktív' ? 'rgba(40,167,69,0.4)' : 'rgba(255,193,7,0.4)'}`,
                                        }}>
                                            {b.status || 'Rögzítve'}
                                        </span>
                                        <span style={{ fontSize: '0.7rem', color: '#555' }}>
                                            #ID-{b.reservationId}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="buffet-modal-footer">
                    <button className="details-button" onClick={onClose}>Bezárás</button>
                </div>
            </div>
        </div>
    );
};

export default UserBookingsModal;
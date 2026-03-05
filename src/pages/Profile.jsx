import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ProfileStyle.css';
import { authFetch } from '../utils/auth';

const TicketCard = ({ ticket }) => {
    const [flipped, setFlipped] = useState(false);

    const isUsed = ticket.isUsed || ticket.status === 'used';

    return (
        <div
            className={`ticket-flip-wrapper ${flipped ? 'flipped' : ''}`}
            onClick={() => setFlipped(f => !f)}
        >
            <div className="ticket-inner">

                <div className="ticket-face ticket-front">
                    {isUsed && <div className="ticket-used-stamp">FELHASZNÁLVA</div>}
                    <div className="ticket-punch ticket-punch-left"></div>
                    <div className="ticket-punch ticket-punch-right"></div>
                    <div className="ticket-perforated-line"></div>

                    <div className="ticket-stub">
                        <span className="ticket-stub-icon">🎬</span>
                        <span className="ticket-stub-code">{ticket.ticketCode?.slice(-4) ?? '----'}</span>
                    </div>

                    <div className="ticket-main">
                        <div className="ticket-top-row">
                            <span className="ticket-cinema-name">MOZIZZ</span>
                            <span className={`ticket-status-badge ${isUsed ? 'used' : 'valid'}`}>
                                {isUsed ? 'Lejárt' : 'Érvényes'}
                            </span>
                        </div>
                        <h3 className="ticket-movie-title">{ticket.movieTitle || 'Ismeretlen film'}</h3>
                        <div className="ticket-meta-grid">
                            <div className="ticket-meta-item">
                                <span className="meta-label">Kiállítva</span>
                                <span className="meta-value">
                                    {ticket.issuedDate
                                        ? new Date(ticket.issuedDate).toLocaleDateString('hu-HU', {
                                            year: 'numeric', month: 'short', day: 'numeric'
                                          })
                                        : '—'}
                                </span>
                            </div>
                            <div className="ticket-meta-item">
                                <span className="meta-label">Kód</span>
                                <span className="meta-value mono">{ticket.ticketCode?.slice(0, 8) ?? '—'}…</span>
                            </div>
                        </div>
                        <p className="ticket-flip-hint">Kattints a QR kódért →</p>
                    </div>
                </div>

                <div className="ticket-face ticket-back">
                    <div className="ticket-punch ticket-punch-left"></div>
                    <div className="ticket-punch ticket-punch-right"></div>
                    <div className="ticket-perforated-line"></div>

                    <div className="ticket-stub ticket-stub-back">
                        <span className="ticket-stub-icon">🎬</span>
                        <span className="ticket-stub-code">{ticket.ticketCode?.slice(-4) ?? '----'}</span>
                    </div>

                    <div className="ticket-main ticket-main-back">
                        <p className="ticket-qr-label">Szkenneld be a bejáratnál</p>
                        <div className="ticket-qr-wrapper">
                            <img
                                src={`https://quickchart.io/qr?text=${encodeURIComponent(ticket.ticketCode)}&size=110`}
                                alt="QR kód"
                                className="ticket-qr-img"
                            />
                        </div>
                        <p className="ticket-code-full mono">{ticket.ticketCode}</p>
                        <p className="ticket-flip-hint">← Vissza</p>
                    </div>
                </div>

            </div>
        </div>
    );
};

const UserProfile = () => {
    const navigate = useNavigate();
    const [tickets, setTickets]   = useState([]);
    const [loading, setLoading]   = useState(true);
    const [error,   setError]     = useState(null);

    const currentUserId = localStorage.getItem('userId');

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const response = await authFetch(
                    `http://localhost:5083/api/Ticket/MyTickets/${currentUserId}`
                );
                if (!response.ok) throw new Error("Nem sikerült betölteni a jegyeket.");
                const data = await response.json();
                setTickets(Array.isArray(data) ? data : []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchTickets();
    }, [currentUserId]);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
        window.location.reload();
    };

    const validCount = tickets.filter(t => !t.isUsed && t.status !== 'used').length;

    return (
        <div className="profile-page">
            <button className="profile-back-btn" onClick={() => navigate('/')}>
                ← Vissza a főoldalra
            </button>

            <div className="profile-container">
                <aside className="profile-sidebar">
                    <div className="profile-avatar"><span>👤</span></div>
                    <h3>Saját Profil</h3>

                    <div className="profile-stats">
                        <div className="stat-item">
                            <span className="stat-number">{tickets.length}</span>
                            <span className="stat-label">Összes jegy</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">{validCount}</span>
                            <span className="stat-label">Érvényes</span>
                        </div>
                    </div>

                    <nav className="profile-nav">
                        <button className="nav-btn active">Saját jegyeim</button>
                        <button className="nav-btn logout-btn" onClick={handleLogout}>Kijelentkezés</button>
                    </nav>
                </aside>

                <main className="profile-content">
                    <h2>Lefoglalt jegyeim</h2>

                    {loading && (
                        <div className="profile-loader-wrap">
                            <div className="profile-loader"></div>
                            <p>Jegyek betöltése...</p>
                        </div>
                    )}
                    {error && <p className="error-text">Hiba: {error}</p>}

                    {!loading && !error && tickets.length === 0 && (
                        <div className="empty-reservations">
                            <div className="empty-icon">🎟️</div>
                            <p>Még nincsenek jegyeid.</p>
                            <button className="go-to-movies-btn" onClick={() => navigate('/')}>
                                Nézzük a filmeket!
                            </button>
                        </div>
                    )}

                    <div className="tickets-grid">
                        {tickets.map(ticket => (
                            <TicketCard key={ticket.ticketCode} ticket={ticket} />
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default UserProfile;
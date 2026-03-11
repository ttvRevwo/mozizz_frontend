import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ProfileStyle.css';
import { authFetch } from '../utils/auth';

const TicketCard = ({ ticket, onCancel }) => {
    const [showQr, setShowQr] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const isUsed = ticket.isUsed || ticket.status === 'used' || ticket.status === 'Used';

    const showDateTime = (() => {
        if (!ticket.showDate) return null;
        const datePart = ticket.showDate.split('T')[0];
        const timePart = ticket.showTime ? ticket.showTime.slice(0, 5) : '00:00';
        const dt = new Date(`${datePart}T${timePart}:00`);
        return isNaN(dt.getTime()) ? null : dt;
    })();

    const isExpired = showDateTime ? showDateTime < new Date() : false;
    const twoHoursBefore = showDateTime ? new Date(showDateTime.getTime() - 2 * 60 * 60 * 1000) : null;
    const canCancel = !isUsed && !isExpired && twoHoursBefore && new Date() < twoHoursBefore;

    const handleCancel = async () => {
        if (!window.confirm('Biztosan lemondod ezt a foglalást?')) return;
        setCancelling(true);
        try {
            const res = await authFetch(
                `http://localhost:5083/api/Reservation/Cancel/${ticket.reservationId}`,
                { method: 'DELETE' }
            );
            if (!res.ok) {
                const data = await res.json();
                alert(data.uzenet ?? 'Hiba történt a lemondás során.');
                return;
            }
            onCancel(ticket.reservationId);
        } catch {
            alert('Hiba történt a lemondás során.');
        } finally {
            setCancelling(false);
        }
    };

    return (
        <div className={`ticket-card ${isUsed ? 'ticket-used' : ''}`}>
            {isUsed && <div className="ticket-used-stamp">FELHASZNÁLVA</div>}

            <div className="ticket-punch ticket-punch-left"></div>
            <div className="ticket-punch ticket-punch-right"></div>

            <div className="ticket-stub">
                <span className="ticket-stub-icon">🎬</span>
                <span className="ticket-stub-code">{ticket.ticketCode?.slice(-4) ?? '----'}</span>
            </div>

            <div className="ticket-perforated-line"></div>

            <div className="ticket-main">
                <div className="ticket-top-row">
                    <span className="ticket-cinema-name">MOZIZZ</span>
                    <span className={`ticket-status-badge ${isUsed ? 'used' : isExpired ? 'expired' : 'valid'}`}>
                        {isUsed ? 'Felhasznált' : isExpired ? 'Lejárt' : 'Érvényes'}
                    </span>
                </div>

                <h3 className="ticket-movie-title">{ticket.movieTitle || 'Ismeretlen film'}</h3>

                <div className="ticket-meta-grid">
                    <div className="ticket-meta-item">
                        <span className="meta-label">Kiállítva</span>
                        <span className="meta-value">
                            {ticket.issuedDate
                                ? new Date(ticket.issuedDate).toLocaleDateString('hu-HU', { year: 'numeric', month: 'short', day: 'numeric' })
                                : '—'}
                        </span>
                    </div>
                    <div className="ticket-meta-item">
                        <span className="meta-label">Vetítés</span>
                        <span className="meta-value">
                            {ticket.showDate
                                ? new Date(ticket.showDate).toLocaleDateString('hu-HU', { month: 'short', day: 'numeric' })
                                : '—'}
                            {ticket.showTime ? ` ${ticket.showTime.slice(0, 5)}` : ''}
                        </span>
                    </div>
                </div>

                {ticket.seats?.length > 0 && (
                    <div className="ticket-seats">
                        {ticket.seats.map(s => (
                            <span key={s} className="ticket-seat-badge">{s}</span>
                        ))}
                    </div>
                )}

                <div className="ticket-actions-row">
                    {canCancel && (
                        <button
                            className="ticket-cancel-btn"
                            onClick={handleCancel}
                            disabled={cancelling}
                        >
                            {cancelling ? 'Lemondás...' : '✕ Lemondás'}
                        </button>
                    )}
                    <button className="ticket-qr-toggle" onClick={() => setShowQr(v => !v)}>
                        {showQr ? '▲ QR elrejtése' : '▼ QR kód'}
                    </button>
                </div>

                {showQr && (
                    <div className="ticket-qr-section">
                        <div className="ticket-qr-wrapper">
                            <img
                                src={`https://quickchart.io/qr?text=${encodeURIComponent(ticket.ticketCode)}&size=140`}
                                alt="QR kód"
                                className="ticket-qr-img"
                                loading="lazy"
                            />
                        </div>
                        <p className="ticket-code-full mono">{ticket.ticketCode}</p>
                    </div>
                )}
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
                const reservationsRes = await authFetch(
                    `http://localhost:5083/api/Booking/GetUserReservations/${currentUserId}`
                );
                if (!reservationsRes.ok) throw new Error("Nem sikerült betölteni a jegyeket.");
                const resData = await reservationsRes.json();
                const reservations = Array.isArray(resData) ? resData : [];

                const ticketsRes = await authFetch(
                    `http://localhost:5083/api/Ticket/MyTickets/${currentUserId}`
                );
                const ticketsData = ticketsRes.ok ? await ticketsRes.json() : [];
                const tickets = Array.isArray(ticketsData) ? ticketsData : [];

                const sortedRes = [...reservations].sort((a, b) => a.reservationId - b.reservationId);
                const sortedTickets = [...tickets].sort((a, b) =>
                    new Date(a.issuedDate) - new Date(b.issuedDate)
                );

                const merged = sortedRes.map((res, i) => ({
                    ticketCode: sortedTickets[i]?.ticketCode ?? `RES-${res.reservationId}`,
                    issuedDate: sortedTickets[i]?.issuedDate ?? null,
                    isUsed: sortedTickets[i]?.isUsed ?? false,
                    status: sortedTickets[i]?.status ?? res.status,
                    movieTitle: res.movieTitle,
                    seats: res.seats ?? [],
                    showDate: res.date,
                    showTime: res.time,
                    reservationId: res.reservationId,
                }));

                setTickets(merged);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchTickets();
    }, [currentUserId]);

    const [activeTab, setActiveTab] = useState('valid');

    const handleCancel = (reservationId) => {
        setTickets(prev => prev.filter(t => t.reservationId !== reservationId));
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
        window.location.reload();
    };

    const getTicketState = (t) => {
        const isUsed = t.isUsed || t.status === 'used' || t.status === 'Used';
        if (isUsed) return 'used';
        const isCancelled = t.status === 'cancelled' || t.status === 'Cancelled';
        if (isCancelled) return 'cancelled';
        const showDateTime = (() => {
            if (!t.showDate) return null;
            const datePart = t.showDate.split('T')[0];
            const timePart = t.showTime ? t.showTime.slice(0, 5) : '00:00';
            const dt = new Date(`${datePart}T${timePart}:00`);
            return isNaN(dt.getTime()) ? null : dt;
        })();
        if (showDateTime && showDateTime < new Date()) return 'expired';
        return 'valid';
    };

    const validCount = tickets.filter(t => getTicketState(t) === 'valid').length;

    const TABS = [
        { key: 'valid',     label: 'Érvényes' },
        { key: 'expired',   label: 'Lejárt' },
        { key: 'used',      label: 'Felhasznált' },
    ];

    const filteredTickets = tickets.filter(t => getTicketState(t) === activeTab);

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

                    <div className="tickets-tabs">
                        {TABS.map(tab => (
                            <button
                                key={tab.key}
                                className={`tickets-tab ${activeTab === tab.key ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab.key)}
                            >
                                {tab.label}
                                <span className="tab-count">
                                    {tickets.filter(t => getTicketState(t) === tab.key).length}
                                </span>
                            </button>
                        ))}
                    </div>

                    {loading && (
                        <div className="profile-loader-wrap">
                            <div className="profile-loader"></div>
                            <p>Jegyek betöltése...</p>
                        </div>
                    )}
                    {error && <p className="error-text">Hiba: {error}</p>}

                    {!loading && !error && filteredTickets.length === 0 && (
                        <div className="empty-reservations">
                            <div className="empty-icon">🎟️</div>
                            <p>Nincs ilyen jegyed.</p>
                            {activeTab === 'valid' && (
                                <button className="go-to-movies-btn" onClick={() => navigate('/')}>
                                    Nézzük a filmeket!
                                </button>
                            )}
                        </div>
                    )}

                    <div className="tickets-grid">
                        {filteredTickets.map(ticket => (
                            <TicketCard key={ticket.ticketCode} ticket={ticket} onCancel={handleCancel} />
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default UserProfile;
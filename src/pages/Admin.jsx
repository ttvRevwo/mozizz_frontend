import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import '../Styles/AdminStyle.css';
import { authFetch } from '../utils/auth';

const UserReservationsList = ({ userId, userName }) => {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) return;
        setLoading(true);
        authFetch(`http://localhost:5083/api/Reservation/GetUserReservations/${userId}`)
            .then(res => res.json())
            .then(data => {
                setReservations(Array.isArray(data) ? data : []);
            })
            .catch(err => console.error("Hiba a foglalások lekérésekor:", err))
            .finally(() => setLoading(false));
    }, [userId]);

    if (loading) return <div className="loading-text">Foglalások betöltése...</div>;

    return (
        <div className="admin-sub-panel" style={{ marginTop: '20px', borderTop: '2px solid #b8860b', paddingTop: '20px' }}>
            <h4 style={{ color: '#ffd700', marginBottom: '15px' }}>{userName} foglalásai:</h4>
            {!reservations.length ? (
                <div className="empty-message">Ennek a felhasználónak nincs foglalása.</div>
            ) : (
                <div className="user-list-container">
                    {reservations.map((res) => (
                        <div key={res.reservationId} className="user-card" style={{ borderColor: '#28a745' }}>
                            <div className="user-info">
                                <div className="user-name">{res.movieTitle}</div>
                                <div className="user-email">
                                    {res.date} - {res.time} | <strong>Székek: {res.seats.join(', ')}</strong>
                                </div>
                                <div style={{ fontSize: '0.8rem', color: res.status === 'Aktív' ? '#28a745' : '#ffc107' }}>
                                    Státusz: {res.status || 'Rögzítve'}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const UsersList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        authFetch('http://localhost:5083/api/User/GetAllUsers')
            .then(response => response.json())
            .then(tartalom => {
                if (Array.isArray(tartalom)) setUsers(tartalom);
                else if (tartalom && tartalom.data) setUsers(Object.values(tartalom.data));
                else setUsers([]);
            })
            .catch(error => console.log(error))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="loading-text">Felhasználók betöltése...</div>;
    if (!users.length) return <div className="admin-sub-panel"><div className="empty-message">Nincs felhasználó.</div></div>;

    return (
        <div className="admin-sub-panel">
            <h3 className="admin-title">Felhasználók listája ({users.length} db)</h3>
            <div className="user-list-container">
                {users.map((user) => (
                    <div key={user.userId} className="user-card">
                        <div className="user-info">
                            <div className="user-name">{user.name || user.username}</div>
                            <div className="user-email">{user.email}</div>
                        </div>
                        <div className="action-buttons" style={{ display: 'flex', gap: '10px' }}>
                            <Link to={`/user-bookings/${user.userId}`}>
                                <button className="details-button">Foglalások</button>
                            </Link>
                            <Link to={`/user/${user.userId}`} className="details-link">
                                <button className="details-button">Profil</button>
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            {selectedUser && (
                <UserReservationsList userId={selectedUser.id} userName={selectedUser.name} />
            )}
        </div>
    );
};

const MoviesList = () => {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchMovies = () => {
        setLoading(true);
        authFetch('http://localhost:5083/api/Movie/GetMovies')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setMovies(data);
                else if (data && data.data) setMovies(Object.values(data.data));
                else setMovies([]);
            })
            .catch(err => console.log(err))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchMovies(); }, []);

    const handleDelete = (id) => {
        if (window.confirm("Biztosan törölni szeretnéd ezt a filmet?")) {
            authFetch(`http://localhost:5083/api/Movie/DeleteMovie/${id}`, { method: 'DELETE' })
                .then(res => {
                    if (res.ok) { alert("Sikeres törlés!"); fetchMovies(); }
                    else if (res.status === 401) alert("Nincs jogosultság a törléshez. Jelentkezz be újra admin fiókkal.");
                    else alert("Hiba a törlés során.");
                });
        }
    };

    if (loading) return <div className="loading-text">Filmek betöltése...</div>;

    return (
        <div className="admin-sub-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 className="admin-title" style={{ margin: 0 }}>Filmek listája ({movies.length} db)</h3>
                <Link to="/movie/new">
                    <button className="details-button" style={{ backgroundColor: '#115420', fontSize: '1rem', padding: '10px 20px' }}>+ Új Film</button>
                </Link>
            </div>
            {!movies.length ? (
                <div className="empty-message">Nincs film.</div>
            ) : (
                <div className="user-list-container">
                    {movies.map((movie) => (
                        <div key={movie.id || movie.movieId} className="user-card" style={{ borderColor: '#ffd700' }}>
                            <div className="user-info">
                                <div className="user-name">{movie.title}</div>
                                <div className="user-email">{movie.genre || 'Nincs műfaj'}</div>
                            </div>
                            <div className="action-buttons" style={{ display: 'flex', gap: '10px' }}>
                                <Link to={`/admin/movie/${movie.id || movie.movieId}`} className="details-link">
                                    <button className="details-button">Szerkesztés</button>
                                </Link>
                                <button className="details-button" style={{ backgroundColor: '#650f0f', color: 'white' }} onClick={() => handleDelete(movie.id || movie.movieId)}>
                                    Törlés
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const ShowtimesList = () => {
    const [showtimes, setShowtimes] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchShowtimes = async () => {
        setLoading(true);
        try {
            const res = await authFetch('http://localhost:5083/api/Showtime/GetAllShowtimes');
            const data = await res.json();
            setShowtimes(Array.isArray(data) ? data : (data.data || []));
        } catch (error) {
            console.error("Hiba az adatok betöltésekor:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchShowtimes(); }, []);

    const handleDelete = (id) => {
        if (window.confirm("Biztosan törölni akarod ezt a vetítést?")) {
            authFetch(`http://localhost:5083/api/Showtime/DeleteShowtime/${id}`, { method: 'DELETE' })
                .then(res => {
                    if (res.ok) { alert("Sikeres törlés!"); fetchShowtimes(); }
                    else if (res.status === 401) alert("Nincs jogosultság a törléshez. Jelentkezz be újra admin fiókkal.");
                    else alert("Hiba történt.");
                })
                .catch(err => alert("Szerver hiba: " + err));
        }
    };

    if (loading) return <div className="loading-text">Vetítések betöltése...</div>;

    return (
        <div className="admin-sub-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 className="admin-title" style={{ margin: 0 }}>Vetítések ({showtimes.length} db)</h3>
                <Link to="/admin/showtime/new">
                    <button className="details-button" style={{ backgroundColor: '#005f73', fontSize: '1rem', padding: '10px 20px' }}>+ Új Vetítés</button>
                </Link>
            </div>
            {!showtimes.length ? (
                <div className="empty-message">Nincs rögzített vetítés.</div>
            ) : (
                <div className="user-list-container">
                    {showtimes.map((st) => (
                        <div key={st.showtimeId || st.ShowtimeId} className="user-card" style={{ borderColor: '#00d2ff' }}>
                            <div className="user-info">
                                <div className="user-name">{st.movieTitle || st.MovieTitle}</div>
                                <div className="user-email">
                                    {st.date || st.Date} - {st.time || st.Time} | <strong>{st.hallName || st.HallName}</strong>
                                </div>
                            </div>
                            <div className="action-buttons" style={{ display: 'flex', gap: '10px' }}>
                                <Link to={`/admin/showtime/${st.showtimeId || st.ShowtimeId}`} className="details-link">
                                    <button className="details-button">Szerkesztés</button>
                                </Link>
                                <button className="details-button" style={{ backgroundColor: '#650f0f', color: 'white' }} onClick={() => handleDelete(st.showtimeId || st.ShowtimeId)}>
                                    Törlés
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

function Admin() {
    const [activeTab, setActiveTab] = useState('users');

    return (
        <div className="app-container admin-view">
            <Link to="/" className="back-to-home">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} width={20} height={20}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
                Vissza a főoldalra
            </Link>

            <div className="admin-panel">
                <div className="admin-tabs" style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #444', paddingBottom: '10px' }}>
                    <button 
                        className={`details-button ${activeTab === 'users' ? 'active' : ''}`}
                        style={{ backgroundColor: activeTab === 'users' ? '#b8860b' : 'transparent', border: '1px solid #b8860b' }}
                        onClick={() => setActiveTab('users')}
                    >
                        Felhasználók & Foglalások
                    </button>

                    <button 
                        className={`details-button ${activeTab === 'movies' ? 'active' : ''}`}
                        style={{ backgroundColor: activeTab === 'movies' ? '#b8860b' : 'transparent', border: '1px solid #b8860b' }}
                        onClick={() => setActiveTab('movies')}
                    >
                        Filmek
                    </button>

                    <button 
                        className={`details-button ${activeTab === 'showtimes' ? 'active' : ''}`}
                        style={{ backgroundColor: activeTab === 'showtimes' ? '#b8860b' : 'transparent', border: '1px solid #b8860b' }}
                        onClick={() => setActiveTab('showtimes')}
                    >
                        Vetítések
                    </button>
                </div>

                {activeTab === 'users' && <UsersList />}
                {activeTab === 'movies' && <MoviesList />}
                {activeTab === 'showtimes' && <ShowtimesList />}
            </div>
        </div>
    );
}

export default Admin;
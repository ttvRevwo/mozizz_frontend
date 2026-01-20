import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import '../App.css';

// ==========================================
// 1. FELHASZNÁLÓK LISTA KOMPONENSEK
// ==========================================

const UsersComponent = ({ users }) => {
    return (
        <div className="user-list-container">
            {users.map((user) => (
                <div key={user.userId} className="user-card">
                    <div className="user-info">
                        <div className="user-name">
                            {user.name || user.username}
                        </div>
                        <div className="user-email">
                            {user.email}
                        </div>
                    </div>
                    
                    <Link to={`/user/${user.userId}`} className="details-link">
                        <button className="details-button">
                            Részletek
                        </button>
                    </Link>
                </div>
            ))}
        </div>
    );
};

const UsersList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost:5083/api/User/User')
        .then(response => response.json())
        .then(tartalom => {
            if(Array.isArray(tartalom)){
                setUsers(tartalom);
            } else if (tartalom && tartalom.data) {
                setUsers(Object.values(tartalom.data));
            } else {
                setUsers([]);
            }
        })
        .catch(error => console.log(error))
        .finally(() => setLoading(false));
    }, []);

    if(loading) return <div className="loading-text">Felhasználók betöltése...</div>; 
        
    if(!users.length) { 
        return (
            <div className="admin-sub-panel">
                <div className="empty-message">Nincs megjeleníthető felhasználó.</div>
            </div>
        );
    }
    
    return(
        <div className="admin-sub-panel">
            <h3 className="admin-title">Felhasználók listája ({users.length} db)</h3>
            <UsersComponent users={users} />
        </div>
    );
};

// ==========================================
// 2. FILMEK LISTA KOMPONENSEK (ÚJ RÉSZ)
// ==========================================

const MoviesComponent = ({ movies, onDelete }) => {
    return (
        <div className="user-list-container"> {/* Újrahasznosítjuk a CSS osztályokat */}
            {movies.map((movie) => (
                <div key={movie.id || movie.movieId} className="user-card" style={{ borderColor: '#ffd700' }}>
                    <div className="user-info">
                        <div className="user-name">
                            {movie.title} {/* Feltételezzük, hogy 'title' a mező neve */}
                        </div>
                        <div className="user-email">
                            {movie.genre ? movie.genre : 'Nincs műfaj megadva'}
                        </div>
                    </div>
                    
                    <div className="action-buttons" style={{ display: 'flex', gap: '10px' }}>
                        {/* Részletek / Szerkesztés gomb */}
                        <Link to={`/movie/${movie.id || movie.movieId}`} className="details-link">
                            <button className="details-button">
                                Részletek
                            </button>
                        </Link>

                        {/* Törlés gomb (Opcionális, ha itt akarod törölni) */}
                        <button 
                            className="details-button" 
                            style={{ backgroundColor: '#ff4444', color: 'white' }}
                            onClick={() => onDelete(movie.id || movie.movieId)}
                        >
                            Törlés
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

const MoviesList = () => {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filmek betöltése
    const fetchMovies = () => {
        setLoading(true);
        fetch('http://localhost:5083/api/Movie/GetMovies')
        .then(response => response.json())
        .then(data => {
            // Ellenőrizzük az adatszerkezetet, mint a usernél
            if(Array.isArray(data)){
                setMovies(data);
            } else if (data && data.data) {
                setMovies(Object.values(data.data));
            } else {
                setMovies([]);
            }
        })
        .catch(error => console.log("Hiba a filmek lekérésekor:", error))
        .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchMovies();
    }, []);

    // Film törlése
    const handleDelete = (id) => {
        if(window.confirm("Biztosan törölni szeretnéd ezt a filmet?")) {
            fetch(`http://localhost:5083/api/Movie/DelMovie?id=${id}`, {
                method: 'DELETE' // Vagy 'POST', ha a backend úgy kéri, de REST szerint DELETE illik
            })
            .then(res => {
                if(res.ok) {
                    alert("Film sikeresen törölve!");
                    fetchMovies(); // Lista frissítése törlés után
                } else {
                    alert("Hiba történt a törlés során.");
                }
            })
            .catch(err => console.error(err));
        }
    };

    if(loading) return <div className="loading-text">Filmek betöltése...</div>;

    return (
        <div className="admin-sub-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 className="admin-title" style={{ margin: 0 }}>Filmek listája ({movies.length} db)</h3>
                
                {/* ÚJ FILM FELVITELE GOMB */}
                <Link to="/movie/new">
                    <button className="details-button" style={{ backgroundColor: '#28a745', fontSize: '1rem', padding: '10px 20px' }}>
                        + Új Film Felvétele
                    </button>
                </Link>
            </div>

            {!movies.length ? (
                <div className="empty-message">Nincs megjeleníthető film.</div>
            ) : (
                <MoviesComponent movies={movies} onDelete={handleDelete} />
            )}
        </div>
    );
};

// ==========================================
// 3. FŐ ADMIN KOMPONENS
// ==========================================

function Admin() {
  const [activeTab, setActiveTab] = useState('users'); // 'users' vagy 'movies'

  return (
    <div className="app-container admin-view">
       <Link to="/" className="back-to-home">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} width={20} height={20}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
        </svg>
        Vissza a főoldalra
      </Link>
      
      <div className="admin-panel">
          {/* TAB VÁLASZTÓ GOMBOK */}
          <div className="admin-tabs" style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #444', paddingBottom: '10px' }}>
              <button 
                className={`details-button ${activeTab === 'users' ? 'active' : ''}`}
                style={{ 
                    backgroundColor: activeTab === 'users' ? '#b8860b' : 'transparent',
                    border: '1px solid #b8860b'
                }}
                onClick={() => setActiveTab('users')}
              >
                  Felhasználók kezelése
              </button>

              <button 
                className={`details-button ${activeTab === 'movies' ? 'active' : ''}`}
                style={{ 
                    backgroundColor: activeTab === 'movies' ? '#b8860b' : 'transparent',
                    border: '1px solid #b8860b'
                }}
                onClick={() => setActiveTab('movies')}
              >
                  Filmek kezelése
              </button>
          </div>

          {/* TARTALOM MEGJELENÍTÉSE A TAB ALAPJÁN */}
          {activeTab === 'users' ? <UsersList /> : <MoviesList />}
      </div>
    </div>
  );
}

export default Admin;
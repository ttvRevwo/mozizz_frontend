import { useState, useEffect } from 'react'; 
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation, Navigate } from "react-router-dom"

import Register from './pages/register'
import Login from './pages/login'
import Admin from './pages/Admin'
import UserDetails from "./pages/UserDetails"
import MovieDetails from './pages/MovieDetails';
import NewMovie from './pages/NewMovie';
import Buffet from './pages/Buffet';
import Catalog from './pages/Catalog';
import Profile from './pages/Profile';
import ViewMovie from './pages/ViewMovie';
import Showtimes from './pages/Showtimes';
import ShowtimeDetails from './pages/ShowtimeDetails';
import NewShowtime from './pages/NewShowtime';

import './App.css'

const CLOUDINARY_BASE = "https://res.cloudinary.com/dytjuv6qt/image/upload/";

function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);

  const userId = localStorage.getItem('userId');
  const roleIdFromStorage = localStorage.getItem('roleId');
  const userName = localStorage.getItem('userName');
  
  const isLoggedIn = !!userId;
  const isAdmin = parseInt(roleIdFromStorage) === 1;

  if (location.pathname !== '/') {
    return null;
  }

  const handleLogout = () => {
    localStorage.clear();
    setShowDropdown(false);
    navigate('/');
    window.location.reload();
  };

  return (
    <nav className="top-nav">
      <div className="nav-left">
        <Link to="/" className="logo-link">
             <img src="/vite.svg" alt="Logo" className="nav-logo"/>
        </Link>
        <input type="text" placeholder="Keresés..." className="search-bar" />
      </div>

      <div className="nav-center">
        <h1 className="nav-slogan">Mozizz.hu - Élmény, ami összeköt!</h1>
      </div>

      <div className="nav-right">
        <div className="nav-links-container">
          {isLoggedIn && (
            <>
              <Link to="/Catalog"><button className="nav-button">Filmek</button></Link>
              <Link to="/Buffet"><button className="nav-button">Büfé</button></Link>
            </>
          )}

          {isAdmin && (
            <Link to="/admin"><button className="nav-button admin-btn">Admin Panel</button></Link>
          )}

          {!isLoggedIn && (
            <>
              <Link to="/register"><button className="nav-button">Regisztráció</button></Link>
              <Link to="/login"><button className="nav-button">Bejelentkezés</button></Link>
            </>
          )}
        </div>

        {isLoggedIn && (
          <div className="profile-container">
            <div className="profile-icon" onClick={() => setShowDropdown(!showDropdown)}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="user-svg">
                <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
              </svg>
            </div>

            {showDropdown && (
              <div className="dropdown-menu">
                <div className="user-info-header">{userName}</div>
                <div className="dropdown-divider"></div>
                <Link to="/Profile" onClick={() => setShowDropdown(false)} className="dropdown-item">Profil</Link>
                <button onClick={handleLogout} className="dropdown-item logout-item">Kijelentkezés</button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

function MainPage() {
  const [movies, setMovies] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5083/api/Movie/GetMovies')
      .then(res => res.json())
      .then(data => {
        const moviesList = data.data || data;
        setMovies(moviesList.slice(0, 6));
        setLoading(false);
      })
      .catch(err => {
        console.error("Hiba a filmek betöltésekor:", err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (movies.length === 0) return;

    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev === movies.length - 1 ? 0 : prev + 1));
    }, 10000); 
    
    return () => clearInterval(slideInterval);
  }, [movies.length]);

  if (loading) {
    return <div className="main-page-container"><p style={{color:'white', textAlign:'center', paddingTop:'100px'}}>Filmek betöltése...</p></div>;
  }

  if (movies.length === 0) {
    return <div className="main-page-container"><p style={{color:'white', textAlign:'center', paddingTop:'100px'}}>Nincsenek kiemelt filmek.</p></div>;
  }

  return (
    <div className="main-page-container">
      <div className="hero-slider-box">
        {movies.map((movie, index) => {

            let imageUrl = '';
            if (movie.img && movie.img.startsWith('http')) {
                imageUrl = movie.img;
            } else if (movie.img) {
                imageUrl = `${CLOUDINARY_BASE}${movie.img}`;
            }

            return (
              <div 
                key={movie.id || movie.movieId}
                className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
                style={{ backgroundImage: `url(${imageUrl})` }}
              >
                <div className="hero-overlay"></div>
                <div className="hero-content-slider">
                  <span className="movie-genre">{movie.genre || movie.Genre}</span>
                  <h2 className="movie-title">{movie.title || movie.Title}</h2>
                  <p className="movie-description">{movie.description || movie.Description}</p>
                  <div className="hero-buttons">
                    <button className="btn-primary">Jegyfoglalás</button>
                    <Link to={`/movie/${movie.id || movie.movieId}`}>
                        <button className="btn-secondary">Részletek</button>
                    </Link>
                  </div>
                </div>
              </div>
            );
        })}
        
        <div className="slider-dots">
          {movies.map((_, index) => (
            <div key={index} className={`dot ${index === currentSlide ? 'active' : ''}`} onClick={() => setCurrentSlide(index)}></div>
          ))}
        </div>
      </div>
    </div>
  );
}

const AuthLayout = ({ children }) => <div className="auth-full-page">{children}</div>;

const SimpleLayout = ({ children }) => (
  <div style={{ width: '100%', minHeight: '100vh', padding: '20px' }}>
    {children}
  </div>
);

const AdminRoute = ({ children }) => {
  const roleId = localStorage.getItem('roleId');
  
  if (parseInt(roleId) !== 1) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Navigation />
        
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/register" element={<AuthLayout><Register /></AuthLayout>} />
          <Route path="/login" element={<AuthLayout><Login /></AuthLayout>} />
          
          <Route path="/Catalog" element={<SimpleLayout><Catalog /></SimpleLayout>} />
          <Route path="/Buffet" element={<SimpleLayout><Buffet /></SimpleLayout>} />
          <Route path="/Profile" element={<SimpleLayout><Profile /></SimpleLayout>} />

          <Route path="/movie/:id" element={<ViewMovie />} />

          {/* ADMIN ÚTVONALAK */}
          
          <Route path="/admin" element={
            <AdminRoute>
              <SimpleLayout><Admin /></SimpleLayout>
            </AdminRoute>
          } />

          <Route path="/user/:userId" element={
            <AdminRoute>
              <SimpleLayout><UserDetails /></SimpleLayout>
            </AdminRoute>
          } />

          <Route path="/admin/movie/:id" element={
            <AdminRoute>
              <SimpleLayout><MovieDetails /></SimpleLayout>
            </AdminRoute>
          } />

          <Route path="/movie/new" element={
            <AdminRoute>
              <SimpleLayout><NewMovie /></SimpleLayout>
            </AdminRoute>
          } />

          {/* VETÍTÉSSEL KAPCSOLATOS*/}
          <Route path="/admin/showtime/new" element={
            <AdminRoute>
              <SimpleLayout><NewShowtime /></SimpleLayout>
            </AdminRoute>
          } />

          <Route path="/admin/showtime/:id" element={
            <AdminRoute>
              <SimpleLayout><ShowtimeDetails /></SimpleLayout>
            </AdminRoute>
          } />


        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
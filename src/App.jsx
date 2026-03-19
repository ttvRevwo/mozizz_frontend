import { useState, useEffect } from 'react'; 
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation, Navigate } from "react-router-dom"

import Register from './pages/register'
import Login from './pages/login'
import Admin from './pages/Admin'
import Buffet from './pages/Buffet';
import Catalog from './pages/Catalog';
import Profile from './pages/Profile';
import ProfileEdit from './pages/ProfileEdit';
import ViewMovie from './pages/ViewMovie';
import SeatBooking from './pages/SeatBooking';
import ProductDetail from './pages/ProductDetails';
import { getStoredRoleId, isUserLoggedIn } from './utils/auth';
import { CLOUDINARY_BASE, getManualLogoUrl } from './utils/cloudinary';

import './App.css'
import './styles/ResponsiveStyle.css'

const LOGO_URL = getManualLogoUrl();

function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);

  const userId = localStorage.getItem('userId');
  const userName = localStorage.getItem('userName');
  
  const isLoggedIn = isUserLoggedIn() || !!userId;
  const isAdmin = getStoredRoleId() === 1;

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
             <img src={LOGO_URL} alt="Logo" className="nav-logo"/>
        </Link>
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

const getShowtimeISO = (dateRaw) => {
  if (!dateRaw) return '';
  const huMatch = String(dateRaw).match(/(\d{4})[.\s]+(\d{1,2})[.\s]+(\d{1,2})/);
  if (huMatch) return `${huMatch[1]}-${huMatch[2].padStart(2,'0')}-${huMatch[3].padStart(2,'0')}`;
  return String(dateRaw).split('T')[0];
};

function MainPage() {
  const navigate = useNavigate();
  const [slides, setSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const todayISO = new Date().toISOString().split('T')[0];

    Promise.all([
      fetch('http://localhost:5083/api/Movie/GetMovies').then(r => r.json()),
      fetch('http://localhost:5083/api/Showtime/GetAllShowtimes').then(r => r.json()),
    ])
      .then(([moviesData, showtimesData]) => {
        const moviesList    = moviesData.data || moviesData || [];
        const showtimesList = Array.isArray(showtimesData) ? showtimesData : (showtimesData.data || []);

        const todayShowtimes = showtimesList.filter(st => {
          const d = getShowtimeISO(st.date || st.Date);
          return d === todayISO;
        });

        const pool = todayShowtimes.length > 0
          ? todayShowtimes
          : showtimesList.sort((a, b) => {
              const da = (a.date || a.Date || '') + (a.time || a.Time || '');
              const db = (b.date || b.Date || '') + (b.time || b.Time || '');
              return da.localeCompare(db);
            });

        const seen = new Set();
        const picked = [];
        for (const st of pool) {
          const title = (st.movieTitle || st.MovieTitle || '').trim();
          if (!title || seen.has(title)) continue;
          seen.add(title);

          const movie = moviesList.find(m =>
            (m.title || m.Title || '').trim().toLowerCase() === title.toLowerCase()
          );

          const imgPath = movie?.img || movie?.Img || movie?.imageUrl || movie?.ImageUrl || '';
          const imgUrl  = imgPath.startsWith('http') ? imgPath : imgPath ? `${CLOUDINARY_BASE}${imgPath}` : '';

          picked.push({
            showtimeId: st.showtimeId || st.ShowtimeId,
            movieId:    movie?.movieId || movie?.MovieId || movie?.id || null,
            title,
            genre:       movie?.genre       || movie?.Genre       || '',
            description: movie?.description || movie?.Description || '',
            img:         imgUrl,
            time:        (st.time || st.Time || '').substring(0, 5),
            hallName:    st.hallName || st.HallName || '',
          });

          if (picked.length >= 6) break;
        }

        setSlides(picked);
      })
      .catch(err => console.error('Betöltési hiba:', err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (slides.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 10000);
    return () => clearInterval(interval);
  }, [slides.length]);

  if (loading) {
    return <div className="main-page-container"><p style={{color:'white', textAlign:'center', paddingTop:'100px'}}>Filmek betöltése...</p></div>;
  }

  if (slides.length === 0) {
    return <div className="main-page-container"><p style={{color:'white', textAlign:'center', paddingTop:'100px'}}>Nincsenek kiemelt filmek.</p></div>;
  }

  return (
    <div className="main-page-container">
      <div className="hero-slider-box">
        {slides.map((slide, index) => {
          const isActive = index === currentSlide;
          return (
            <div
              key={`${slide.showtimeId}-${index}`}
              className={`hero-slide ${isActive ? 'active' : ''}`}
              style={{ backgroundImage: slide.img ? `url(${slide.img})` : 'none' }}
            >
              <div className="hero-overlay"></div>
              <div className="hero-content-slider">
                <span className="movie-genre">{slide.genre}</span>
                <h2 className="movie-title">{slide.title}</h2>
                {slide.time && (
                  <p style={{ color: '#E0AA3E', fontSize: '1rem', fontWeight: 600, marginBottom: '6px', letterSpacing: '1px' }}>
                    🕐 Ma {slide.time} — {slide.hallName}
                  </p>
                )}
                <p className="movie-description">{slide.description}</p>
                <div className="hero-buttons">
                  <button
                    className="btn-primary"
                    onClick={() => {
                      if (index !== currentSlide) return;
                      navigate(`/booking/${slide.showtimeId}`);
                    }}
                  >
                    Jegyfoglalás
                  </button>
                  {slide.movieId && (
                    <Link
                      to={`/movie/${slide.movieId}`}
                      onClick={e => { if (index !== currentSlide) e.preventDefault(); }}
                    >
                      <button className="btn-secondary">Részletek</button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        <div className="slider-dots">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

const AuthLayout = ({ children }) => <div className="auth-full-page">{children}</div>;

const SimpleLayout = ({ children }) => (
  <div style={{ width: '100%', boxSizing: 'border-box' }}>
    {children}
  </div>
);

const AdminRoute = ({ children }) => {
  const roleId = getStoredRoleId();
  if (roleId !== 1) return <Navigate to="/" replace />;
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
          <Route path="/profile/edit" element={<SimpleLayout><ProfileEdit /></SimpleLayout>} />
          <Route path="/booking/:showtimeId" element={<SeatBooking />} />
          <Route path="/buffet/product/:id" element={<ProductDetail />} />
          <Route path="/movie/:id" element={<ViewMovie />} />

          <Route path="/admin" element={
            <AdminRoute>
              <SimpleLayout><Admin /></SimpleLayout>
            </AdminRoute>
          } />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
import { useState, useEffect } from 'react'; 
import { BrowserRouter, Routes, Route, Link } from "react-router-dom"
import Register from './pages/register'
import Login from './pages/login'
import Admin from './pages/Admin'
import UserDetails from "./pages/UserDetails"
import MovieDetails from './pages/MovieDetails';
import NewMovie from './pages/NewMovie';
import './App.css'

import img1 from './imgs/film1.jpg'; 
import img2 from './imgs/film2.jpg';
import img3 from './imgs/film3.jpg';

function MainPage() {
  const movies = [
    {
      id: 1,
      title: "Oppenheimer",
      genre: "Életrajzi / Dráma",
      description: "Egy elméleti fizikus története, aki segített létrehozni az atombombát.",
      image: img1, 
    },
    {
      id: 2,  
      title: "Dűne: Második Rész",
      genre: "Sci-Fi / Kaland",
      description: "Paul Atreides bosszút áll az összeesküvőkön, akik elpusztították a családját.",
      image: img2,
    },
    {
      id: 3,
      title: "Batman",
      genre: "Akció / Krimi",
      description: "Amikor a Riddler sorozatgyilkos elkezd politikai alakokat meggyilkolni.",
      image: img3,
    }
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prevIndex) => 
        prevIndex === movies.length - 1 ? 0 : prevIndex + 1
      );
    }, 10000); //10000 ms = 10mp

    return () => clearInterval(slideInterval);
  }, [movies.length]);

  return (
    <div className="app-container">
      <nav className="top-nav">
        <div className="nav-links-container">
            <Link to="/Admin">
            <button className="nav-button">Admin</button>
            </Link>
            <Link to="/register">
            <button className="nav-button">Regisztráció</button>
            </Link>
            <Link to="/login">
            <button className="nav-button">Bejelentkezés</button>
            </Link>
        </div>
        <div>
          <input type="text" placeholder="Keresés..." className="search-bar"></input>
        </div>
      </nav>

      <div className="home-icon">
        <Link to="/">
             <img src="/vite.svg" alt="Logo" className="home-icon-img"/>
        </Link>
      </div>

      <div className="home-content">
        <h1 className="home-subtitle">Mozizz.hu - Élmény, ami összeköt!</h1>
      </div>


      <div className="hero-slider-box">
        {movies.map((movie, index) => (
          <div 
            key={movie.id} 
            className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
            style={{ backgroundImage: `url(${movie.image})` }}
          >
            <div className="hero-overlay"></div>
            
            <div className="hero-content-slider">
              <span className="movie-genre">{movie.genre}</span>
              <h2 className="movie-title">{movie.title}</h2>
              <p className="movie-description">{movie.description}</p>
              
              <div className="hero-buttons">
                <button className="btn-primary">Jegyfoglalás</button>
                <button className="btn-secondary">Részletek</button>
              </div>
            </div>
          </div>
        ))}

        <div className="slider-dots">
          {movies.map((_, index) => (
            <div 
              key={index} 
              className={`dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)} 
            ></div>
          ))}
        </div>
      </div>

    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/user/:userId" element={<UserDetails />} />
        <Route path="/movie/:id" element={<MovieDetails />} />
        <Route path="/movie/new" element={<NewMovie />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
import { BrowserRouter, Routes, Route, Link } from "react-router-dom"
import Register from './register'
import Login from './login'
import './App.css'

function MainPage() {
  return (
    <div className="app-container">
      <nav className="top-nav">
        <Link to="/register">
          <button className="nav-button">Regisztráció</button>
        </Link>
        <Link to="/login">
          <button className="nav-button">Bejelentkezés</button>
        </Link>
      </nav>

      <div className="home-content">
        <h1 className="home-subtitle">Mozizz.hu - Élmény, ami összeköt!</h1>
      </div>

      <div className="home-icon">
        <img src="/vite.svg" alt="Logo" className="home-icon"/>
      </div>

      <div>
        <input type="text" placeholder="Keresés..." className="search-bar"></input>
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
      </Routes>
    </BrowserRouter>
  );
}

export default App
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
        <h1 className="home-title">Főoldal</h1>
        <p className="home-subtitle">Üdvözöljük az Mozizz.hu-n!</p>
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
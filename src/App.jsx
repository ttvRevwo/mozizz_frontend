import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { BrowserRouter, Routes, Route, Link } from "react-router-dom"
import Register from './register'  // importáld be a különálló fájlt
import Login from './login'
import './App.css'

function MainPage() {
  return (
    <div>
      <Link to="/register">
        <button className="register">Regisztráció</button>
      </Link>
      <Link to="/login">
        <button className="login">Bejelentkezés</button>
      </Link>
      <h1>Főoldal</h1>
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

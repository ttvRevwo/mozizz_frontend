import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/LoginStyle.css';
import backgroundImage from '../../src/imgs/4.png';
import logoImg from '../imgs/logo.webp';

const WaveInput = ({ type, placeholder, value, onChange, required = true }) => {
  return (
    <div className="input-group">
      <input 
        type={type} 
        className={`form-input ${value && value.length > 0 ? 'active' : ''}`}        
        value={value} 
        onChange={onChange} 
        required={required} 
      />
      <label className="floating-label">
        {placeholder.split('').map((char, index) => (
          <span key={index} style={{ transitionDelay: `${index * 50}ms` }}>
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </label>
    </div>
  );
};

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');

    const payload = {
        Email: username,
        Password: password
    };

    try {
        const response = await fetch('http://localhost:5083/api/Auth/Login', { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            const data = await response.json();
            
            setMessage(`Sikeres bejelentkezés! Üdv, ${data.name}!`);
            
            localStorage.setItem('userId', data.userId);
            localStorage.setItem('userName', data.name);
            localStorage.setItem('userEmail', data.email);
            localStorage.setItem('roleId', data.roleId);

            setTimeout(() => {
                navigate('/'); 
            }, 1000);

        } else {
            const errorText = await response.text();
            setMessage(errorText || 'Hiba történt a bejelentkezés során.');
        }

    } catch (error) {
      console.error('Login error:', error);
      setMessage('Nem sikerült csatlakozni a szerverhez.');
    }
  };

  return (
    <div 
      className="app-container" 
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
    <div className="register-container">
      <a href="/" className="back-to-home">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} width={20} height={20}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
        </svg>
        Vissza
      </a>
      
      <h2 className="register-title">Bejelentkezés</h2>
      
      <div className="register-welcome">
        <div className="register-logo">
          <img src={logoImg} alt="Mozi Logo" className="logo-icon" />
        </div>
        <div className="register-welcome-text">
          Üdvözlünk a mozizz.hu-n! Jelentkezz be a legjobb filmélményekért és exkluzív ajánlatokért.
        </div>
      </div>

      <form className="register-form" onSubmit={handleSubmit}>
        
        <WaveInput 
          type="text" 
          placeholder="Email cím"
          value={username} 
          onChange={e => setUsername(e.target.value)} 
        />

        <WaveInput 
          type="password" 
          placeholder="Jelszó" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
        />

        {message && (
          <div className={`register-message ${message.includes('Sikeres') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <div className="register-bottom-row">
        <a href="#" className="login-link">Elfelejtett jelszó kérése </a>
          <button type="submit" className="reg-button">Bejelentkezés</button>
        </div>
        
        <div className='login-link-wrapper'>
          Nincs még fiókod? <a href="/register" className="login-link">Regisztrálj!</a>
        </div>
      </form>
    </div>
    </div>
  );
}
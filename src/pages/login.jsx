import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/LoginStyle.css';
import backgroundImage from '../../src/imgs/4.png';
import { decodeJwtPayload, getRoleIdFromClaims } from '../utils/auth';
import { getManualLogoUrl } from '../utils/cloudinary';

const LOGO_URL = getManualLogoUrl();

const getFirstValue = (obj, keys) => {
  if (!obj || typeof obj !== 'object') return null;

  for (const key of keys) {
    const value = obj[key];
    if (value !== undefined && value !== null && value !== '') {
      return value;
    }
  }

  return null;
};

const normalizeRoleId = (value) => {
  if (value === null || value === undefined) return null;

  const parsed = Number.parseInt(value, 10);
  if (!Number.isNaN(parsed)) return parsed;

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'admin') return 1;
    if (normalized === 'user') return 2;
  }

  return null;
};

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
            const content = data?.data ?? data;

            const token = getFirstValue(content, ['token', 'jwtToken', 'accessToken', 'access_token']);
            if (token) {
              localStorage.setItem('token', token);
            }

            const claims = token ? decodeJwtPayload(token) : null;

            const resolvedUserId = getFirstValue(content, ['userId', 'id'])
              ?? getFirstValue(claims, ['nameid', 'sub', 'userId', 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']);

            const resolvedName = getFirstValue(content, ['name', 'userName', 'username'])
              ?? getFirstValue(claims, ['name', 'unique_name', 'given_name']);

            const resolvedEmail = getFirstValue(content, ['email'])
              ?? getFirstValue(claims, ['email']);

            const resolvedRoleId = getFirstValue(content, ['roleId', 'role'])
              ?? getRoleIdFromClaims(claims);

            const normalizedRoleId = normalizeRoleId(resolvedRoleId);
            
            setMessage(`Sikeres bejelentkezés! Üdv, ${resolvedName || 'felhasználó'}!`);
            
            if (resolvedUserId !== null && resolvedUserId !== undefined) {
              localStorage.setItem('userId', String(resolvedUserId));
            }

            if (resolvedName) {
              localStorage.setItem('userName', String(resolvedName));
            }

            if (resolvedEmail) {
              localStorage.setItem('userEmail', String(resolvedEmail));
            }

            if (!Number.isNaN(normalizedRoleId) && normalizedRoleId !== null && normalizedRoleId !== undefined) {
              localStorage.setItem('roleId', String(normalizedRoleId));
            }

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
          <img src={LOGO_URL} alt="Mozi Logo" className="logo-icon" />
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
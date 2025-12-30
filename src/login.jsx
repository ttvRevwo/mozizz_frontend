import { useState } from 'react';
import './registerlogin.css';
import backgroundImage from '../src/imgs/4.png';

export default function Login() {
  // Csak a bejelentkezéshez szükséges állapotok
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');


  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');

    // IDE JÖN MAJD A BACKEND KOMMUNIKÁCIÓ
    
    try {
        setMessage(`Sikeres Bejelentkezés! Üdvözlünk, ${username}!`);
        // Autentikációs token mentés
        setUsername('');
        setPassword('');
    } catch (error) {
      console.error('Login error:', error);
    }
    
    // Ideiglenes üzenet backend nélkül:
    setMessage(`Sikeres Bejelentkezési Űrlap Küldés! Felhasználónév: ${username}`);
    setUsername('');
    setPassword('');
  };

  return (
    /* Background image */
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
      {/* Vissza a főoldalra gomb */}
      <a href="/" className="back-to-home">
        {/* Ikon a nyílhoz */}
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} width={20} height={20}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
        </svg>
        {/* Szöveg a gombhoz */}
        Vissza a főoldalra
      </a>
      {/* Főablak */}
      <h2 className="register-title">Bejelentkezés</h2>
      <div className="register-welcome">
        <div className="register-logo">
          {/* A register-logo SVG kódja */}
          <svg xmlns="http://www.w3.org/2000/svg" className="logo-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} width={36} height={36}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
          </svg>
        </div>
        <div className="register-welcome-text">
          Üdvözlünk a mozizz.hu-n! Jelentkezz be a legjobb filmélményekért és exkluzív ajánlatokért.
        </div>
      </div>
      <form className="register-form" onSubmit={handleSubmit}>
        {/* Csak a Felhasználónév/email és Jelszó mezők kellenek bejelentkezéshez már */}
        <input 
          type="text" 
          placeholder="Felhasználónév vagy Email" 
          value={username} 
          onChange={e => setUsername(e.target.value)} 
          required 
          className="form-input" 
        />
        <input 
          type="password" 
          placeholder="Jelszó" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          required 
          className="form-input" 
        />
        {message && (
          <div className={`register-message ${message.startsWith('Sikeres') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}
        <div className="register-bottom-row">
        <a href="#" className="login-link">Elfelejtett jelszó kérése </a>
          <button type="submit" className="reg-button">Bejelentkezés</button>
        </div>
        <div className='login-link-wrapper'>
          {/* Hozzáadva a regisztráció linket, ha valaki mégis regisztrálni szeretne */}
          Nincs még fiókod? <a href="../register" className="login-link">Regisztrálj!</a>
        </div>
      </form>
    </div>
    </div>
  );
}
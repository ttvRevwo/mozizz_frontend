import { useState } from 'react';
import '../registerlogin.css';
import backgroundImage from '../../src/imgs/4.png';

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

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');

    // IDE JÖN MAJD A BACKEND KOMMUNIKÁCIÓ
    
    try {
        // Ideiglenes logikák...
        setMessage(`Sikeres Bejelentkezési Űrlap Küldés! Felhasználónév: ${username}`);
        setUsername('');
        setPassword('');
    } catch (error) {
      console.error('Login error:', error);
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
          <svg xmlns="http://www.w3.org/2000/svg" className="logo-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} width={36} height={36}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
          </svg>
        </div>
        <div className="register-welcome-text">
          Üdvözlünk a mozizz.hu-n! Jelentkezz be a legjobb filmélményekért és exkluzív ajánlatokért.
        </div>
      </div>

      <form className="register-form" onSubmit={handleSubmit}>
        
        <WaveInput 
          type="text" 
          placeholder="Felhasználónév vagy Email" 
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
          <div className={`register-message ${message.startsWith('Sikeres') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <div className="register-bottom-row">
        <a href="#" className="login-link">Elfelejtett jelszó kérése </a>
          <button type="submit" className="reg-button">Bejelentkezés</button>
        </div>
        
        <div className='login-link-wrapper'>
          Nincs még fiókod? <a href="../register" className="login-link">Regisztrálj!</a>
        </div>
      </form>
    </div>
    </div>
  );
}
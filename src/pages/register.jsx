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

export default function Register() {
  const [fullname, setFullname] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phonenumber, setPhonenumber] = useState('');
  const [password, setPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [message, setMessage] = useState('');

  const validateFullname = (name) => /^[A-Za-zÁÉÍÓÖŐÚÜŰáéíóöőúüű]+ [A-Za-zÁÉÍÓÖŐÚÜŰáéíóöőúüű]+$/.test(name);
  const validateUsername = (name) => /^[A-Za-z0-9]{6,16}$/.test(name);
  const validateEmail = (mail) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail);
  const validatePhone = (phone) => /^(?:\+36|06)[0-9\s\-\#]{9}$/.test(phone);
  const validatePassword = (pass) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(pass);

  const handleSubmit = (event) => {
    event.preventDefault();
    setMessage('');

    if (!agreedToTerms) {
      setMessage("El kell fogadnod az ÁSZF-et a regisztrációhoz!");
      return;
    }
    if (!validateFullname(fullname)) {
      setMessage("A teljes név két szóból álljon, csak betűk, szóközzel elválasztva.");
      return;
    }
    if (!validateUsername(username)) {
      setMessage("A felhasználónév 6-16 karakter, csak betűk és számok lehetnek, szóköz nélkül.");
      return;
    }
    if (!validateEmail(email)) {
      setMessage("Érvényes email címet adj meg.");
      return;
    }
    if (!validatePhone(phonenumber)) {
      setMessage("A telefonszám nem megfelelő formátumú,  06-tal kezdődhet és 11 számjegy kell legyen.");
      return;
    }
    if (!validatePassword(password)) {
      setMessage("A jelszónak legalább 8 karakterből kell állnia, tartalmaznia kell kis- és nagybetűt, számot és speciális karaktert.");
      return;
    }

    setMessage(`Sikeres Validáció! Üdv, ${username}! A regisztrációt a rendszer feldolgozza.`);
    
    setFullname('');
    setUsername('');
    setEmail('');
    setPhonenumber('');
    setPassword('');
    setAgreedToTerms(false);
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
        Vissza a főoldalra
      </a>
      
      <h2 className="register-title">Regisztráció</h2>
      
      <div className="register-welcome">
        <div className="register-logo">
          <svg xmlns="http://www.w3.org/2000/svg" className="logo-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} width={36} height={36}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
          </svg>
        </div>
        <div className="register-welcome-text">
          Üdvözlünk a mozizz.hu-n! Regisztrálj a legjobb filmélményekért és exkluzív ajánlatokért.
        </div>
      </div>

      <form className="register-form" onSubmit={handleSubmit}>
        
        <WaveInput 
          type="text" 
          placeholder="Teljes név" 
          value={fullname} 
          onChange={e => setFullname(e.target.value)} 
        />
        
        <WaveInput 
          type="text" 
          placeholder="Felhasználónév" 
          value={username} 
          onChange={e => setUsername(e.target.value)} 
        />
        
        <WaveInput 
          type="email" 
          placeholder="Email cím" 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
        />
        
        <WaveInput 
          type="number" 
          placeholder="Telefonszám" 
          value={phonenumber} 
          onChange={e => setPhonenumber(e.target.value)} 
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
          <label className="aszf-label">
            <input type="checkbox" checked={agreedToTerms} onChange={e => setAgreedToTerms(e.target.checked)} required className="aszf-checkbox" />
            Elfogadom az Általános Szerződési Feltételeket
          </label>
          <button type="submit" className="reg-button">Regisztráció</button>
        </div>
        
        <div className='login-link-wrapper'>
          Már van fiókod? <a href="../login" className="login-link">Jelentkezz be!</a>
        </div>
      </form>
    </div>
    </div>
  );
}
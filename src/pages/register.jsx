import { useState } from 'react';
import '../styles/RegisterStyle.css';
import backgroundImage from '../../src/imgs/4.png';

const WaveInput = ({ type, placeholder, value, onChange, validate, required = true, maxLength }) => {
  let statusClass = '';
  
  if (value && value.length > 0) {
    statusClass = 'active'; 

    if (validate) {
      const isValid = validate(value);
      statusClass += isValid ? ' valid' : ' invalid';
    }
  }

  return (
    <div className="input-group" style={{ width: '100%' }}>
      <input 
        type={type} 
        className={`form-input ${statusClass}`} 
        value={value} 
        onChange={onChange} 
        required={required}
        maxLength={maxLength}
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
  const [email, setEmail] = useState('');
  
  const [countryCode, setCountryCode] = useState('+36');
  const [localPhone, setLocalPhone] = useState('');

  const [password, setPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  
  const [message, setMessage] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState('register');
  const [isLoading, setIsLoading] = useState(false);

  const validateFullname = (name) => /^[A-Za-zÁÉÍÓÖŐÚÜŰáéíóöőúüű]+ [A-Za-zÁÉÍÓÖŐÚÜŰáéíóöőúüű]+$/.test(name);
  const validateEmail = (mail) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail);
  
  const validateLocalPhone = (phone) => /^[0-9]{9}$/.test(phone);
  
  const validatePassword = (pass) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(pass);

  const handleLocalPhoneChange = (e) => {
    const onlyNums = e.target.value.replace(/\D/g, '');
    setLocalPhone(onlyNums);
  };

  const handleRegisterSubmit = async (event) => {
    event.preventDefault();
    setMessage('');

    const fullPhoneNumber = `${countryCode}${localPhone}`;

    if (!agreedToTerms) { setMessage("El kell fogadnod az ÁSZF-et a regisztrációhoz!"); return; }
    if (!validateFullname(fullname)) { setMessage("A teljes név két szóból álljon, csak betűk."); return; }
    if (!validateEmail(email)) { setMessage("Érvényes email címet adj meg."); return; }
    if (!validateLocalPhone(localPhone)) { setMessage("A telefonszám formátuma nem megfelelő (9 számjegy szükséges)."); return; }
    if (!validatePassword(password)) { setMessage("Gyenge jelszó."); return; }

    setIsLoading(true);

    const registerDto = {
      Name: fullname,
      Email: email,
      Phone: fullPhoneNumber,
      Password: password
    };

    try {
      const response = await fetch('http://localhost:5083/api/Auth/RegisterRequest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerDto)
      });

      const data = await response.text();

      if (response.ok) {
        setStep('verify');
        setMessage("Kérlek írd be az emailben kapott 6 jegyű kódot!");
      } else {
        setMessage(data || "Hiba történt a regisztráció során.");
      }
    } catch (error) {
      setMessage("Nem sikerült kapcsolódni a szerverhez.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifySubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setIsLoading(true);

    const fullPhoneNumber = `${countryCode}${localPhone}`;

    const registerDto = {
      Name: fullname,
      Email: email,
      Phone: fullPhoneNumber,
      Password: password
    };

    try {
      const url = `http://localhost:5083/api/Auth/VerifyAndRegister?email=${encodeURIComponent(email)}&code=${verificationCode}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerDto)
      });

      const data = await response.text();

      if (response.ok) {
        setStep('success');
        setMessage(data);
      } else {
        setMessage(data || "Hibás vagy lejárt kód!");
      }
    } catch (error) {
      setMessage("Hiba történt a kommunikáció során.");
    } finally {
      setIsLoading(false);
    }
  };

  const selectStyle = {
    background: 'transparent',
    border: 'none',
    borderBottom: '2px solid #fff',
    color: '#fff',
    padding: '10px 5px',
    fontSize: '16px',
    outline: 'none',
    cursor: 'pointer',
    width: '80px',
    height: '100%',
    marginTop: '0px'
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
        
        {step !== 'success' && (
          <a href="/" className="back-to-home">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} width={20} height={20}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
            Vissza
          </a>
        )}
        
        <h2 className="register-title">Regisztráció</h2>

        {step === 'register' && (
          <>
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

            <form className="register-form" onSubmit={handleRegisterSubmit}>
              <WaveInput 
                type="text" 
                placeholder="Teljes név" 
                value={fullname} 
                onChange={e => setFullname(e.target.value)} 
                validate={validateFullname} 
              />
              
              <WaveInput 
                type="email" 
                placeholder="Email cím" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                validate={validateEmail} 
              />
              
              <div className="phone-input-container">
                <div>
                    <select 
                        value={countryCode} 
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="country-select"
                    >
                        <option value="+36">+36</option>
                        <option value="+40">+40</option>
                        <option value="+421">+421</option>
                        <option value="+43">+43</option>
                        <option value="+380">+380</option>
                        <option value="+381">+381</option>
                        <option value="+385">+385</option>
                        <option value="+386">+386</option>
                    </select>
                </div>

                <div className="phone-number-wrapper">
                    <WaveInput 
                        type="text" 
                        placeholder="Telefonszám" 
                        value={localPhone} 
                        onChange={handleLocalPhoneChange} 
                        validate={validateLocalPhone} 
                        maxLength={9} 
                    />
                </div>
              </div>
              
              <WaveInput 
                type="password" 
                placeholder="Jelszó" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                validate={validatePassword} 
              />

              {message && <div className="register-message error">{message}</div>}

              <div className="register-bottom-row">
                <label className="aszf-label">
                  <input type="checkbox" checked={agreedToTerms} onChange={e => setAgreedToTerms(e.target.checked)} required className="aszf-checkbox" />
                  Elfogadom az Általános Szerződési Feltételeket
                </label>
                <button type="submit" className="reg-button" disabled={isLoading}>
                  {isLoading ? 'Küldés...' : 'Regisztráció'}
                </button>
              </div>
              
              <div className='login-link-wrapper'>
                Már van fiókod? <a href="../login" className="login-link">Jelentkezz be!</a>
              </div>
            </form>
          </>
        )}

        {step === 'verify' && (
          <div className="verify-container">
             <div className="register-welcome">
                <div className="register-welcome-text" style={{textAlign: 'center'}}>
                  Elküldtünk egy 6 jegyű kódot a(z) <strong>{email}</strong> címre.<br/>
                  A kód 5 percig érvényes.<br/>
                  Kérjük, írd be a folytatáshoz!
                </div>
             </div>

             <form className="register-form" onSubmit={handleVerifySubmit}>
                <WaveInput 
                  type="text" 
                  placeholder="6 jegyű kód" 
                  value={verificationCode} 
                  onChange={e => setVerificationCode(e.target.value)} 
                  required={true}
                />

                {message && <div className={`register-message ${message.includes('Hibás') ? 'error' : 'success'}`}>{message}</div>}

                <button type="submit" className="reg-button" style={{marginTop: '20px', width: '100%'}} disabled={isLoading}>
                  {isLoading ? 'Ellenőrzés...' : 'Kód beküldése'}
                </button>

                <div className='login-link-wrapper' style={{marginTop: '15px'}}>
                   <span className="login-link" onClick={() => setStep('register')} style={{cursor: 'pointer'}}>
                     Vissza a javításhoz
                   </span>
                </div>
             </form>
          </div>
        )}

        {step === 'success' && (
          <div className="success-container" style={{textAlign: 'center', padding: '20px'}}>
             <div style={{color: '#4ade80', marginBottom: '20px'}}>
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} width={64} height={64}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
               </svg>
             </div>
             <h3 style={{color: '#fff', marginBottom: '15px'}}>Sikeres regisztráció!</h3>
             <p style={{color: '#ccc', marginBottom: '30px'}}>
               A fiókodat létrehoztuk. Most már bejelentkezhetsz.
             </p>
             <a href="../login">
               <button className="reg-button" style={{width: '100%'}}>
                 Tovább a bejelentkezésre
               </button>
             </a>
          </div>
        )}

      </div>
    </div>
  );
}
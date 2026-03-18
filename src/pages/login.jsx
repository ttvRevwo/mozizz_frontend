import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AuthStyle.css';
import backgroundImage from '../../src/imgs/4.png';
import { decodeJwtPayload, getRoleIdFromClaims } from '../utils/auth';
import { getManualLogoUrl } from '../utils/cloudinary';

const LOGO_URL = getManualLogoUrl();

const getFirstValue = (obj, keys) => {
    if (!obj || typeof obj !== 'object') return null;
    for (const key of keys) {
        const value = obj[key];
        if (value !== undefined && value !== null && value !== '') return value;
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
        if (normalized === 'user')  return 2;
    }
    return null;
};

const WaveInput = ({ type, placeholder, value, onChange, validate, required = true }) => {
    let statusClass = '';
    if (value && value.length > 0) {
        statusClass = 'active';
        if (validate) statusClass += validate(value) ? ' valid' : ' invalid';
    }
    return (
        <div className="input-group">
            <input
                type={type}
                className={`form-input ${statusClass}`}
                value={value}
                onChange={onChange}
                required={required}
            />
            <label className="floating-label">
                {placeholder.split('').map((char, index) => (
                    <span key={index} style={{ transitionDelay: `${index * 35}ms` }}>
                        {char === ' ' ? '\u00A0' : char}
                    </span>
                ))}
            </label>
        </div>
    );
};

export default function Login() {
    const navigate = useNavigate();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loginMsg, setLoginMsg] = useState('');

    const [fpEmail,       setFpEmail]       = useState('');
    const [fpCode,        setFpCode]        = useState('');
    const [fpNewPassword, setFpNewPassword] = useState('');
    const [fpConfirm,     setFpConfirm]     = useState('');
    const [fpMsg,         setFpMsg]         = useState('');
    const [fpLoading,     setFpLoading]     = useState(false);

    const [view, setView] = useState('login');

    const validateEmail    = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    const validatePassword = (v) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(v);
    const validateConfirm  = (v) => v === fpNewPassword && validatePassword(v);

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setLoginMsg('');
        try {
            const response = await fetch('http://localhost:5083/api/Auth/Login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ Email: username, Password: password })
            });
            if (response.ok) {
                const data    = await response.json();
                const content = data?.data ?? data;
                const token   = getFirstValue(content, ['token', 'jwtToken', 'accessToken', 'access_token']);
                if (token) localStorage.setItem('token', token);
                const claims          = token ? decodeJwtPayload(token) : null;
                const resolvedUserId  = getFirstValue(content, ['userId', 'id']) ?? getFirstValue(claims, ['nameid', 'sub', 'userId', 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']);
                const resolvedName    = getFirstValue(content, ['name', 'userName', 'username']) ?? getFirstValue(claims, ['name', 'unique_name', 'given_name']);
                const resolvedEmail   = getFirstValue(content, ['email']) ?? getFirstValue(claims, ['email']);
                const resolvedRoleId  = getFirstValue(content, ['roleId', 'role']) ?? getRoleIdFromClaims(claims);
                const normalizedRoleId = normalizeRoleId(resolvedRoleId);
                setLoginMsg(`Sikeres bejelentkezés! Üdv, ${resolvedName || 'felhasználó'}!`);
                if (resolvedUserId  != null) localStorage.setItem('userId',    String(resolvedUserId));
                if (resolvedName)            localStorage.setItem('userName',  String(resolvedName));
                if (resolvedEmail)           localStorage.setItem('userEmail', String(resolvedEmail));
                if (!Number.isNaN(normalizedRoleId) && normalizedRoleId != null)
                    localStorage.setItem('roleId', String(normalizedRoleId));
                setTimeout(() => navigate('/'), 1000);
            } else {
                const errorText = await response.text();
                setLoginMsg(errorText || 'Hiba történt a bejelentkezés során.');
            }
        } catch {
            setLoginMsg('Nem sikerült csatlakozni a szerverhez.');
        }
    };

    const handleSendCode = async (e) => {
        e.preventDefault();
        setFpMsg('');
        if (!validateEmail(fpEmail)) { setFpMsg('Érvényes email címet adj meg.'); return; }
        setFpLoading(true);
        try {
            const res = await fetch(`http://localhost:5083/api/UserProfile/ForgotPassword`, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ Email: fpEmail }),
            });
            const text = await res.text();
            if (res.ok) {
                setView('reset');
                setFpMsg('Elküldtük a kódot! Ellenőrizd a postaládád.');
            } else {
                setFpMsg(text || 'Hiba történt a kód küldésekor.');
            }
        } catch {
            setFpMsg('Nem sikerült kapcsolódni a szerverhez.');
        } finally {
            setFpLoading(false);
        }
    };

    const handleReset = async (e) => {
        e.preventDefault();
        setFpMsg('');
        if (fpCode.length !== 6)             { setFpMsg('A kódnak pontosan 6 számjegyből kell állnia.'); return; }
        if (!validatePassword(fpNewPassword)) { setFpMsg('Gyenge jelszó. Legalább 8 karakter, kis- és nagybetű, szám és speciális karakter szükséges.'); return; }
        if (fpNewPassword !== fpConfirm)      { setFpMsg('A két jelszó nem egyezik.'); return; }
        setFpLoading(true);
        try {
            const res = await fetch(`http://localhost:5083/api/UserProfile/ResetPassword`, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ Email: fpEmail, Code: fpCode, NewPassword: fpNewPassword }),
            });
            let responseText = '';
            try {
                const json = await res.json();
                responseText = json?.uzenet ?? JSON.stringify(json);
            } catch {
                responseText = await res.text();
            }
            if (res.ok) {
                setView('fpSuccess');
                setFpMsg(responseText);
            } else {
                setFpMsg(responseText || 'Hibás vagy lejárt kód!');
            }
        } catch {
            setFpMsg('Hiba történt a kommunikáció során.');
        } finally {
            setFpLoading(false);
        }
    };

    const resetFpState = () => {
        setFpEmail(''); setFpCode(''); setFpNewPassword(''); setFpConfirm(''); setFpMsg('');
    };

    const isFpError = (msg) =>
        msg.includes('Hiba') || msg.includes('Hibás') || msg.includes('Érvényes') ||
        msg.includes('Gyenge') || msg.includes('nem egyezik') || msg.includes('pontosan') ||
        msg.includes('Nem sikerült');

    return (
        <div
            className="auth-bg"
            style={{
                backgroundImage:    `url(${backgroundImage})`,
                backgroundSize:     'cover',
                backgroundPosition: 'center center',
                backgroundRepeat:   'no-repeat',
            }}
        >
            <div className="register-container">

                {view === 'login' && (
                    <>
                        <a href="/" className="back-to-home">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} width={20} height={20}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                            </svg>
                            Vissza
                        </a>

                        <br />
                        <h2 className="register-title">Bejelentkezés</h2>

                        <div className="register-welcome">
                            <div className="register-logo">
                                <img src={LOGO_URL} alt="Mozi Logo" className="logo-icon" />
                            </div>
                            <div className="register-welcome-text">
                                Üdvözlünk a mozizz.hu-n! Jelentkezz be a legjobb filmélményekért és exkluzív ajánlatokért.
                            </div>
                        </div>

                        <form className="register-form" onSubmit={handleLoginSubmit}>
                            <WaveInput type="text"     placeholder="Email cím" value={username} onChange={e => setUsername(e.target.value)} />
                            <WaveInput type="password" placeholder="Jelszó"    value={password} onChange={e => setPassword(e.target.value)} />

                            {loginMsg && (
                                <div className={`register-message ${loginMsg.includes('Sikeres') ? 'success' : 'error'}`}>
                                    {loginMsg}
                                </div>
                            )}

                            <div className="register-bottom-row">
                                <span
                                    className="login-link"
                                    style={{ cursor: 'pointer', fontSize: '0.85rem' }}
                                    onClick={() => { resetFpState(); setView('forgot'); }}
                                >
                                    Elfelejtett jelszó
                                </span>
                                <button type="submit" className="reg-button">Bejelentkezés</button>
                            </div>

                            <div className="login-link-wrapper">
                                Nincs még fiókod? <a href="/register" className="login-link">Regisztrálj!</a>
                            </div>
                        </form>
                    </>
                )}

                {view === 'forgot' && (
                    <>
                        <button className="back-to-home" style={{ background: 'none', border: 'none' }} onClick={() => { setView('login'); setFpMsg(''); }}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} width={20} height={20}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                            </svg>
                            Vissza
                        </button>

                        <br />
                        <h2 className="register-title">Elfelejtett jelszó</h2>

                        <div className="register-welcome">
                            <div className="register-logo">
                                <img src={LOGO_URL} alt="Mozi Logo" className="logo-icon" />
                            </div>
                            <div className="register-welcome-text">
                                Add meg a fiókodhoz tartozó email címet, és küldünk egy kódot a jelszó visszaállításához.
                            </div>
                        </div>

                        <form className="register-form" onSubmit={handleSendCode}>
                            <WaveInput
                                type="email"
                                placeholder="Email cím"
                                value={fpEmail}
                                onChange={e => setFpEmail(e.target.value)}
                                validate={validateEmail}
                            />

                            {fpMsg && (
                                <div className={`register-message ${isFpError(fpMsg) ? 'error' : 'success'}`}>
                                    {fpMsg}
                                </div>
                            )}

                            <button type="submit" className="reg-button" style={{ marginTop: '20px', width: '100%' }} disabled={fpLoading}>
                                {fpLoading ? 'Küldés...' : 'Kód küldése'}
                            </button>

                            <div className="login-link-wrapper">
                                Eszedbe jutott?{' '}
                                <span className="login-link" style={{ cursor: 'pointer' }} onClick={() => { setView('login'); setFpMsg(''); }}>
                                    Jelentkezz be!
                                </span>
                            </div>
                        </form>
                    </>
                )}

                {view === 'reset' && (
                    <>
                        <button className="back-to-home" style={{ background: 'none', border: 'none' }} onClick={() => { setView('forgot'); setFpMsg(''); }}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} width={20} height={20}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                            </svg>
                            Vissza
                        </button>

                        <br />
                        <h2 className="register-title">Jelszó visszaállítás</h2>

                        <div className="register-welcome">
                            <div className="register-welcome-text" style={{ textAlign: 'center' }}>
                                Elküldtük a kódot a(z) <strong>{fpEmail}</strong> címre.<br />
                                A kód <strong>10 percig</strong> érvényes.
                            </div>
                        </div>

                        <form className="register-form" onSubmit={handleReset}>
                            <WaveInput
                                type="text"
                                placeholder="6 jegyű kód"
                                value={fpCode}
                                onChange={e => setFpCode(e.target.value.replace(/\D/g, ''))}
                                required
                            />
                            <WaveInput
                                type="password"
                                placeholder="Új jelszó"
                                value={fpNewPassword}
                                onChange={e => setFpNewPassword(e.target.value)}
                                validate={validatePassword}
                            />
                            <WaveInput
                                type="password"
                                placeholder="Jelszó megerősítése"
                                value={fpConfirm}
                                onChange={e => setFpConfirm(e.target.value)}
                                validate={validateConfirm}
                            />

                            {fpMsg && (
                                <div className={`register-message ${isFpError(fpMsg) ? 'error' : 'success'}`}>
                                    {fpMsg}
                                </div>
                            )}

                            <button type="submit" className="reg-button" style={{ marginTop: '20px', width: '100%' }} disabled={fpLoading}>
                                {fpLoading ? 'Mentés...' : 'Jelszó visszaállítása'}
                            </button>

                            <div className="login-link-wrapper">
                                <span className="login-link" style={{ cursor: 'pointer' }} onClick={() => { setView('forgot'); setFpMsg(''); }}>
                                    Rossz email? Visszalépek
                                </span>
                            </div>
                        </form>
                    </>
                )}

                {view === 'fpSuccess' && (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                        <div style={{ color: '#4ade80', marginBottom: '20px' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} width={64} height={64}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 style={{ color: '#fff', marginBottom: '15px' }}>Jelszó sikeresen megváltoztatva!</h3>
                        <p style={{ color: '#ccc', marginBottom: '30px' }}>
                            Most már bejelentkezhetsz az új jelszavaddal.
                        </p>
                        <button className="reg-button" style={{ width: '100%' }} onClick={() => { resetFpState(); setView('login'); }}>
                            Tovább a bejelentkezésre
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
}
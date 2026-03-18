import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authFetch } from '../utils/auth';
import '../styles/ProfileEditStyle.css';

const validateName  = (v) => /^[A-Za-zÁÉÍÓÖŐÚÜŰáéíóöőúüű]+ [A-Za-zÁÉÍÓÖŐÚÜŰáéíóöőúüű]+$/.test(v.trim());
const validatePhone = (v) => /^\+[0-9]{10,14}$/.test(v.replace(/\s/g, ''));
const validatePw    = (v) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(v);

const COUNTRY_CODES = ['+36', '+40', '+421', '+43', '+380', '+381', '+385', '+386'];

const strength = (p) => {
    if (!p) return null;
    if (p.length < 6)   return { text: 'Gyenge',  color: '#d11922', width: '33%' };
    if (!validatePw(p)) return { text: 'Közepes', color: '#c79c0f', width: '66%' };
    return               { text: 'Erős',    color: '#52b788', width: '100%' };
};

const Field = ({ label, hint, children, error }) => (
    <div className="pedit-field">
        <label>{label}</label>
        {children}
        {hint  && !error && <p className="pedit-hint">{hint}</p>}
        {error && <span className="pedit-mismatch">{error}</span>}
    </div>
);

export default function ProfileEdit() {
    const navigate = useNavigate();
    const userId   = localStorage.getItem('userId');

    const [name,        setName]        = useState('');
    const [countryCode, setCountryCode] = useState('+36');
    const [localPhone,  setLocalPhone]  = useState('');
    const [nameTouched,  setNameTouched]  = useState(false);
    const [phoneTouched, setPhoneTouched] = useState(false);
    const [profileMsg,    setProfileMsg]    = useState(null);
    const [profileIsErr,  setProfileIsErr]  = useState(false);
    const [profileSaving, setProfileSaving] = useState(false);

    const [oldPw,    setOldPw]    = useState('');
    const [newPw,    setNewPw]    = useState('');
    const [confirmPw,setConfirmPw]= useState('');
    const [newPwTouched, setNewPwTouched] = useState(false);
    const [pwMsg,    setPwMsg]    = useState(null);
    const [pwIsErr,  setPwIsErr]  = useState(false);
    const [pwSaving, setPwSaving] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('userName');
        if (stored) setName(stored);

        const storedPhone = localStorage.getItem('userPhone');
        if (storedPhone) {
            const match = storedPhone.match(/^(\+\d{1,4})(\d+)$/);
            if (match) {
                setCountryCode(match[1]);
                setLocalPhone(match[2]);
            }
        }
    }, []);

    const fullPhone    = `${countryCode}${localPhone}`;
    const phoneValid   = validatePhone(fullPhone);
    const nameValid    = validateName(name);
    const newPwStrength = strength(newPw);

    const handleLocalPhone = (e) => {
        setLocalPhone(e.target.value.replace(/\D/g, '').slice(0, 9));
        setPhoneTouched(true);
    };

    const handleProfileSave = async (e) => {
        e.preventDefault();
        setNameTouched(true);
        setPhoneTouched(true);
        setProfileMsg(null);

        if (!nameValid)  { setProfileMsg('Javítsd a hibákat a mentés előtt.'); setProfileIsErr(true); return; }
        if (localPhone && !phoneValid) { setProfileMsg('Javítsd a hibákat a mentés előtt.'); setProfileIsErr(true); return; }

        setProfileSaving(true);
        try {
            const res = await authFetch(
                `http://localhost:5083/api/UserProfile/Update/${userId}`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId:       parseInt(userId),
                        name:         name.trim(),
                        phone:        localPhone ? fullPhone : '',
                        email:        localStorage.getItem('userEmail') ?? '',
                        passwordHash: '',
                        roleId:       parseInt(localStorage.getItem('roleId') ?? '2'),
                        role:         { roleId: parseInt(localStorage.getItem('roleId') ?? '2'), roleName: parseInt(localStorage.getItem('roleId') ?? '2') === 1 ? 'Admin' : 'User' },
                    }),
                }
            );
            let data = null;
            try { data = await res.json(); } catch { data = null; }

            if (!res.ok) {
                console.error('Update 400 response:', JSON.stringify(data, null, 2));
                const errMsg = data?.uzenet ?? data?.title ?? JSON.stringify(data) ?? 'Hiba történt a mentés során.';
                setProfileMsg(errMsg);
                setProfileIsErr(true);
            } else {
                setProfileMsg(data?.uzenet ?? 'Profil sikeresen frissítve!');
                setProfileIsErr(false);
                localStorage.setItem('userName', name.trim());
                if (localPhone) localStorage.setItem('userPhone', fullPhone);
            }
        } catch {
            setProfileMsg('Nem sikerült csatlakozni a szerverhez.');
            setProfileIsErr(true);
        } finally {
            setProfileSaving(false);
        }
    };

    const handlePwSave = async (e) => {
        e.preventDefault();
        setNewPwTouched(true);
        setPwMsg(null);

        if (!oldPw) { setPwMsg('Add meg a jelenlegi jelszavadat.'); setPwIsErr(true); return; }
        if (!validatePw(newPw)) { setPwMsg('Az új jelszó nem elég erős.'); setPwIsErr(true); return; }
        if (newPw !== confirmPw) { setPwMsg('Az új jelszavak nem egyeznek!'); setPwIsErr(true); return; }

        setPwSaving(true);
        try {
            const res = await authFetch(
                `http://localhost:5083/api/UserProfile/ChangePassword/${userId}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ oldPassword: oldPw, newPassword: newPw }),
                }
            );
            let data = null;
            try { data = await res.json(); } catch { data = null; }

            if (!res.ok) {
                setPwMsg(data?.uzenet ?? 'Hiba történt a jelszóváltás során.');
                setPwIsErr(true);
            } else {
                setPwMsg(data?.uzenet ?? 'Jelszó sikeresen megváltoztatva!');
                setPwIsErr(false);
                setOldPw(''); setNewPw(''); setConfirmPw('');
                setNewPwTouched(false);
            }
        } catch {
            setPwMsg('Nem sikerült csatlakozni a szerverhez.');
            setPwIsErr(true);
        } finally {
            setPwSaving(false);
        }
    };

    return (
        <div className="pedit-page">
            <button className="pedit-back-btn" onClick={() => navigate('/Profile')}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor" strokeWidth={2} width={14} height={14}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
                Vissza a profilhoz
            </button>

            <div className="pedit-wrapper">

                <div className="pedit-card">
                    <h2 className="pedit-title">Profil adatok</h2>
                    <p className="pedit-card-desc">Név és telefonszám módosítása</p>

                    <form className="pedit-form" onSubmit={handleProfileSave}>

                        <Field
                            label="Teljes név"
                            hint="Vezetéknév és keresztnév, csak betűk"
                            error={nameTouched && !nameValid ? 'Két szóból álljon, csak betűk (pl. Kovács Péter)' : null}
                        >
                            <input
                                type="text"
                                value={name}
                                onChange={e => { setName(e.target.value); setNameTouched(true); }}
                                onBlur={() => setNameTouched(true)}
                                placeholder="Kovács Péter"
                                className={nameTouched ? (nameValid ? 'valid' : 'invalid') : ''}
                                autoComplete="name"
                            />
                        </Field>

                        <Field
                            label="Telefonszám"
                            hint="Csak számjegyek, max 9 jegy (előhívó nélkül)"
                            error={phoneTouched && localPhone && !phoneValid
                                ? 'Érvénytelen telefonszám (pl. 301234567)'
                                : null}
                        >
                            <div className="pedit-phone-row">
                                <select
                                    value={countryCode}
                                    onChange={e => setCountryCode(e.target.value)}
                                    className="pedit-country-select"
                                >
                                    {COUNTRY_CODES.map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                                <input
                                    type="text"
                                    value={localPhone}
                                    onChange={handleLocalPhone}
                                    onBlur={() => setPhoneTouched(true)}
                                    placeholder="301234567"
                                    maxLength={9}
                                    className={phoneTouched && localPhone
                                        ? (phoneValid ? 'valid' : 'invalid')
                                        : ''}
                                    autoComplete="tel-national"
                                    style={{ flex: 1 }}
                                />
                            </div>
                        </Field>

                        {profileMsg && (
                            <div className={`pedit-message ${profileIsErr ? 'error' : 'success'}`}>
                                {profileMsg}
                            </div>
                        )}

                        <button type="submit" className="pedit-submit-btn" disabled={profileSaving}>
                            {profileSaving ? 'Mentés...' : 'Adatok mentése'}
                        </button>
                    </form>
                </div>

                <div className="pedit-card">
                    <h2 className="pedit-title">Jelszó módosítása</h2>
                    <p className="pedit-card-desc">A jelszóváltáshoz a jelenlegi jelszó megadása szükséges</p>

                    <form className="pedit-form" onSubmit={handlePwSave}>

                        <Field label="Jelenlegi jelszó">
                            <input
                                type="password"
                                value={oldPw}
                                onChange={e => setOldPw(e.target.value)}
                                placeholder="••••••••"
                                required
                                autoComplete="current-password"
                            />
                        </Field>

                        <Field
                            label="Új jelszó"
                            hint="Min. 8 karakter, kis- és nagybetű, szám és speciális karakter (@$!%*?&)"
                            error={newPwTouched && newPw && !validatePw(newPw)
                                ? 'Nem elég erős a jelszó'
                                : null}
                        >
                            <input
                                type="password"
                                value={newPw}
                                onChange={e => { setNewPw(e.target.value); setNewPwTouched(true); }}
                                onBlur={() => setNewPwTouched(true)}
                                placeholder="••••••••"
                                required
                                autoComplete="new-password"
                                className={newPwTouched && newPw
                                    ? (validatePw(newPw) ? 'valid' : 'invalid')
                                    : ''}
                            />
                            {newPwStrength && (
                                <div className="pedit-strength">
                                    <div className="pedit-strength-track">
                                        <div className="pedit-strength-bar"
                                            style={{ background: newPwStrength.color, width: newPwStrength.width }} />
                                    </div>
                                    <span style={{ color: newPwStrength.color }}>{newPwStrength.text}</span>
                                </div>
                            )}
                        </Field>

                        <Field
                            label="Új jelszó megerősítése"
                            error={confirmPw && newPw !== confirmPw ? 'A jelszavak nem egyeznek' : null}
                        >
                            <input
                                type="password"
                                value={confirmPw}
                                onChange={e => setConfirmPw(e.target.value)}
                                placeholder="••••••••"
                                required
                                autoComplete="new-password"
                                className={confirmPw
                                    ? (newPw === confirmPw ? 'valid' : 'invalid')
                                    : ''}
                            />
                        </Field>

                        {pwMsg && (
                            <div className={`pedit-message ${pwIsErr ? 'error' : 'success'}`}>
                                {pwMsg}
                            </div>
                        )}

                        <button type="submit" className="pedit-submit-btn" disabled={pwSaving}>
                            {pwSaving ? 'Mentés...' : 'Jelszó megváltoztatása'}
                        </button>
                    </form>
                </div>

            </div>
        </div>
    );
}
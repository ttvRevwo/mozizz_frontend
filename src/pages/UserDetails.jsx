import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import '../App.css';

const UserCard = ({ user }) => {
    if (!user) return null;

    return (
        <div className="register-container" style={{ margin: '0 auto', textAlign: 'left' }}>
            <h2 className="register-title" style={{ fontSize: '1.8rem', marginBottom: '20px' }}>
                {user.name || user.username} adatai
            </h2>
            
            <div className="form-input" style={{ marginBottom: '10px', background: 'transparent', border: 'none', color: '#E0E0E0' }}>
                <strong style={{ color: '#c79c0f' }}>ID:</strong> {user.user_id || user.userId || user.id}
            </div>
            <div className="form-input" style={{ marginBottom: '10px', background: 'transparent', border: 'none', color: '#E0E0E0' }}>
                <strong style={{ color: '#c79c0f' }}>Név:</strong> {user.name || user.username}
            </div>
            <div className="form-input" style={{ marginBottom: '10px', background: 'transparent', border: 'none', color: '#E0E0E0' }}>
                <strong style={{ color: '#c79c0f' }}>Email:</strong> {user.email}
            </div>
            <div className="form-input" style={{ marginBottom: '20px', background: 'transparent', border: 'none', color: '#E0E0E0' }}>
                <strong style={{ color: '#c79c0f' }}>Telefonszám:</strong> {user.phone || 'Nincs megadva'}
            </div>
            <div className="form-input" style={{ marginBottom: '20px', background: 'transparent', border: 'none', color: '#E0E0E0' }}>
                <strong style={{ color: '#c79c0f' }}>Regisztráció ideje:<br></br></strong> {user.createdAt}
            </div>

            <Link to="/admin" style={{ textDecoration: 'none' }}>
                <button className="reg-button">
                    Vissza a listához
                </button>
            </Link>
        </div>
    )
};

export const UserDetails = () => {
    const { userId } = useParams(); 
    
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        const url = `http://localhost:5083/api/User/UserById?id=${userId}`;
        
        console.log("Lekérdezés indítása erre a címre:", url);

        fetch(url) 
        .then((res) => {
            if (!res.ok) {
                throw new Error(`Szerver hiba: ${res.status}`);
            }
            return res.json();
        })
        .then(data => {
            console.log("Backend válasz:", data);
            if (data && data.data) {
                setUser(data.data);
            } else {
                setUser(data);
            }
        })
        .catch(err => {
            console.log("Hiba történt:", err);
            setError(err.message);
            setUser(null); 
        })
        .finally(() => setLoading(false));
    }, [userId]);

    if(loading) return (
        <div className="app-container">
            <div style={{color: '#c79c0f', fontSize: '1.5rem'}}>Betöltés...</div>
        </div>
    );
    
    if(error || !user) return(
        <div className="app-container">
            <div className="register-container" style={{textAlign: 'center', borderColor: '#a11515'}}>
                 <h3 style={{color: '#a11515', marginBottom: '20px'}}>Hiba történt!</h3>
                 <p style={{color: '#E0E0E0'}}>A felhasználó nem található vagy hiba a szerverben.</p>
                 <p style={{color: '#888', fontSize: '0.9rem'}}>Keresett ID: {userId}</p>
                 <p style={{color: '#888', fontSize: '0.8rem'}}>Hibaüzenet: {error}</p>
                 <Link to="/admin">
                    <button className="nav-button" style={{marginTop: '20px'}}>Vissza az Admin felületre</button>
                 </Link>
            </div>
        </div>
    ); 

    return (
        <div className="app-container">
            <UserCard user={user} />
        </div>
    )
}

export default UserDetails;
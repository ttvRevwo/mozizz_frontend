import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import '../App.css';

function UserDetails() {
    const { userId } = useParams();
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);
    const [originalData, setOriginalData] = useState(null);
    const [userData, setUserData] = useState({
        userId: '',
        name: '',
        email: '',
        phone: '',
        roleId: 2
    });

    useEffect(() => {
        const url = `http://localhost:5083/api/User/UserById?id=${userId}`;
        
        fetch(url)
            .then(res => {
                if (!res.ok) throw new Error(`Szerver hiba: ${res.status}`);
                return res.json();
            })
            .then(data => {
                const user = data.data || data;
                setOriginalData(user);
                setUserData({
                    userId: user.user_id || user.userId || user.id,
                    name: user.name || '',
                    email: user.email || '',
                    phone: user.phone || user.phoneNumber || '',
                    roleId: user.roleId || 2
                });
            })
            .catch(err => {
                setMessage({ type: 'error', text: 'Nem sikerült betölteni a felhasználót.' });
            })
            .finally(() => setLoading(false));
    }, [userId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = () => {
        if (!originalData) return;

        const selectedRoleId = parseInt(userData.roleId);
        
        let roleName = "User";
        if (selectedRoleId === 1) roleName = "Admin";
        else if (selectedRoleId === 2) roleName = "User";
        else if (selectedRoleId === 3) roleName = "Guest";

        const bodyToSend = {
            ...originalData,
            userId: parseInt(userData.userId),
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            roleId: selectedRoleId,
            role: {
                roleId: selectedRoleId,
                roleName: roleName
            }
        };

        fetch('http://localhost:5083/api/User/ModifyUser', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bodyToSend)
        })
        .then(async response => {
            if (response.ok) {
                setMessage({ type: 'success', text: 'Adatok sikeresen frissítve!' });
                setTimeout(() => setMessage(null), 3000);
            } else {
                const errorData = await response.json();
                console.error("Server error:", errorData);
                let errorMsg = 'Hiba történt a mentés során.';
                if (errorData.errors) {
                    errorMsg = Object.values(errorData.errors).flat().join(', ');
                }
                setMessage({ type: 'error', text: errorMsg });
            }
        })
        .catch(error => {
            console.error(error);
            setMessage({ type: 'error', text: 'Hálózati hiba történt.' });
        });
    };

    if (loading) {
        return (
            <div className="app-container">
                <div style={{ color: '#c79c0f', fontSize: '1.5rem' }}>Betöltés...</div>
            </div>
        );
    }

    return (
        <div className="app-container" style={{ flexDirection: 'column', justifyContent: 'center' }}>
            <Link to="/admin" className="back-to-home" style={{ position: 'absolute', top: '20px', left: '20px' }}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} width={20} height={20}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
                Vissza a listához
            </Link>

            <div className="register-container" style={{ maxWidth: '600px', width: '100%', borderColor: '#c79c0f' }}>
                <h2 className="register-title" style={{ fontSize: '1.8rem', marginBottom: '30px' }}>
                    {userData.name} szerkesztése
                </h2>

                {message && (
                    <div className={`register-message ${message.type}`} style={{ marginBottom: '20px' }}>
                        {message.text}
                    </div>
                )}

                <div className="form-group" style={{ marginBottom: '15px' }}>
                    <label style={{ color: '#c79c0f', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>ID (Nem szerkeszthető)</label>
                    <input
                        type="text"
                        value={userData.userId}
                        disabled
                        className="form-input"
                        style={{ backgroundColor: '#222', color: '#666', borderColor: '#444', cursor: 'not-allowed' }}
                    />
                </div>

                <div className="form-group" style={{ marginBottom: '15px' }}>
                    <label style={{ color: '#c79c0f', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Jogosultság</label>
                    <select
                        name="roleId"
                        value={userData.roleId}
                        onChange={handleInputChange}
                        className="form-input"
                        style={{ cursor: 'pointer' }}
                    >
                        <option value="1">Adminisztrátor</option>
                        <option value="2">Felhasználó</option>
                        <option value="3">Vendég</option>
                    </select>
                </div>

                <div className="form-group" style={{ marginBottom: '15px' }}>
                    <label style={{ color: '#c79c0f', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Teljes Név</label>
                    <input
                        type="text"
                        name="name"
                        value={userData.name}
                        onChange={handleInputChange}
                        className="form-input"
                    />
                </div>

                <div className="form-group" style={{ marginBottom: '15px' }}>
                    <label style={{ color: '#c79c0f', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Email cím</label>
                    <input
                        type="email"
                        name="email"
                        value={userData.email}
                        onChange={handleInputChange}
                        className="form-input"
                    />
                </div>

                <div className="form-group" style={{ marginBottom: '25px' }}>
                    <label style={{ color: '#c79c0f', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Telefonszám</label>
                    <input
                        type="text"
                        name="phone"
                        value={userData.phone}
                        onChange={handleInputChange}
                        className="form-input"
                    />
                </div>

                <button 
                    onClick={handleSave}
                    className="reg-button" 
                    style={{ fontSize: '1.1rem' }}
                >
                    Mentés
                </button>
            </div>
        </div>
    );
}

export default UserDetails;
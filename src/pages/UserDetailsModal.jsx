import React, { useState, useEffect } from 'react';
import { authFetch } from '../utils/auth';

const UserDetailsModal = ({ userId, onClose, onSaved }) => {
    const [loading,      setLoading]      = useState(true);
    const [saving,       setSaving]       = useState(false);
    const [error,        setError]        = useState(null);
    const [success,      setSuccess]      = useState(null);
    const [originalData, setOriginalData] = useState(null);

    const [userData, setUserData] = useState({
        userId: '',
        name:   '',
        email:  '',
        phone:  '',
        roleId: 2
    });

    useEffect(() => {
        authFetch(`http://localhost:5083/api/User/UserById/${userId}`)
            .then(res => {
                if (!res.ok) throw new Error(`Szerver hiba: ${res.status}`);
                return res.json();
            })
            .then(data => {
                const user = data.data || data;
                setOriginalData(user);
                setUserData({
                    userId: user.user_id || user.userId || user.id || '',
                    name:   user.name        || '',
                    email:  user.email       || '',
                    phone:  user.phone       || user.phoneNumber || '',
                    roleId: user.roleId      || 2
                });
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [userId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        if (!originalData) return;
        setSaving(true);
        setError(null);
        setSuccess(null);

        const selectedRoleId = parseInt(userData.roleId);
        const roleName = selectedRoleId === 1 ? 'Admin' : 'User';

        const bodyToSend = {
            ...originalData,
            userId: parseInt(userData.userId),
            name:   userData.name,
            email:  userData.email,
            phone:  userData.phone,
            roleId: selectedRoleId,
            role: { roleId: selectedRoleId, roleName }
        };

        try {
            const response = await authFetch('http://localhost:5083/api/User/ModifyUser', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bodyToSend)
            });

            if (response.ok) {
                setSuccess('Adatok sikeresen frissítve!');
                setTimeout(() => { onSaved?.(); onClose(); }, 1200);
            } else if (response.status === 401) {
                setError('Nincs jogosultság. Jelentkezz be újra admin fiókkal.');
            } else {
                const errorData = await response.json().catch(() => null);
                setError(errorData?.errors
                    ? Object.values(errorData.errors).flat().join(', ')
                    : 'Hiba történt a mentés során.');
            }
        } catch (err) {
            setError('Hálózati hiba: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Biztosan törölni szeretnéd ezt a felhasználót?')) return;
        try {
            const response = await authFetch(`http://localhost:5083/api/User/DeleteUser/${userId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            });
            if (response.ok) {
                onSaved?.();
                onClose();
            } else if (response.status === 401) {
                setError('Nincs jogosultság a törléshez.');
            } else {
                setError('Hiba történt a törlés során.');
            }
        } catch (err) {
            setError('Hálózati hiba: ' + err.message);
        }
    };

    return (
        <div className="buffet-modal-overlay" onClick={onClose}>
            <div className="buffet-modal" style={{ width: '480px' }} onClick={e => e.stopPropagation()}>

                <div className="buffet-modal-header">
                    <h3>Felhasználó szerkesztése</h3>
                    <button className="buffet-modal-close" onClick={onClose}>✕</button>
                </div>

                {loading ? (
                    <div className="buffet-modal-body">
                        <p style={{ color: '#888', textAlign: 'center', padding: '30px' }}>Betöltés...</p>
                    </div>
                ) : (
                    <>
                        <div className="buffet-modal-body">

                            <label className="buffet-modal-label">ID (nem szerkeszthető)</label>
                            <input
                                className="buffet-modal-input"
                                value={userData.userId}
                                disabled
                                style={{ color: '#666', cursor: 'not-allowed', opacity: 0.6 }}
                            />

                            <label className="buffet-modal-label">Jogosultság</label>
                            <select
                                className="buffet-modal-input"
                                name="roleId"
                                value={userData.roleId}
                                onChange={handleChange}
                            >
                                <option value="1">Adminisztrátor</option>
                                <option value="2">Felhasználó</option>
                            </select>

                            <label className="buffet-modal-label">Teljes név</label>
                            <input
                                className="buffet-modal-input"
                                type="text"
                                name="name"
                                value={userData.name}
                                onChange={handleChange}
                            />

                            <label className="buffet-modal-label">Email cím</label>
                            <input
                                className="buffet-modal-input"
                                type="email"
                                name="email"
                                value={userData.email}
                                onChange={handleChange}
                            />

                            <label className="buffet-modal-label">Telefonszám</label>
                            <input
                                className="buffet-modal-input"
                                type="text"
                                name="phone"
                                value={userData.phone}
                                onChange={handleChange}
                            />

                            {error   && <div className="buffet-modal-error">{error}</div>}
                            {success && <div style={{ color: '#28a745', fontSize: '0.85rem', marginTop: '8px', padding: '8px 12px', background: 'rgba(40,167,69,0.1)', borderRadius: '6px', border: '1px solid rgba(40,167,69,0.3)' }}>{success}</div>}
                        </div>

                        <div className="buffet-modal-footer" style={{ justifyContent: 'space-between' }}>
                            <button
                                className="details-button"
                                style={{ backgroundColor: '#650f0f', color: 'white' }}
                                onClick={handleDelete}
                                disabled={saving}
                            >
                                Felhasználó törlése
                            </button>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button className="details-button" onClick={onClose} disabled={saving}>Mégse</button>
                                <button
                                    className="details-button"
                                    style={{ backgroundColor: saving ? '#555' : '#b8860b', color: '#1a0606' }}
                                    onClick={handleSave}
                                    disabled={saving}
                                >
                                    {saving ? 'Mentés...' : 'Mentés'}
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default UserDetailsModal;
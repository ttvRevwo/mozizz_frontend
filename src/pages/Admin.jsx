import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../Styles/AdminStyle.css';
import { authFetch } from '../utils/auth';
import { getCloudinaryImageUrl } from '../utils/cloudinary';
import AdminStats        from './AdminStats';
import NewMovieModal     from './NewMovieModal';
import EditMovieModal    from './EditMovieModal';
import UserDetailsModal  from './UserDetailsModal';
import UserBookingsModal from './UserBookingsModal';
import NewShowtimeModal  from './NewShowtimeModal';
import EditShowtimeModal from './EditShowtimeModal';

const UsersList = () => {
    const [users,          setUsers]          = useState([]);
    const [loading,        setLoading]        = useState(true);
    const [search,         setSearch]         = useState('');
    const [profileModal,   setProfileModal]   = useState(null);
    const [bookingsModal,  setBookingsModal]  = useState(null);

    const fetchUsers = () => {
        setLoading(true);
        authFetch('http://localhost:5083/api/User/GetAllUsers')
            .then(res => res.json())
            .then(tartalom => {
                if (Array.isArray(tartalom)) setUsers(tartalom);
                else if (tartalom?.data)     setUsers(Object.values(tartalom.data));
                else                         setUsers([]);
            })
            .catch(err => console.log(err))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchUsers(); }, []);

    if (loading) return <div className="loading-text">Felhasználók betöltése...</div>;
    if (!users.length) return <div className="admin-sub-panel"><div className="empty-message">Nincs felhasználó.</div></div>;

    const filtered = users.filter(u =>
        (u.name || u.username || '').toLowerCase().includes(search.toLowerCase()) ||
        (u.email || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="admin-sub-panel">
            {profileModal !== null && (
                <UserDetailsModal
                    userId={profileModal}
                    onClose={() => setProfileModal(null)}
                    onSaved={fetchUsers}
                />
            )}
            {bookingsModal !== null && (
                <UserBookingsModal
                    userId={bookingsModal.userId}
                    userName={bookingsModal.userName}
                    onClose={() => setBookingsModal(null)}
                />
            )}

            <h3 className="admin-title">Felhasználók listája ({users.length} db)</h3>
            <input
                className="admin-search"
                placeholder="🔍 Keresés név vagy email alapján..."
                value={search}
                onChange={e => setSearch(e.target.value)}
            />
            <div className="user-list-container">
                {filtered.map((user) => (
                    <div key={user.userId} className="user-card">
                        <div className="user-info">
                            <div className="user-name">{user.name || user.username}</div>
                            <div className="user-email">{user.email}</div>
                        </div>
                        <div className="action-buttons" style={{ display: 'flex', gap: '10px' }}>
                            <button
                                className="details-button"
                                onClick={() => setBookingsModal({ userId: user.userId, userName: user.name || user.username })}
                            >
                                Foglalások
                            </button>
                            <button
                                className="details-button"
                                onClick={() => setProfileModal(user.userId)}
                            >
                                Profil
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const MoviesList = () => {
    const [movies,        setMovies]        = useState([]);
    const [loading,       setLoading]       = useState(true);
    const [search,        setSearch]        = useState('');
    const [newModal,      setNewModal]      = useState(false);
    const [editMovieId,   setEditMovieId]   = useState(null);

    const fetchMovies = () => {
        setLoading(true);
        authFetch('http://localhost:5083/api/Movie/GetMovies')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data))  setMovies(data);
                else if (data?.data)      setMovies(Object.values(data.data));
                else                      setMovies([]);
            })
            .catch(err => console.log(err))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchMovies(); }, []);

    const handleDelete = (id) => {
        if (!window.confirm('Biztosan törölni szeretnéd ezt a filmet?')) return;
        authFetch(`http://localhost:5083/api/Movie/DeleteMovie/${id}`, { method: 'DELETE' })
            .then(res => {
                if (res.ok)               fetchMovies();
                else if (res.status===401) alert('Nincs jogosultság. Jelentkezz be újra admin fiókkal.');
                else                       alert('Hiba a törlés során.');
            });
    };

    if (loading) return <div className="loading-text">Filmek betöltése...</div>;

    const filtered = movies.filter(m =>
        (m.title || '').toLowerCase().includes(search.toLowerCase()) ||
        (m.genre  || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="admin-sub-panel">
            {newModal && (
                <NewMovieModal onClose={() => setNewModal(false)} onSaved={fetchMovies} />
            )}
            {editMovieId !== null && (
                <EditMovieModal
                    movieId={editMovieId}
                    onClose={() => setEditMovieId(null)}
                    onSaved={fetchMovies}
                />
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 className="admin-title" style={{ margin: 0 }}>Filmek listája ({movies.length} db)</h3>
                <button
                    className="details-button"
                    style={{ backgroundColor: '#115420', fontSize: '1rem', padding: '10px 20px' }}
                    onClick={() => setNewModal(true)}
                >
                    + Új Film
                </button>
            </div>
            <input
                className="admin-search"
                placeholder="🔍 Keresés cím vagy műfaj alapján..."
                value={search}
                onChange={e => setSearch(e.target.value)}
            />
            {!filtered.length ? (
                <div className="empty-message">Nincs találat.</div>
            ) : (
                <div className="user-list-container">
                    {filtered.map((movie) => {
                        const id = movie.id || movie.movieId;
                        return (
                            <div key={id} className="user-card" style={{ borderColor: '#ff6a00' }}>
                                <div className="user-info">
                                    <div className="user-name">{movie.title}</div>
                                    <div className="user-email">{movie.genre || 'Nincs műfaj'}</div>
                                </div>
                                <div className="action-buttons" style={{ display: 'flex', gap: '10px' }}>
                                    <button
                                        className="details-button"
                                        onClick={() => setEditMovieId(id)}
                                    >
                                        Szerkesztés
                                    </button>
                                    <button
                                        className="details-button"
                                        style={{ backgroundColor: '#650f0f', color: 'white' }}
                                        onClick={() => handleDelete(id)}
                                    >
                                        Törlés
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

const ShowtimesList = () => {
    const [showtimes,      setShowtimes]      = useState([]);
    const [loading,        setLoading]        = useState(true);
    const [search,         setSearch]         = useState('');
    const [newModal,       setNewModal]       = useState(false);
    const [editShowtimeId, setEditShowtimeId] = useState(null);

    const fetchShowtimes = async () => {
        setLoading(true);
        try {
            const res  = await authFetch('http://localhost:5083/api/Showtime/GetAllShowtimes');
            const data = await res.json();
            setShowtimes(Array.isArray(data) ? data : (data.data || []));
        } catch (err) {
            console.error('Hiba az adatok betöltésekor:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchShowtimes(); }, []);

    const handleDelete = (id) => {
        if (!window.confirm('Biztosan törölni akarod ezt a vetítést?')) return;
        authFetch(`http://localhost:5083/api/Showtime/DeleteShowtime/${id}`, { method: 'DELETE' })
            .then(res => {
                if (res.ok)                fetchShowtimes();
                else if (res.status===401) alert('Nincs jogosultság. Jelentkezz be újra admin fiókkal.');
                else                       alert('Hiba történt.');
            })
            .catch(err => alert('Szerver hiba: ' + err));
    };

    if (loading) return <div className="loading-text">Vetítések betöltése...</div>;

    const filtered = showtimes.filter(st =>
        (st.movieTitle || st.MovieTitle || '').toLowerCase().includes(search.toLowerCase()) ||
        (st.date       || st.Date       || '').includes(search) ||
        (st.hallName   || st.HallName   || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="admin-sub-panel">
            {newModal && (
                <NewShowtimeModal onClose={() => setNewModal(false)} onSaved={fetchShowtimes} />
            )}
            {editShowtimeId !== null && (
                <EditShowtimeModal
                    showtimeId={editShowtimeId}
                    onClose={() => setEditShowtimeId(null)}
                    onSaved={fetchShowtimes}
                />
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 className="admin-title" style={{ margin: 0 }}>Vetítések ({showtimes.length} db)</h3>
                <button
                    className="details-button"
                    style={{ backgroundColor: '#005f73', fontSize: '1rem', padding: '10px 20px' }}
                    onClick={() => setNewModal(true)}
                >
                    + Új Vetítés
                </button>
            </div>
            <input
                className="admin-search"
                placeholder="🔍 Keresés film, dátum vagy terem alapján..."
                value={search}
                onChange={e => setSearch(e.target.value)}
            />
            {!filtered.length ? (
                <div className="empty-message">Nincs találat.</div>
            ) : (
                <div className="user-list-container">
                    {filtered.map((st) => {
                        const id = st.showtimeId || st.ShowtimeId;
                        return (
                            <div key={id} className="user-card" style={{ borderColor: '#00d2ff' }}>
                                <div className="user-info">
                                    <div className="user-name">{st.movieTitle || st.MovieTitle}</div>
                                    <div className="user-email">
                                        {st.date || st.Date} – {st.time || st.Time} | <strong>{st.hallName || st.HallName}</strong>
                                    </div>
                                </div>
                                <div className="action-buttons" style={{ display: 'flex', gap: '10px' }}>
                                    <button
                                        className="details-button"
                                        onClick={() => setEditShowtimeId(id)}
                                    >
                                        Szerkesztés
                                    </button>
                                    <button
                                        className="details-button"
                                        style={{ backgroundColor: '#650f0f', color: 'white' }}
                                        onClick={() => handleDelete(id)}
                                    >
                                        Törlés
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

const CATEGORY_LABELS = {
    'menü':    'Kombók & Menük',
    'popcorn': 'Popcorn',
    'snack':   'Snackek',
    'édesség': 'Édesség',
    'ital':    'Üdítők & Italok',
};
const CATEGORY_OPTIONS = ['menü', 'popcorn', 'snack', 'édesség', 'ital'];

const BuffetModal = ({ item, onClose, onSaved }) => {
    const isEdit = !!item?.itemId;
    const [form, setForm] = useState({
        name:        item?.name        ?? '',
        description: item?.description ?? '',
        price:       item?.price       ?? '',
        category:    item?.category    ?? 'snack',
        isAvailable: item?.isAvailable ?? true,
    });
    const [imageFile,  setImageFile]  = useState(null);
    const [previewUrl, setPreviewUrl] = useState(item?.img ? getCloudinaryImageUrl(item.img) : null);
    const [saving,     setSaving]     = useState(false);
    const [error,      setError]      = useState(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0] || null;
        setImageFile(file);
        if (file) setPreviewUrl(URL.createObjectURL(file));
    };

    const handleSubmit = async () => {
        if (!form.name || !form.price) { setError('Név és ár kötelező!'); return; }
        setSaving(true);
        setError(null);
        const fd = new FormData();
        fd.append('name',        form.name);
        fd.append('description', form.description);
        fd.append('price',       form.price);
        fd.append('category',    form.category);
        fd.append('isAvailable', form.isAvailable);
        if (imageFile) fd.append('imageFile', imageFile);

        const url    = isEdit ? `http://localhost:5083/api/Buffet/ModifyItem/${item.itemId}` : 'http://localhost:5083/api/Buffet/NewItem';
        const method = isEdit ? 'PUT' : 'POST';

        try {
            const res = await authFetch(url, { method, body: fd });
            if (res.ok) { onSaved(); onClose(); }
            else        { setError('Hiba a mentés során.'); }
        } catch { setError('Szerver hiba.'); }
        finally  { setSaving(false); }
    };

    return (
        <div className="buffet-modal-overlay" onClick={onClose}>
            <div className="buffet-modal" onClick={e => e.stopPropagation()}>
                <div className="buffet-modal-header">
                    <h3>{isEdit ? 'Termék szerkesztése' : 'Új termék felvitele'}</h3>
                    <button className="buffet-modal-close" onClick={onClose}>✕</button>
                </div>
                <div className="buffet-modal-body">
                    <label className="buffet-modal-label">Név *</label>
                    <input className="buffet-modal-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="pl. Vajas Popcorn L" />

                    <label className="buffet-modal-label">Leírás</label>
                    <input className="buffet-modal-input" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Rövid leírás" />

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <div style={{ flex: 1 }}>
                            <label className="buffet-modal-label">Ár (Ft) *</label>
                            <input className="buffet-modal-input" type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="1200" />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label className="buffet-modal-label">Kategória</label>
                            <select className="buffet-modal-input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                                {CATEGORY_OPTIONS.map(c => (
                                    <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <label className="buffet-modal-label">Kép feltöltése</label>
                    <input className="buffet-modal-input" type="file" accept="image/*" onChange={handleImageChange} />
                    {previewUrl && (
                        <div style={{ marginTop: '10px', textAlign: 'center' }}>
                            <img src={previewUrl} alt="Előnézet" style={{ maxHeight: '130px', maxWidth: '100%', borderRadius: '8px', border: '1px solid #444', objectFit: 'cover' }} />
                            <div style={{ fontSize: '0.72rem', color: '#888', marginTop: '4px' }}>{imageFile ? 'Új kép – feltöltés mentéskor' : 'Jelenlegi kép'}</div>
                        </div>
                    )}

                    <label className="buffet-modal-label buffet-modal-checkbox-row">
                        <input type="checkbox" checked={form.isAvailable} onChange={e => setForm(f => ({ ...f, isAvailable: e.target.checked }))} />
                        <span>Elérhető a büfében</span>
                    </label>

                    {error && <div className="buffet-modal-error">{error}</div>}
                </div>
                <div className="buffet-modal-footer">
                    <button className="details-button" onClick={onClose} disabled={saving}>Mégse</button>
                    <button className="details-button" style={{ backgroundColor: saving ? '#555' : '#b8860b', color: '#1a0606' }} onClick={handleSubmit} disabled={saving}>
                        {saving ? 'Mentés...' : (isEdit ? 'Mentés' : 'Létrehozás')}
                    </button>
                </div>
            </div>
        </div>
    );
};

const BuffetList = () => {
    const [items,   setItems]   = useState([]);
    const [loading, setLoading] = useState(true);
    const [search,  setSearch]  = useState('');
    const [modal,   setModal]   = useState(null);

    const fetchItems = () => {
        setLoading(true);
        authFetch('http://localhost:5083/api/Buffet/AllItems')
            .then(res => res.json())
            .then(data => setItems(Array.isArray(data) ? data : []))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchItems(); }, []);

    const handleToggle = (item) => {
        const fd = new FormData();
        fd.append('name',        item.name);
        fd.append('description', item.description ?? '');
        fd.append('price',       item.price);
        fd.append('category',    item.category);
        fd.append('isAvailable', !item.isAvailable);
        authFetch(`http://localhost:5083/api/Buffet/ModifyItem/${item.itemId}`, { method: 'PUT', body: fd })
            .then(res => { if (res.ok) fetchItems(); else alert('Hiba a státusz módosításakor.'); });
    };

    const handleDelete = (id) => {
        if (!window.confirm('Biztosan törölni szeretnéd ezt a terméket?')) return;
        authFetch(`http://localhost:5083/api/Buffet/DeleteItem/${id}`, { method: 'DELETE' })
            .then(res => { if (res.ok) fetchItems(); else alert('Hiba a törlés során.'); });
    };

    if (loading) return <div className="loading-text">Büfé termékek betöltése...</div>;

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        (item.description || '').toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase())
    );

    const grouped = {};
    filteredItems.forEach(item => {
        if (!grouped[item.category]) grouped[item.category] = [];
        grouped[item.category].push(item);
    });

    return (
        <div className="admin-sub-panel">
            {modal !== null && (
                <BuffetModal
                    item={modal === 'new' ? null : modal}
                    onClose={() => setModal(null)}
                    onSaved={fetchItems}
                />
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 className="admin-title" style={{ margin: 0 }}>Büfé termékek ({items.length} db)</h3>
                <button className="details-button" style={{ backgroundColor: '#115420', fontSize: '1rem', padding: '10px 20px' }} onClick={() => setModal('new')}>
                    + Új Termék
                </button>
            </div>

            <input className="admin-search" placeholder="🔍 Keresés név, leírás vagy kategória alapján..." value={search} onChange={e => setSearch(e.target.value)} />

            {!filteredItems.length ? (
                <div className="empty-message">Nincs találat.</div>
            ) : (
                <div className="user-list-container">
                    {Object.entries(grouped).map(([category, catItems]) => (
                        <div key={category}>
                            <div style={{ color: '#E0AA3E', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '2px', textTransform: 'uppercase', padding: '6px 0 8px', borderBottom: '1px solid #333', marginBottom: '8px', flexShrink: 0 }}>
                                {CATEGORY_LABELS[category] || category}
                            </div>
                            {catItems.map(item => (
                                <div key={item.itemId} className="user-card" style={{ borderColor: item.isAvailable ? '#2a6e3f' : '#650f0f', marginBottom: '10px' }}>
                                    <div className="user-info">
                                        <div className="user-name">{item.name}</div>
                                        <div className="user-email">{item.description}&nbsp;|&nbsp;<strong style={{ color: '#E0AA3E' }}>{item.price} Ft</strong></div>
                                    </div>
                                    <div className="action-buttons" style={{ alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.72rem', color: item.isAvailable ? '#28a745' : '#dc3545', marginRight: '4px', whiteSpace: 'nowrap', alignSelf: 'center' }}>
                                            {item.isAvailable ? '● Elérhető' : '● Rejtett'}
                                        </span>
                                        <button className="details-button" onClick={() => setModal(item)}>Szerkesztés</button>
                                        <button className="details-button" style={{ backgroundColor: item.isAvailable ? '#4a1a0a' : '#0a3a1a' }} onClick={() => handleToggle(item)}>
                                            {item.isAvailable ? 'Letiltás' : 'Engedélyezés'}
                                        </button>
                                        <button className="details-button" style={{ backgroundColor: '#650f0f', color: 'white' }} onClick={() => handleDelete(item.itemId)}>Törlés</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const TABS = [
    { key: 'users',     label: 'Felhasználók & Foglalások' },
    { key: 'movies',    label: 'Filmek' },
    { key: 'showtimes', label: 'Vetítések' },
    { key: 'buffet',    label: '🍿 Büfé' },
    { key: 'stats',     label: '📊 Statisztikák' },
];

function Admin() {
    const [activeTab, setActiveTab] = useState('users');

    return (
        <div className="app-container admin-view">
            <Link to="/" className="back-to-home">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} width={20} height={20}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
                Vissza a főoldalra
            </Link>

            <div className="admin-panel">
                <div className="admin-tabs">
                    {TABS.map(tab => (
                        <button
                            key={tab.key}
                            className={`details-button ${activeTab === tab.key ? 'active' : ''}`}
                            style={{ backgroundColor: activeTab === tab.key ? '#b8860b' : 'transparent', border: '1px solid #b8860b' }}
                            onClick={() => setActiveTab(tab.key)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {activeTab === 'users'     && <UsersList />}
                {activeTab === 'movies'    && <MoviesList />}
                {activeTab === 'showtimes' && <ShowtimesList />}
                {activeTab === 'buffet'    && <BuffetList />}
                {activeTab === 'stats'     && <AdminStats />}
            </div>
        </div>
    );
}

export default Admin;
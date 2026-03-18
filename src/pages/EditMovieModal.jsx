import React, { useState, useEffect } from 'react';
import { authFetch } from '../utils/auth';
import { getCloudinaryImageUrl } from '../utils/cloudinary';

const EditMovieModal = ({ movieId, onClose, onSaved }) => {
    const [loading,      setLoading]      = useState(true);
    const [saving,       setSaving]       = useState(false);
    const [imageFile,    setImageFile]    = useState(null);
    const [previewUrl,   setPreviewUrl]   = useState(null);
    const [error,        setError]        = useState(null);

    const [formData, setFormData] = useState({
        Title:       '',
        Description: '',
        Genre:       '',
        ReleaseDate: '',
        Director:    '',
        Rating:      '',
        Duration:    ''
    });

    useEffect(() => {
        authFetch(`http://localhost:5083/api/Movie/MovieById/${movieId}`)
            .then(res => {
                if (!res.ok) throw new Error('Film nem található.');
                return res.json();
            })
            .then(data => {
                const m = data.data || data;
                const rawDate = m.releaseDate || m.ReleaseDate || m.release_date || '';
                const dateVal = rawDate ? rawDate.split('T')[0] : '';
                setFormData({
                    Title:       m.title       || m.Title       || '',
                    Description: m.description || m.Description || '',
                    Genre:       m.genre       || m.Genre       || '',
                    ReleaseDate: dateVal,
                    Director:    m.director    || m.Director    || '',
                    Rating:      m.rating      || m.Rating      || '',
                    Duration:    m.duration    || m.Duration    || ''
                });
                const imgPath = m.img || m.Img || m.imageUrl || m.ImageUrl;
                if (imgPath) setPreviewUrl(getCloudinaryImageUrl(imgPath));
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [movieId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const data = new FormData();
    data.append('MovieId',     movieId);
    data.append('Title',       formData.Title);
    data.append('Description', formData.Description);
    data.append('Genre',       formData.Genre);
    data.append('Director',    formData.Director);
    data.append('Rating',      formData.Rating);
    data.append('Duration',    formData.Duration);
    if (formData.ReleaseDate) {
        data.append('ReleaseDate', `${formData.ReleaseDate}T00:00:00`);
    }
    if (imageFile) data.append('imageFile', imageFile);

    try {
        const response = await authFetch('http://localhost:5083/api/Movie/ModifyMovie', {
            method: 'PUT',
            body: data
        });

        if (response.ok) {
            onSaved();
            onClose();
        } else if (response.status === 401) {
            setError('Nincs jogosultság. Jelentkezz be újra admin fiókkal.');
        } else {
            const text = await response.text();
            setError('Hiba: ' + text);
        }
    } catch (err) {
        setError('Szerver hiba: ' + err.message);
    } finally {
        setSaving(false);
    }
};

    return (
        <div className="buffet-modal-overlay" onClick={onClose}>
            <div className="buffet-modal" style={{ width: '600px' }} onClick={e => e.stopPropagation()}>

                <div className="buffet-modal-header">
                    <h3>Film szerkesztése</h3>
                    <button className="buffet-modal-close" onClick={onClose}>✕</button>
                </div>

                {loading ? (
                    <div className="buffet-modal-body">
                        <p style={{ color: '#888', textAlign: 'center', padding: '30px' }}>Betöltés...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="buffet-modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px' }}>

                            <div style={{ gridColumn: 'span 2', marginBottom: '6px' }}>
                                <label className="buffet-modal-label">Borítókép</label>
                                <input
                                    className="buffet-modal-input"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                                {previewUrl && (
                                    <div style={{ marginTop: '10px', textAlign: 'center' }}>
                                        <img
                                            src={previewUrl}
                                            alt="Előnézet"
                                            style={{ maxHeight: '120px', maxWidth: '100%', borderRadius: '8px', border: '1px solid #E0AA3E', objectFit: 'cover' }}
                                        />
                                        <div style={{ fontSize: '0.72rem', color: '#888', marginTop: '4px' }}>
                                            {imageFile ? 'Új kép – feltöltés mentéskor' : 'Jelenlegi kép'}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div style={{ gridColumn: 'span 2' }}>
                                <label className="buffet-modal-label">Cím *</label>
                                <input className="buffet-modal-input" type="text" name="Title" value={formData.Title} onChange={handleChange} required placeholder="pl. A Keresztapa" />
                            </div>

                            <div>
                                <label className="buffet-modal-label">Műfaj *</label>
                                <input className="buffet-modal-input" type="text" name="Genre" value={formData.Genre} onChange={handleChange} required placeholder="pl. Dráma, Akció" />
                            </div>

                            <div>
                                <label className="buffet-modal-label">Hossz (perc) *</label>
                                <input className="buffet-modal-input" type="number" name="Duration" value={formData.Duration} onChange={handleChange} required min="1" placeholder="pl. 120" />
                            </div>

                            <div>
                                <label className="buffet-modal-label">Korhatár (Rating) *</label>
                                <input className="buffet-modal-input" type="text" name="Rating" value={formData.Rating} onChange={handleChange} required placeholder="pl. 16+" />
                            </div>

                            <div>
                                <label className="buffet-modal-label">Megjelenés dátuma *</label>
                                <input className="buffet-modal-input" type="date" name="ReleaseDate" value={formData.ReleaseDate} onChange={handleChange} required style={{ colorScheme: 'dark' }} />
                            </div>

                            <div style={{ gridColumn: 'span 2' }}>
                                <label className="buffet-modal-label">Leírás *</label>
                                <textarea className="buffet-modal-input" name="Description" value={formData.Description} onChange={handleChange} required rows={4} placeholder="A film rövid leírása..." style={{ resize: 'vertical', fontFamily: 'inherit' }} />
                            </div>

                            {error && (
                                <div className="buffet-modal-error" style={{ gridColumn: 'span 2' }}>{error}</div>
                            )}
                        </div>

                        <div className="buffet-modal-footer">
                            <button type="button" className="details-button" onClick={onClose} disabled={saving}>Mégse</button>
                            <button type="submit" className="details-button" style={{ backgroundColor: saving ? '#555' : '#b8860b', color: '#1a0606' }} disabled={saving}>
                                {saving ? 'Mentés...' : 'Változtatások mentése'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default EditMovieModal;
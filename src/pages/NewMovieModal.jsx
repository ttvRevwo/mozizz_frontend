import React, { useState } from 'react';
import { authFetch } from '../utils/auth';

const NewMovieModal = ({ onClose, onSaved }) => {
    const [loading,      setLoading]      = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const data = new FormData();
        data.append('Title',       formData.Title);
        data.append('Description', formData.Description);
        data.append('Genre',       formData.Genre);
        data.append('Director',    formData.Director);
        data.append('Rating',      formData.Rating);
        data.append('Duration',    formData.Duration);
        if (formData.ReleaseDate) data.append('ReleaseDate', `${formData.ReleaseDate}T00:00:00`);
        if (selectedFile)         data.append('imageFile', selectedFile);

        try {
            const response = await authFetch('http://localhost:5083/api/Movie/NewMovie', { method: 'POST', body: data });
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
            setLoading(false);
        }
    };

    return (
        <div className="buffet-modal-overlay" onClick={onClose}>
            <div className="buffet-modal" style={{ width: '600px' }} onClick={e => e.stopPropagation()}>

                <div className="buffet-modal-header">
                    <h3>Új film felvétele</h3>
                    <button className="buffet-modal-close" onClick={onClose}>✕</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="buffet-modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px' }}>

                        <div style={{ gridColumn: 'span 2', marginBottom: '6px' }}>
                            <label className="buffet-modal-label">Borítókép</label>
                            <input className="buffet-modal-input" type="file" accept="image/*" onChange={handleFileChange} required />
                            {previewUrl && (
                                <div style={{ marginTop: '10px', textAlign: 'center' }}>
                                    <img src={previewUrl} alt="Előnézet" style={{ maxHeight: '120px', maxWidth: '100%', borderRadius: '8px', border: '1px solid #E0AA3E', objectFit: 'cover' }} />
                                    <div style={{ fontSize: '0.72rem', color: '#888', marginTop: '4px' }}>Feltöltés mentéskor</div>
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

                        {error && <div className="buffet-modal-error" style={{ gridColumn: 'span 2' }}>{error}</div>}
                    </div>

                    <div className="buffet-modal-footer">
                        <button type="button" className="details-button" onClick={onClose} disabled={loading}>Mégse</button>
                        <button type="submit" className="details-button" style={{ backgroundColor: loading ? '#555' : '#115420', color: 'white' }} disabled={loading}>
                            {loading ? 'Feltöltés...' : 'Film létrehozása'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewMovieModal;
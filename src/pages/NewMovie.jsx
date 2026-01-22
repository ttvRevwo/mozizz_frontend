import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/newmoviestyle.css';

const NewMovie = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    const [formData, setFormData] = useState({
        Title: '',
        Description: '',
        Genre: '',
        ReleaseDate: '',
        Director: '',
        Rating: '',
        Duration: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        
        data.append('Title', formData.Title);
        data.append('Description', formData.Description);
        data.append('Genre', formData.Genre);
        data.append('Director', formData.Director);
        data.append('Rating', formData.Rating);
        data.append('Duration', formData.Duration);

        if (formData.ReleaseDate) {
            data.append('ReleaseDate', `${formData.ReleaseDate}T00:00:00`);
        }

        if (selectedFile) {
            data.append('imageFile', selectedFile);
        }

        fetch('http://localhost:5083/api/Movie/NewMovie', { 
            method: 'POST',
            body: data
        })
        .then(response => {
            if (response.ok) {
                alert('Film sikeresen létrehozva!');
                navigate('/admin');
            } else {
                return response.text().then(text => { throw new Error(text) });
            }
        })
        .catch(error => {
            console.error('Hiba:', error);
            alert('Hiba történt a mentés során: ' + error.message);
        })
        .finally(() => setLoading(false));
    };

    return (
        <div className="new-movie-page">
            <div className="new-movie-container">
                
                <h2 className="new-movie-title">Új film felvétele</h2>

                <form onSubmit={handleSubmit} className="new-movie-form">
                    
                    <div className="form-group" style={{textAlign: 'center', marginBottom: '20px'}}>
                        <label style={{display:'block', marginBottom:'10px'}}>Borítókép</label>
                        
                        {previewUrl && (
                            <div style={{marginBottom: '15px'}}>
                                <img 
                                    src={previewUrl} 
                                    alt="Előnézet" 
                                    style={{maxWidth: '150px', maxHeight: '200px', borderRadius: '8px', border: '1px solid #E0AA3E'}} 
                                />
                            </div>
                        )}
                        
                        <input 
                            type="file" 
                            accept="image/*"
                            onChange={handleFileChange}
                            required
                            style={{color: '#fff'}}
                        />
                    </div>

                    <div className="form-group">
                        <label>Cím</label>
                        <input 
                            type="text" 
                            name="Title" 
                            value={formData.Title} 
                            onChange={handleChange} 
                            required 
                            placeholder="Pl. A Keresztapa"
                        />
                    </div>

                    <div className="form-group">
                        <label>Műfaj</label>
                        <input 
                            type="text" 
                            name="Genre" 
                            value={formData.Genre} 
                            onChange={handleChange} 
                            required 
                            placeholder="Pl. Dráma, Akció"
                        />
                    </div>

                    <div className="form-group">
                        <label>Hossz (perc)</label>
                        <input 
                            type="number" 
                            name="Duration" 
                            value={formData.Duration} 
                            onChange={handleChange} 
                            required 
                            placeholder="Pl. 120"
                            min="1"
                        />
                    </div>

                    <div className="form-group">
                        <label>Korhatár besorolás (Rating)</label>
                        <input 
                            type="text" 
                            name="Rating" 
                            value={formData.Rating} 
                            onChange={handleChange} 
                            required 
                            placeholder="Pl. R, PG-13, 16+"
                        />
                    </div>

                    <div className="form-group full-width-mobile">
                        <label>Megjelenés dátuma</label>
                        <input 
                            type="date" 
                            name="ReleaseDate" 
                            value={formData.ReleaseDate} 
                            onChange={handleChange} 
                            required 
                        />
                    </div>

                    <div className="form-group full-width">
                        <label>Leírás</label>
                        <textarea 
                            name="Description" 
                            value={formData.Description} 
                            onChange={handleChange} 
                            rows="5"
                            required
                            placeholder="A film rövid leírása..."
                        />
                    </div>

                    <div className="button-group">
                        <Link to="/admin" className="cancel-btn">
                            Mégse
                        </Link>
                        
                        <button type="submit" className="save-btn" disabled={loading}>
                            {loading ? 'Feltöltés...' : 'Mentés'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewMovie;
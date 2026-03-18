import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/ProductDetailsStyle.css';
import { getCloudinaryImageUrl } from '../utils/cloudinary';

const API_BASE_URL = 'http://localhost:5083';

const CATEGORY_LABELS = {
    'menü':    'Kombók & Menük',
    'popcorn': 'Popcorn',
    'snack':   'Snackek',
    'édesség': 'Édesség',
    'ital':    'Üdítők & Italok',
};

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState(null);

    useEffect(() => {
        fetch(`${API_BASE_URL}/api/Buffet/Items`)
            .then(res => {
                if (!res.ok) throw new Error('Nem sikerült betölteni a termékeket.');
                return res.json();
            })
            .then(data => {
                const found = data.find(p => String(p.itemId) === String(id));
                if (!found) throw new Error('A termék nem található.');
                setProduct(found);
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <div className="pd-loading">Termék betöltése...</div>;
    if (error)   return (
        <div className="pd-loading">
            <p style={{ color: '#e05c5c' }}>{error}</p>
            <button className="pd-back-btn" onClick={() => navigate('/buffet')}>← Vissza</button>
        </div>
    );

    const imgUrl = product.img ? getCloudinaryImageUrl(product.img) : null;

    return (
        <div className="pd-page">
            <button className="pd-back-btn" onClick={() => navigate('/buffet')}>
                ← Vissza a büféhez
            </button>

            <div className="pd-card">
                <div className="pd-image">
                    {imgUrl
                        ? <img src={imgUrl} alt={product.name} />
                        : <span className="pd-no-img">🍿</span>
                    }
                </div>

                <div className="pd-info">
                    <p className="pd-category">{CATEGORY_LABELS[product.category] || product.category}</p>
                    <h1 className="pd-title">{product.name}</h1>
                    <p className="pd-desc">{product.description}</p>
                    <div className="pd-price">{product.price.toLocaleString('hu-HU')} Ft</div>

                    <div className="pd-alert">
                        ⚠️ <strong>Figyelem:</strong> Ez a termék csak személyesen vásárolható meg a mozi büféjében. Az oldal tájékoztató jellegű.
                    </div>

                    <p className="pd-allergen">Allergénekről érdeklődj a pultnál.</p>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
import React, { useRef, useRef as useRefs, useState, useEffect, useRef as r } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/BuffetStyle.css';
import { getManualLogoUrl } from '../utils/cloudinary';

const LOGO_URL = getManualLogoUrl();
const API_BASE_URL = 'http://localhost:5083';

const CATEGORY_LABELS = {
    'menü': 'Kombók & Menük',
    'popcorn': 'Popcorn',
    'snack': 'Snackek',
    'édesség': 'Édesség',
    'ital': 'Üdítők & Italok',
};

const CATEGORY_ORDER = ['menü', 'popcorn', 'snack', 'édesség', 'ital'];

const Buffet = () => {
    const navigate = useNavigate();
    const scrollRefs = useRef({});

    const [groupedItems, setGroupedItems] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/Buffet/Items`);
                if (!response.ok) throw new Error('Nem sikerült betölteni a termékeket.');
                const data = await response.json();

                const grouped = {};
                data.forEach(item => {
                    if (!grouped[item.category]) grouped[item.category] = [];
                    grouped[item.category].push(item);
                });
                setGroupedItems(grouped);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchItems();
    }, []);

    const scroll = (category, direction) => {
        const ref = scrollRefs.current[category];
        if (ref) {
            ref.scrollBy({ left: direction === 'left' ? -300 : 300, behavior: 'smooth' });
        }
    };

    const handleCardClick = (id) => {
        navigate(`/buffet/product/${id}`);
    };

    if (loading) return (
        <div className="buffet-container">
            <p className="buffet-status">Betöltés...</p>
        </div>
    );

    if (error) return (
        <div className="buffet-container">
            <p className="buffet-status error">{error}</p>
        </div>
    );

    return (
        <div className="buffet-container">
            <header className="buffet-header">
                <div className="header-left-group">
                    <button className="back-arrow-btn" onClick={() => navigate('/')} title="Vissza a főoldalra">
                        &#10094;
                    </button>
                    <img src={LOGO_URL} alt="Mozi Logo" className="buffet-logo" />
                </div>
                <div className="header-center">
                    <h1>AJÁNLATAINK</h1>
                </div>
                <div className="header-right">
                    <div className="payment-info">
                        <span>Szép kártyát elfogadunk!</span>
                        <div className="payment-icons">💳 📱</div>
                    </div>
                </div>
            </header>

            {CATEGORY_ORDER.filter(cat => groupedItems[cat]?.length > 0).map(category => (
                <section className="buffet-section" key={category}>
                    <h2 className="section-title">
                        {CATEGORY_LABELS[category] || category}
                    </h2>
                    <div className="carousel-wrapper">
                        <button className="nav-arrow left" onClick={() => scroll(category, 'left')}>&#10094;</button>
                        <div
                            className="product-scroll-container"
                            ref={el => scrollRefs.current[category] = el}
                        >
                            {groupedItems[category].map(item => (
                                <div key={item.itemId} className="product-card" onClick={() => handleCardClick(item.itemId)}>
                                    <div className="card-image-placeholder">
                                        {item.img
                                            ? <img src={item.img} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            : <span>{item.name}</span>
                                        }
                                    </div>
                                    <div className="card-info">
                                        <h3>{item.name}</h3>
                                        <p className="price">{item.price} Ft</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="nav-arrow right" onClick={() => scroll(category, 'right')}>&#10095;</button>
                    </div>
                </section>
            ))}
        </div>
    );
};

export default Buffet;
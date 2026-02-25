import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/BuffetStyle.css';
import logoImg from '../imgs/logo.webp';

const Buffet = () => {
    const navigate = useNavigate();
    
    const menusRef = useRef(null);
    const snacksRef = useRef(null);

    const menus = [
        { id: 1, name: "Családi Mix", price: 4500, image: "family_mix.png", desc: "2 nagy popcorn + 2 nagy üdítő + Nachos" },
        { id: 2, name: "Páros Ajánlat", price: 3200, image: "couple_mix.png", desc: "1 nagy popcorn + 2 közepes üdítő" },
        { id: 3, name: "Gyerek Menü", price: 2100, image: "kids_mix.png", desc: "Kis popcorn + Üdítő + Ajándék figura" },
        { id: 4, name: "Heti Ajánlat", price: 2800, image: "weekly_offer.png", desc: "Különleges fűszerezésű popcorn menü" },
        { id: 5, name: "Mozimaraton", price: 5500, image: "marathon.png", desc: "Korlátlan üdítő + XXL Popcorn" },
    ];

    const snacks = [
        { id: 101, name: "Vajas Popcorn", price: 1200, image: "popcorn.png", desc: "Friss, ropogós vajas popcorn." },
        { id: 102, name: "Sajtos Nachos", price: 1400, image: "nachos.png", desc: "Nachos tál meleg sajtszósszal." },
        { id: 103, name: "Coca Cola 0.5L", price: 650, image: "cola.png", desc: "Jéghideg frissítő." },
        { id: 104, name: "KitKat", price: 450, image: "kitkat.png", desc: "Roppanós ostya csokoládéval." },
        { id: 105, name: "Gumicukor", price: 890, image: "gummy.png", desc: "Savanyú és édes gumicukor mix." },
        { id: 106, name: "Ásványvíz", price: 450, image: "water.png", desc: "Szénsavmentes ásványvíz." },
        { id: 107, name: "Mogyoró", price: 550, image: "peanut.png", desc: "Sós pörkölt mogyoró." },
    ];

    const scroll = (ref, direction) => {
        if (ref.current) {
            const { current } = ref;
            const scrollAmount = 300; 
            current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    const handleCardClick = (id) => {
        navigate(`/buffet/product/${id}`);
    };

    return (
        <div className="buffet-container">
            <header className="buffet-header">
                <div className="header-left-group">
                    <button className="back-arrow-btn" onClick={() => navigate('/')} title="Vissza a főoldalra">
                        &#10094;
                    </button>
                    <img src={logoImg} alt="Mozi Logo" className="buffet-logo" />                    {/* Ha van képed: <img src="/images/logo.png" className="buffet-logo" alt="Logo" /> */}
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

            <section className="buffet-section">
                <h2 className="section-title">Kombók & Menük</h2>
                <div className="carousel-wrapper">
                    <button className="nav-arrow left" onClick={() => scroll(menusRef, 'left')}>&#10094;</button>
                    
                    <div className="product-scroll-container" ref={menusRef}>
                        {menus.map(item => (
                            <div key={item.id} className="product-card" onClick={() => handleCardClick(item.id)}>
                                <div className="card-image-placeholder">
                                    <span>{item.name} Kép</span>
                                </div>
                                <div className="card-info">
                                    <h3>{item.name}</h3>
                                    <p className="price">{item.price} Ft</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="nav-arrow right" onClick={() => scroll(menusRef, 'right')}>&#10095;</button>
                </div>
            </section>

            <section className="buffet-section">
                <h2 className="section-title">Snackek & Üdítők</h2>
                <div className="carousel-wrapper">
                    <button className="nav-arrow left" onClick={() => scroll(snacksRef, 'left')}>&#10094;</button>
                    
                    <div className="product-scroll-container" ref={snacksRef}>
                        {snacks.map(item => (
                            <div key={item.id} className="product-card" onClick={() => handleCardClick(item.id)}>
                                <div className="card-image-placeholder small">
                                    <span>{item.name}</span>
                                </div>
                                <div className="card-info">
                                    <h3>{item.name}</h3>
                                    <p className="price">{item.price} Ft</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="nav-arrow right" onClick={() => scroll(snacksRef, 'right')}>&#10095;</button>
                </div>
            </section>
        </div>
    );
};

export default Buffet;
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/ProductDetailsStyle.css';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);

    // Ideiglenes adat
    useEffect(() => {
        const allProducts = [
            { id: 1, name: "Családi Mix", price: 4500, image: "family_mix.png", desc: "A tökéletes választás az egész családnak! Tartalma: 2 db Nagy Popcorn, 2 db 0.5L Üdítő és egy tál Nachos választható szósszal." },
            { id: 2, name: "Páros Ajánlat", price: 3200, image: "couple_mix.png", desc: "Romantikus filmezéshez. 1 db Nagy Popcorn közösen és 2 db választott üdítő." },
            { id: 3, name: "Gyerek Menü", price: 2100, image: "kids_mix.png", desc: "Kifejezetten a kicsiknek: Kis adag popcorn, rostos üdítő és egy meglepetés mozi-figura!" },
            { id: 4, name: "Heti Ajánlat", price: 2800, image: "weekly_offer.png", desc: "Limitált kiadású karamellás popcorn menü." },
            { id: 5, name: "Mozimaraton", price: 5500, image: "marathon.png", desc: "Hosszú filmekhez: Korlátlan újratöltés az üdítőre és egy óriás vödör popcorn." },
            { id: 101, name: "Vajas Popcorn", price: 1200, image: "popcorn.png", desc: "Klasszikus moziélmény. Frissen pattogatott kukorica, bőségesen meglocsolva vajjal." },
            { id: 102, name: "Sajtos Nachos", price: 1400, image: "nachos.png", desc: "Ropogós kukoricachips, mellé meleg cheddar sajtszósz vagy csípős salsa." },
            { id: 103, name: "Coca Cola 0.5L", price: 650, image: "cola.png", desc: "Eredeti íz." },
            { id: 104, name: "KitKat", price: 450, image: "kitkat.png", desc: "4 rudas ropogós ostya csokoládébevonattal." },
            { id: 105, name: "Gumicukor", price: 890, image: "gummy.png", desc: "Vegyes gumicukor válogatás." },
            { id: 106, name: "Ásványvíz", price: 450, image: "water.png", desc: "Szentkirályi szénsavmentes ásványvíz." },
        ];

        const found = allProducts.find(p => p.id == id);
        setProduct(found);
    }, [id]);

    if (!product) return <div className="detail-loading">Termék betöltése...</div>;

    return (
        <div className="product-detail-container">
            <button className="back-btn" onClick={() => navigate('/buffet')}>
                ← Vissza a büféhez
            </button>

            <div className="detail-content">
                <div className="detail-image-box">
                    <span>{product.name} Kép</span>
                </div>

                <div className="detail-info-box">
                    <h1>{product.name}</h1>
                    <p className="detail-desc">{product.desc}</p>
                    
                    <div className="price-tag">
                        Ár: {product.price} Ft
                    </div>

                    <div className="info-alert">
                        ⚠️ <strong>Figyelem:</strong> Ez a termék csak személyesen vásárolható meg a mozi büféjében. Az oldal tájékoztató jellegű.
                    </div>

                    <div className="allergen-info">
                        <small>Allergénekről érdeklődj a pultnál.</small>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
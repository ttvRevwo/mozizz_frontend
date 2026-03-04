import React, { useState } from 'react';
import '../styles/PaymentModal.css';

const SEAT_PRICE = 2500;
const VIP_SEAT_PRICE = 40000;

const PaymentModal = ({ selectedSeats, seats, onClose, onConfirm }) => {
    const [method, setMethod] = useState('card');
    const [processing, setProcessing] = useState(false);
    const [done, setDone] = useState(false);

    const [cardNumber, setCardNumber] = useState('');
    const [cardName, setCardName] = useState('');
    const [cardExpiry, setCardExpiry] = useState('');
    const [cardCvc, setCardCvc] = useState('');

    const [szepCardNumber, setSzepCardNumber] = useState('');
    const [szepPin, setSzepPin] = useState('');

    const getSeatObjects = () =>
        selectedSeats.map(id => seats.find(s => s.seatId === id)).filter(Boolean);

    const calcTotal = () =>
        getSeatObjects().reduce((sum, s) => sum + (s.isVip ? VIP_SEAT_PRICE : SEAT_PRICE), 0);

    const formatCardNumber = (val) => {
        const digits = val.replace(/\D/g, '').slice(0, 16);
        return digits.replace(/(.{4})/g, '$1 ').trim();
    };

    const formatExpiry = (val) => {
        const digits = val.replace(/\D/g, '').slice(0, 4);
        if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2);
        return digits;
    };

    const isFormValid = () => {
        if (method === 'card') {
            return cardNumber.replace(/\s/g, '').length === 16 &&
                cardName.trim().length > 2 &&
                cardExpiry.length === 5 &&
                cardCvc.length === 3;
        }
        if (method === 'szep') {
            return szepCardNumber.replace(/\s/g, '').length === 16 && szepPin.length === 4;
        }
        if (method === 'paypal') return true;
        return false;
    };

    const handlePay = () => {
        if (!isFormValid()) return;
        setProcessing(true);
        setTimeout(() => {
            setProcessing(false);
            setDone(true);
            setTimeout(() => onConfirm(), 1800);
        }, 2200);
    };

    const total = calcTotal();
    const seatObjs = getSeatObjects();

    if (done) {
        return (
            <div className="pm-overlay">
                <div className="pm-modal pm-success-modal">
                    <div className="pm-success-icon">✓</div>
                    <h2>Fizetés sikeres!</h2>
                    <p>Jegyeid hamarosan megjelennek a profilodban.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="pm-overlay" onClick={(e) => e.target.classList.contains('pm-overlay') && onClose()}>
            <div className="pm-modal">
                <button className="pm-close" onClick={onClose}>✕</button>

                <div className="pm-header">
                    <h2>Fizetés</h2>
                    <p className="pm-subtitle">Foglalás összesítő</p>
                </div>

                <div className="pm-summary">
                    <div className="pm-seats">
                        {seatObjs.map(s => (
                            <div key={s.seatId} className={`pm-seat-row ${s.isVip ? 'vip' : ''}`}>
                                <span className="pm-seat-label">
                                    {s.isVip && <span className="pm-vip-badge">VIP</span>}
                                    {s.seatNumber}. szék
                                </span>
                                <span className="pm-seat-price">
                                    {(s.isVip ? VIP_SEAT_PRICE : SEAT_PRICE).toLocaleString('hu-HU')} Ft
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="pm-total">
                        <span>Összesen</span>
                        <span className="pm-total-amount">{total.toLocaleString('hu-HU')} Ft</span>
                    </div>
                </div>

                <div className="pm-methods">
                    <button
                        className={`pm-method-btn ${method === 'card' ? 'active' : ''}`}
                        onClick={() => setMethod('card')}
                    >
                        <span className="pm-method-icon">💳</span>
                        Bankkártya
                    </button>
                    <button
                        className={`pm-method-btn ${method === 'paypal' ? 'active' : ''}`}
                        onClick={() => setMethod('paypal')}
                    >
                        <span className="pm-method-icon">🅿</span>
                        PayPal
                    </button>
                    <button
                        className={`pm-method-btn ${method === 'szep' ? 'active' : ''}`}
                        onClick={() => setMethod('szep')}
                    >
                        <span className="pm-method-icon">🏦</span>
                        OTP Szép
                    </button>
                </div>

                {method === 'card' && (
                    <div className="pm-form">
                        <div className="pm-card-preview">
                            <div className="pm-card-chip">▬▬</div>
                            <div className="pm-card-number-display">
                                {cardNumber || '•••• •••• •••• ••••'}
                            </div>
                            <div className="pm-card-bottom">
                                <span>{cardName || 'KÁRTYABIRTOKOS'}</span>
                                <span>{cardExpiry || 'HH/ÉÉ'}</span>
                            </div>
                        </div>

                        <div className="pm-field">
                            <label>Kártyaszám</label>
                            <input
                                type="text"
                                placeholder="1234 5678 9012 3456"
                                value={cardNumber}
                                onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                                maxLength={19}
                            />
                        </div>
                        <div className="pm-field">
                            <label>Kártyabirtokos neve</label>
                            <input
                                type="text"
                                placeholder="Kovács János"
                                value={cardName}
                                onChange={e => setCardName(e.target.value.toUpperCase())}
                            />
                        </div>
                        <div className="pm-field-row">
                            <div className="pm-field">
                                <label>Lejárat</label>
                                <input
                                    type="text"
                                    placeholder="HH/ÉÉ"
                                    value={cardExpiry}
                                    onChange={e => setCardExpiry(formatExpiry(e.target.value))}
                                    maxLength={5}
                                />
                            </div>
                            <div className="pm-field">
                                <label>CVC</label>
                                <input
                                    type="password"
                                    placeholder="•••"
                                    value={cardCvc}
                                    onChange={e => setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 3))}
                                    maxLength={3}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {method === 'paypal' && (
                    <div className="pm-paypal">
                        <div className="pm-paypal-logo">
                            <span className="pp-p1">Pay</span><span className="pp-p2">Pal</span>
                        </div>
                        <p>A „Fizetés PayPallal" gombra kattintva a PayPal biztonságos oldalára kerülsz.</p>
                        <div className="pm-paypal-info">
                            <span>🔒 Biztonságos, titkosított kapcsolat</span>
                        </div>
                    </div>
                )}

                {method === 'szep' && (
                    <div className="pm-form">
                        <div className="pm-szep-header">
                            <div className="pm-szep-logo">OTP <span>SZÉP</span> Kártya</div>
                            <p className="pm-szep-sub">Szabadidő zseb</p>
                        </div>
                        <div className="pm-field">
                            <label>Szép Kártya száma</label>
                            <input
                                type="text"
                                placeholder="1234 5678 9012 3456"
                                value={szepCardNumber}
                                onChange={e => setSzepCardNumber(formatCardNumber(e.target.value))}
                                maxLength={19}
                            />
                        </div>
                        <div className="pm-field">
                            <label>PIN kód</label>
                            <input
                                type="password"
                                placeholder="••••"
                                value={szepPin}
                                onChange={e => setSzepPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                maxLength={4}
                            />
                        </div>
                    </div>
                )}

                <button
                    className={`pm-pay-btn ${processing ? 'processing' : ''}`}
                    onClick={handlePay}
                    disabled={!isFormValid() || processing}
                >
                    {processing ? (
                        <span className="pm-spinner"></span>
                    ) : method === 'paypal' ? (
                        `Fizetés PayPallal – ${total.toLocaleString('hu-HU')} Ft`
                    ) : (
                        `Fizetés – ${total.toLocaleString('hu-HU')} Ft`
                    )}
                </button>

                <p className="pm-secure-note">🔒 Biztonságos, titkosított fizetés</p>
            </div>
        </div>
    );
};

export default PaymentModal;

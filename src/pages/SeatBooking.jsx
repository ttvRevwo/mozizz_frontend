import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/SeatBooking.css';

const SeatBooking = () => {
    const { showtimeId } = useParams(); 
    const navigate = useNavigate();

    const [seats, setSeats] = useState([]);
    const [hallName, setHallName] = useState('');
    const [hallCapacity, setHallCapacity] = useState(null);
    const [seatPrefix, setSeatPrefix] = useState('A');
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [bookingMessage, setBookingMessage] = useState(null);

    const currentUserId = 1; 

    const deriveSeatPrefix = (name, capacity) => {
        const normalizedName = (name || '').toLowerCase();

        if (normalizedName.includes('kis') || normalizedName.includes('small')) return 'B';
        if (normalizedName.includes('fő') || normalizedName.includes('fo') || normalizedName.includes('nagy') || normalizedName.includes('main')) return 'A';

        if (capacity && Number(capacity) <= 50) return 'B';
        return 'A';
    };

    const getSeatDisplayLabel = (seat, index) => {
        const rawSeatNumber = String(seat.seatNumber || '').trim();
        const numericPart = rawSeatNumber.replace(/[^0-9]/g, '');
        const safeNumber = numericPart || String(index + 1);
        return `${seatPrefix}${safeNumber}`;
    };

    useEffect(() => {
        const fetchSeats = async () => {
            try {
                const [seatsResponse, showtimeResponse] = await Promise.all([
                    fetch(`http://localhost:5083/api/Booking/GetSeatsForShowtime?showtimeId=${showtimeId}`),
                    fetch(`http://localhost:5083/api/Showtime/GetById/${showtimeId}`)
                ]);

                if (!seatsResponse.ok) throw new Error("Nem sikerült betölteni a székeket.");

                const seatsData = await seatsResponse.json();
                const sortedSeats = Array.isArray(seatsData)
                    ? [...seatsData].sort((seatA, seatB) => {
                        const seatNumberA = String(seatA?.seatNumber || '').trim();
                        const seatNumberB = String(seatB?.seatNumber || '').trim();

                        const lettersA = (seatNumberA.match(/[A-Za-z]+/g) || []).join('').toUpperCase();
                        const lettersB = (seatNumberB.match(/[A-Za-z]+/g) || []).join('').toUpperCase();

                        if (lettersA !== lettersB) {
                            return lettersA.localeCompare(lettersB);
                        }

                        const numberPartA = parseInt((seatNumberA.match(/\d+/) || ['0'])[0], 10);
                        const numberPartB = parseInt((seatNumberB.match(/\d+/) || ['0'])[0], 10);

                        if (numberPartA !== numberPartB) {
                            return numberPartA - numberPartB;
                        }

                        return seatNumberA.localeCompare(seatNumberB, undefined, { sensitivity: 'base' });
                    })
                    : [];
                setSeats(sortedSeats);

                if (showtimeResponse.ok) {
                    const showtimeData = await showtimeResponse.json();
                    const showtime = showtimeData?.data || showtimeData;
                    const resolvedHallName = showtime?.hallName || showtime?.HallName || '';
                    const resolvedHallId = showtime?.hallId || showtime?.HallId;

                    setHallName(resolvedHallName);

                    if (resolvedHallId) {
                        const hallsResponse = await fetch('http://localhost:5083/api/Hall/GetAllHall');
                        if (hallsResponse.ok) {
                            const hallsData = await hallsResponse.json();
                            const halls = Array.isArray(hallsData) ? hallsData : (hallsData?.data || []);
                            const hall = halls.find((h) => String(h.hallId || h.HallId) === String(resolvedHallId));
                            const capacity = hall?.seatingCapacity || hall?.SeatingCapacity || null;
                            setHallCapacity(capacity);
                            setSeatPrefix(deriveSeatPrefix(hall?.name || hall?.Name || resolvedHallName, capacity));
                        } else {
                            setSeatPrefix(deriveSeatPrefix(resolvedHallName, null));
                        }
                    } else {
                        setSeatPrefix(deriveSeatPrefix(resolvedHallName, null));
                    }
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (showtimeId) fetchSeats();
    }, [showtimeId]);

    const toggleSeatSelection = (seat) => {
        if (seat.isReserved) return;

        setSelectedSeats(prevSelected => {
            if (prevSelected.includes(seat.seatId)) {
                return prevSelected.filter(id => id !== seat.seatId);
            }
            if (prevSelected.length >= 10) {
                alert("Egyszerre maximum 10 széket foglalhatsz le!");
                return prevSelected;
            }
            return [...prevSelected, seat.seatId];
        });
    };

    const handleBookingSubmit = async () => {
        if (selectedSeats.length === 0) {
            alert("Kérjük, válassz ki legalább egy széket!");
            return;
        }

        const payload = {
            userId: currentUserId,
            showtimeId: parseInt(showtimeId),
            seatIds: selectedSeats
        };

        try {
            setLoading(true);
            const response = await fetch('http://localhost:5083/api/Booking/CreateBooking', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result || "Hiba történt a foglalás során.");
            }

            setBookingMessage("Sikeres foglalás! Készítjük a jegyeidet...");
            setSelectedSeats([]);
            
            setTimeout(() => {
                navigate('/Profile');
            }, 2000);

        } catch (err) {
            alert(err.message);
            window.location.reload(); 
        } finally {
            setLoading(false);
        }
    };

    if (loading && seats.length === 0) return <div className="booking-loading">Székek betöltése...</div>;
    if (error) return <div className="booking-error">Hiba: {error}</div>;

    return (
        <div className="seat-booking-container">
            <h2>Válaszd ki a helyedet!</h2>
            <p className="hall-info">
                Terem: <span className="highlight-gold">{hallName || 'Ismeretlen'}</span>
                {hallCapacity ? ` | Férőhely: ${hallCapacity}` : ''}
            </p>
            
            {bookingMessage && <div className="success-msg">{bookingMessage}</div>}

            <div className="screen">VÁSZON</div>

            <div className="seat-grid">
                {seats.map((seat, index) => {
                    const isSelected = selectedSeats.includes(seat.seatId);
                    const displayLabel = getSeatDisplayLabel(seat, index);
                    
                    let seatClass = "seat";
                    if (seat.isReserved) seatClass += " reserved";
                    else if (isSelected) seatClass += " selected";
                    else seatClass += " available";

                    if (seat.isVip) seatClass += " vip";

                    return (
                        <div 
                            key={seat.seatId} 
                            className={seatClass}
                            onClick={() => toggleSeatSelection(seat)}
                            title={`Szék: ${displayLabel} ${seat.isVip ? '(VIP)' : ''}`}
                        >
                            {displayLabel}
                        </div>
                    );
                })}
            </div>

            <div className="booking-legend">
                <div className="legend-item"><div className="seat available"></div> Szabad</div>
                <div className="legend-item"><div className="seat selected"></div> Kiválasztott</div>
                <div className="legend-item"><div className="seat reserved"></div> Foglalt</div>
                <div className="legend-item"><div className="seat available vip"></div> VIP</div>
            </div>

            <div className="booking-footer">
                <p>Kiválasztott jegyek száma: <strong className="highlight-gold">{selectedSeats.length} db</strong></p>
                <button 
                    className="submit-btn" 
                    onClick={handleBookingSubmit}
                    disabled={selectedSeats.length === 0 || loading}
                >
                    {loading ? "Feldolgozás..." : "Jegyek Lefoglalása"}
                </button>
            </div>
        </div>
    );
};

export default SeatBooking;
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import styles from "../../styles/bookingStyles";

const API_BASE = "http://192.168.137.1:5083/api";
const SEAT_PRICE = 2500;
const VIP_SEAT_PRICE = 40000;

function PaymentModal({ visible, selectedSeats, seats, onClose, onConfirm }) {
  const [method, setMethod] = useState("card");
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);

  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [szepCard, setSzepCard] = useState("");
  const [szepPin, setSzepPin] = useState("");

  const getSeatObjs = () =>
    selectedSeats
      .map((id) => seats.find((s) => s.seatId === id))
      .filter(Boolean);

  const calcTotal = () =>
    getSeatObjs().reduce(
      (sum, s) => sum + (s.isVip ? VIP_SEAT_PRICE : SEAT_PRICE),
      0,
    );

  const formatCard = (val) =>
    val
      .replace(/\D/g, "")
      .slice(0, 16)
      .replace(/(.{4})/g, "$1 ")
      .trim();

  const formatExpiry = (val) => {
    const d = val.replace(/\D/g, "").slice(0, 4);
    return d.length >= 3 ? d.slice(0, 2) + "/" + d.slice(2) : d;
  };

  const isValid = () => {
    if (method === "card") {
      return (
        cardNumber.replace(/\s/g, "").length === 16 &&
        cardName.trim().length > 2 &&
        cardExpiry.length === 5 &&
        cardCvc.length === 3
      );
    }
    if (method === "szep") {
      return szepCard.replace(/\s/g, "").length === 16 && szepPin.length === 4;
    }
    return method === "paypal";
  };

  const handlePay = () => {
    if (!isValid()) return;
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setDone(true);
      setTimeout(() => onConfirm(), 1800);
    }, 2200);
  };

  const resetAndClose = () => {
    setDone(false);
    setProcessing(false);
    setCardNumber("");
    setCardName("");
    setCardExpiry("");
    setCardCvc("");
    setSzepCard("");
    setSzepPin("");
    onClose();
  };

  const total = calcTotal();
  const seatObjs = getSeatObjs();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={resetAndClose}
    >
      {done ? (
        <View style={styles.successOverlay}>
          <View style={styles.successIcon}>
            <Text style={styles.successIconText}>✓</Text>
          </View>
          <Text style={styles.successTitle}>Fizetés sikeres!</Text>
          <Text style={styles.successText}>
            Jegyeid hamarosan megjelennek a profilodban.
          </Text>
        </View>
      ) : (
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <View style={styles.modalHandle} />
            <TouchableOpacity style={styles.modalClose} onPress={resetAndClose}>
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>

            <ScrollView
              style={styles.modalScroll}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.modalTitle}>Fizetés</Text>
              <Text style={styles.modalSubtitle}>Foglalás összesítő</Text>

              <View style={styles.summary}>
                {seatObjs.map((s, i) => (
                  <View
                    key={s.seatId}
                    style={[
                      styles.summaryRow,
                      i === seatObjs.length - 1 && styles.summaryRowLast,
                    ]}
                  >
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      {s.isVip && (
                        <View style={styles.vipBadge}>
                          <Text style={styles.vipBadgeText}>VIP</Text>
                        </View>
                      )}
                      <Text
                        style={[
                          styles.summaryLabel,
                          s.isVip && styles.summaryLabelVip,
                        ]}
                      >
                        {s.seatNumber}. szék
                      </Text>
                    </View>
                    <Text style={styles.summaryPrice}>
                      {(s.isVip ? VIP_SEAT_PRICE : SEAT_PRICE).toLocaleString(
                        "hu-HU",
                      )}{" "}
                      Ft
                    </Text>
                  </View>
                ))}
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Összesen</Text>
                  <Text style={styles.totalAmount}>
                    {total.toLocaleString("hu-HU")} Ft
                  </Text>
                </View>
              </View>

              <View style={styles.methods}>
                {[
                  { key: "card", icon: "💳", label: "Bankkártya" },
                  { key: "paypal", icon: "🅿", label: "PayPal" },
                  { key: "szep", icon: "🏦", label: "OTP Szép" },
                ].map((m) => (
                  <TouchableOpacity
                    key={m.key}
                    style={[
                      styles.methodBtn,
                      method === m.key && styles.methodBtnActive,
                    ]}
                    onPress={() => setMethod(m.key)}
                  >
                    <Text style={styles.methodIcon}>{m.icon}</Text>
                    <Text
                      style={[
                        styles.methodLabel,
                        method === m.key && styles.methodLabelActive,
                      ]}
                    >
                      {m.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {method === "card" && (
                <>
                  <View style={styles.cardPreview}>
                    <Text style={styles.cardChip}>▬▬</Text>
                    <Text style={styles.cardNumber}>
                      {cardNumber || "•••• •••• •••• ••••"}
                    </Text>
                    <View style={styles.cardBottom}>
                      <Text style={styles.cardBottomText}>
                        {cardName || "KÁRTYABIRTOKOS"}
                      </Text>
                      <Text style={styles.cardBottomText}>
                        {cardExpiry || "HH/ÉÉ"}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.field}>
                    <Text style={styles.fieldLabel}>Kártyaszám</Text>
                    <TextInput
                      style={styles.fieldInput}
                      placeholder="1234 5678 9012 3456"
                      placeholderTextColor="#444"
                      value={cardNumber}
                      onChangeText={(t) => setCardNumber(formatCard(t))}
                      keyboardType="number-pad"
                      maxLength={19}
                    />
                  </View>
                  <View style={styles.field}>
                    <Text style={styles.fieldLabel}>Kártyabirtokos neve</Text>
                    <TextInput
                      style={styles.fieldInput}
                      placeholder="Kovács János"
                      placeholderTextColor="#444"
                      value={cardName}
                      onChangeText={(t) => setCardName(t.toUpperCase())}
                      autoCapitalize="characters"
                    />
                  </View>
                  <View style={styles.fieldRow}>
                    <View style={[styles.field, styles.fieldHalf]}>
                      <Text style={styles.fieldLabel}>Lejárat</Text>
                      <TextInput
                        style={styles.fieldInput}
                        placeholder="HH/ÉÉ"
                        placeholderTextColor="#444"
                        value={cardExpiry}
                        onChangeText={(t) => setCardExpiry(formatExpiry(t))}
                        keyboardType="number-pad"
                        maxLength={5}
                      />
                    </View>
                    <View style={[styles.field, styles.fieldHalf]}>
                      <Text style={styles.fieldLabel}>CVC</Text>
                      <TextInput
                        style={styles.fieldInput}
                        placeholder="•••"
                        placeholderTextColor="#444"
                        value={cardCvc}
                        onChangeText={(t) =>
                          setCardCvc(t.replace(/\D/g, "").slice(0, 3))
                        }
                        keyboardType="number-pad"
                        secureTextEntry
                        maxLength={3}
                      />
                    </View>
                  </View>
                </>
              )}

              {method === "paypal" && (
                <View style={styles.paypalBox}>
                  <View style={styles.paypalLogo}>
                    <Text style={styles.paypalP1}>Pay</Text>
                    <Text style={styles.paypalP2}>Pal</Text>
                  </View>
                  <Text style={styles.paypalText}>
                    A „Fizetés PayPallal" gombra kattintva a PayPal biztonságos
                    oldalára kerülsz.
                  </Text>
                  <Text style={styles.paypalSecure}>
                    🔒 Biztonságos, titkosított kapcsolat
                  </Text>
                </View>
              )}

              {method === "szep" && (
                <>
                  <View style={styles.szepHeader}>
                    <Text style={styles.szepLogo}>
                      OTP <Text style={styles.szepLogoAccent}>SZÉP</Text> Kártya
                    </Text>
                    <Text style={styles.szepSub}>Szabadidő zseb</Text>
                  </View>
                  <View style={styles.field}>
                    <Text style={styles.fieldLabel}>Szép Kártya száma</Text>
                    <TextInput
                      style={styles.fieldInput}
                      placeholder="1234 5678 9012 3456"
                      placeholderTextColor="#444"
                      value={szepCard}
                      onChangeText={(t) => setSzepCard(formatCard(t))}
                      keyboardType="number-pad"
                      maxLength={19}
                    />
                  </View>
                  <View style={styles.field}>
                    <Text style={styles.fieldLabel}>PIN kód</Text>
                    <TextInput
                      style={styles.fieldInput}
                      placeholder="••••"
                      placeholderTextColor="#444"
                      value={szepPin}
                      onChangeText={(t) =>
                        setSzepPin(t.replace(/\D/g, "").slice(0, 4))
                      }
                      keyboardType="number-pad"
                      secureTextEntry
                      maxLength={4}
                    />
                  </View>
                </>
              )}

              <TouchableOpacity
                style={[
                  styles.payBtn,
                  !isValid() && styles.payBtnDisabled,
                  processing && styles.payBtnProcessing,
                ]}
                onPress={handlePay}
                disabled={!isValid() || processing}
              >
                {processing ? (
                  <ActivityIndicator color="#E0AA3E" />
                ) : (
                  <Text
                    style={[
                      styles.payBtnText,
                      !isValid() && styles.payBtnTextDisabled,
                    ]}
                  >
                    {method === "paypal"
                      ? `Fizetés PayPallal – ${total.toLocaleString("hu-HU")} Ft`
                      : `Fizetés – ${total.toLocaleString("hu-HU")} Ft`}
                  </Text>
                )}
              </TouchableOpacity>

              <Text style={styles.secureNote}>
                🔒 Biztonságos, titkosított fizetés
              </Text>
            </ScrollView>
          </View>
        </View>
      )}
    </Modal>
  );
}

export default function BookingScreen() {
  const { id: showtimeId } = useLocalSearchParams();
  const router = useRouter();

  const [seats, setSeats] = useState([]);
  const [hallName, setHallName] = useState("");
  const [hallCapacity, setHallCapacity] = useState(null);
  const [movieTitle, setMovieTitle] = useState("");
  const [showDate, setShowDate] = useState("");
  const [showTime, setShowTime] = useState("");

  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState(null);
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert(
          "Bejelentkezés szükséges",
          "A jegyfoglaláshoz be kell jelentkezned!",
          [
            { text: "Mégsem", style: "cancel", onPress: () => router.back() },
            {
              text: "Bejelentkezés",
              onPress: () =>
                router.replace(`/login?redirect=/booking/${showtimeId}`),
            },
          ],
        );
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (!showtimeId) return;
    const load = async () => {
      try {
        const [seatsRes, showRes] = await Promise.all([
          fetch(`${API_BASE}/Booking/AvailableSeats/${showtimeId}`),
          fetch(`${API_BASE}/Showtime/GetById/${showtimeId}`),
        ]);

        if (!seatsRes.ok) throw new Error("Nem sikerült betölteni a székeket.");
        const seatsData = await seatsRes.json();

        const sorted = [...(seatsData.seats || [])].sort((a, b) => {
          const na = String(a.seatNumber || "");
          const nb = String(b.seatNumber || "");
          const la = (na.match(/[A-Za-z]+/g) || []).join("").toUpperCase();
          const lb = (nb.match(/[A-Za-z]+/g) || []).join("").toUpperCase();
          if (la !== lb) return la.localeCompare(lb);
          return (
            parseInt(na.match(/\d+/)?.[0] || 0) -
            parseInt(nb.match(/\d+/)?.[0] || 0)
          );
        });

        setSeats(sorted);
        setHallName(seatsData.hallName || "");
        setHallCapacity(seatsData.totalCapacity || null);

        if (showRes.ok) {
          const sd = await showRes.json();
          setMovieTitle(sd.movieTitle || sd.MovieTitle || "");
          setShowDate(sd.date || sd.Date || "");
          setShowTime(sd.time ? String(sd.time).slice(0, 5) : "");
        }
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [showtimeId]);

  const toggleSeat = (seat) => {
    if (seat.isReserved) return;
    setSelectedSeats((prev) => {
      if (prev.includes(seat.seatId))
        return prev.filter((id) => id !== seat.seatId);
      if (prev.length >= 10) {
        Alert.alert("Maximum 10 szék", "Egyszerre max 10 széket foglalhatsz.");
        return prev;
      }
      return [...prev, seat.seatId];
    });
  };

  const handleConfirmPayment = async () => {
    setShowPayment(false);
    setConfirming(true);
    try {
      const userId = await AsyncStorage.getItem("userId");
      const token = await AsyncStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      const createRes = await fetch(`${API_BASE}/Booking/CreateBooking`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          userId: parseInt(userId),
          showtimeId: parseInt(showtimeId),
          seatIds: selectedSeats,
        }),
      });

      const createData = await createRes.json();
      if (!createRes.ok)
        throw new Error(createData?.hiba || "Hiba a foglalás során.");

      const confirmRes = await fetch(
        `${API_BASE}/Booking/ConfirmBooking/${createData.reservationId}`,
        {
          method: "POST",
          headers,
        },
      );

      if (!confirmRes.ok) {
        const confirmData = await confirmRes.json();
        throw new Error(confirmData?.hiba || "Hiba a véglegesítés során.");
      }

      Alert.alert(
        "🎟 Sikeres foglalás!",
        "A jegyed elkészült. Elküldtük e-mailben a QR kóddal együtt.",
        [
          {
            text: "Profil megtekintése",
            onPress: () => router.replace("/(tabs)/profile"),
          },
        ],
      );
    } catch (e) {
      Alert.alert("Hiba", e.message, [
        { text: "Újra", onPress: () => setShowPayment(true) },
        { text: "Mégse" },
      ]);
    } finally {
      setConfirming(false);
    }
  };

  const selectedSeatObjs = selectedSeats
    .map((id) => seats.find((s) => s.seatId === id))
    .filter(Boolean);
  const totalPrice = selectedSeatObjs.reduce(
    (s, seat) => s + (seat?.isVip ? VIP_SEAT_PRICE : SEAT_PRICE),
    0,
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#E0AA3E" />
        <Text style={styles.loadingText}>Székek betöltése...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <TouchableOpacity
          style={{ marginBottom: 12 }}
          onPress={() => router.back()}
        >
          <Text style={{ color: "#fff" }}>← Vissza</Text>
        </TouchableOpacity>
        <Text style={styles.errorText}>⚠️ {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {movieTitle || "Jegyfoglalás"}
        </Text>
      </View>

      <View style={styles.hallInfo}>
        <Text style={styles.hallName}>{hallName || "Ismeretlen terem"}</Text>
        <Text style={styles.hallCapacity}>
          {showDate} {showTime}
          {hallCapacity ? `  •  ${hallCapacity} férőhely` : ""}
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.screenWrapper}>
          <View style={styles.screen}>
            <Text style={styles.screenText}>VÁSZON</Text>
          </View>
        </View>

        <View style={styles.seatGrid}>
          {seats.map((seat, index) => {
            const isSelected = selectedSeats.includes(seat.seatId);
            const label = String(seat.seatNumber || index + 1);

            let seatStyle = [styles.seat];
            let textStyle = [styles.seatText];

            if (seat.isReserved) {
              seatStyle.push(styles.seatReserved);
              textStyle.push(styles.seatTextReserved);
            } else if (isSelected) {
              seatStyle.push(styles.seatSelected);
              textStyle.push(styles.seatTextSelected);
            } else {
              seatStyle.push(styles.seatAvailable);
              if (seat.isVip) seatStyle.push(styles.seatVipAvailable);
              textStyle.push(styles.seatTextAvailable);
            }
            if (seat.isVip) seatStyle.push(styles.seatVip);

            return (
              <TouchableOpacity
                key={seat.seatId}
                style={seatStyle}
                onPress={() => toggleSeat(seat)}
                disabled={seat.isReserved}
                activeOpacity={seat.isReserved ? 1 : 0.7}
              >
                <Text style={textStyle}>{label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.legend}>
          {[
            { color: "#2a2a2a", label: "Szabad" },
            { color: "#E0AA3E", label: "Kiválasztott" },
            { color: "#1a1a1a", label: "Foglalt", opacity: 0.4 },
            { color: "rgba(224,170,62,0.1)", border: "#E0AA3E", label: "VIP" },
          ].map(({ color, border, label, opacity }) => (
            <View key={label} style={styles.legendItem}>
              <View
                style={[
                  styles.legendBox,
                  { backgroundColor: color, opacity: opacity || 1 },
                  border && { borderWidth: 1, borderColor: border },
                ]}
              />
              <Text style={styles.legendText}>{label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerInfo}>
          <Text style={styles.footerLabel}>Kiválasztott</Text>
          <Text style={styles.footerCount}>{selectedSeats.length} db jegy</Text>
          {selectedSeats.length > 0 && (
            <Text style={styles.footerPrice}>
              {totalPrice.toLocaleString("hu-HU")} Ft
            </Text>
          )}
        </View>
        <TouchableOpacity
          style={[
            styles.bookBtn,
            (selectedSeats.length === 0 || confirming) &&
              styles.bookBtnDisabled,
          ]}
          onPress={() => setShowPayment(true)}
          disabled={selectedSeats.length === 0 || confirming}
        >
          {confirming ? (
            <ActivityIndicator color="#888" size="small" />
          ) : (
            <Text
              style={[
                styles.bookBtnText,
                selectedSeats.length === 0 && styles.bookBtnTextDisabled,
              ]}
            >
              Tovább →
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <PaymentModal
        visible={showPayment}
        selectedSeats={selectedSeats}
        seats={seats}
        onClose={() => setShowPayment(false)}
        onConfirm={handleConfirmPayment}
      />
    </View>
  );
}

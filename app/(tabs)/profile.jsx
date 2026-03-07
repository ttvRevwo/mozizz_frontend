import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import styles from "../../styles/profileStyles";

const API_BASE = "http://192.168.137.1:5083/api";

function TicketCard({ ticket }) {
  const [showQr, setShowQr] = useState(false);
  const isUsed = ticket.isUsed || ticket.status === "used";

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("hu-HU", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatShowDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("hu-HU", { month: "short", day: "numeric" });
  };

  return (
    <View style={[styles.ticketCard, isUsed && styles.ticketUsed]}>
      {isUsed && (
        <View style={styles.ticketUsedStamp}>
          <Text style={styles.ticketUsedStampText}>FELHASZNÁLVA</Text>
        </View>
      )}

      <View style={styles.ticketHeader}>
        <Text style={styles.ticketCinema}>🎬 MOZIZZ</Text>
        <View style={isUsed ? styles.ticketBadgeUsed : styles.ticketBadgeValid}>
          <Text
            style={[
              styles.ticketBadgeText,
              isUsed ? styles.ticketBadgeTextUsed : styles.ticketBadgeTextValid,
            ]}
          >
            {isUsed ? "Lejárt" : "Érvényes"}
          </Text>
        </View>
      </View>

      <View style={styles.ticketBody}>
        <Text style={styles.ticketTitle}>
          {ticket.movieTitle || "Ismeretlen film"}
        </Text>

        <View style={styles.ticketMetaRow}>
          <View style={styles.ticketMetaItem}>
            <Text style={styles.metaLabel}>Kiállítva</Text>
            <Text style={styles.metaValue}>
              {formatDate(ticket.issuedDate)}
            </Text>
          </View>
          <View style={styles.ticketMetaItem}>
            <Text style={styles.metaLabel}>Vetítés</Text>
            <Text style={styles.metaValue}>
              {formatShowDate(ticket.showDate)}
              {ticket.showTime ? ` ${ticket.showTime.slice(0, 5)}` : ""}
            </Text>
          </View>
        </View>

        {ticket.seats?.length > 0 && (
          <View style={styles.seatsRow}>
            {ticket.seats.map((s) => (
              <View key={s} style={styles.seatBadge}>
                <Text style={styles.seatBadgeText}>{s}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      <TouchableOpacity
        style={styles.qrToggleBtn}
        onPress={() => setShowQr((v) => !v)}
      >
        <Text style={styles.qrToggleText}>
          {showQr ? "▲ QR elrejtése" : "▼ QR kód megjelenítése"}
        </Text>
      </TouchableOpacity>

      {showQr && (
        <View style={styles.qrSection}>
          <Image
            source={{
              uri: `https://quickchart.io/qr?text=${encodeURIComponent(ticket.ticketCode)}&size=150`,
            }}
            style={styles.qrImage}
          />
          <Text style={styles.ticketCode}>{ticket.ticketCode}</Text>
        </View>
      )}
    </View>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userId, setUserId] = useState(null);

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        const id = await AsyncStorage.getItem("userId");
        const name = await AsyncStorage.getItem("userName");
        const email = await AsyncStorage.getItem("userEmail");
        const token = await AsyncStorage.getItem("token");

        setUserName(name || "Felhasználó");
        setUserEmail(email || "");
        setUserId(id);

        if (!id || !token) {
          setLoading(false);
          return;
        }

        try {
          const headers = { Authorization: `Bearer ${token}` };

          const [resRes, ticketRes] = await Promise.all([
            fetch(`${API_BASE}/Booking/GetUserReservations/${id}`, { headers }),
            fetch(`${API_BASE}/Ticket/MyTickets/${id}`, { headers }),
          ]);

          const reservations = resRes.ok ? await resRes.json() : [];
          const ticketData = ticketRes.ok ? await ticketRes.json() : [];

          const sortedRes = [
            ...(Array.isArray(reservations) ? reservations : []),
          ].sort((a, b) => a.reservationId - b.reservationId);
          const sortedTickets = [
            ...(Array.isArray(ticketData) ? ticketData : []),
          ].sort((a, b) => new Date(a.issuedDate) - new Date(b.issuedDate));

          const merged = sortedRes.map((res, i) => ({
            ticketCode:
              sortedTickets[i]?.ticketCode ?? `RES-${res.reservationId}`,
            issuedDate: sortedTickets[i]?.issuedDate ?? null,
            status: sortedTickets[i]?.status ?? res.status,
            isUsed: sortedTickets[i]?.isUsed ?? false,
            movieTitle: res.movieTitle,
            seats: res.seats ?? [],
            showDate: res.date,
            showTime: res.time,
            reservationId: res.reservationId,
          }));

          setTickets(merged);
        } catch (err) {
          setError("Nem sikerült betölteni a jegyeket.");
        } finally {
          setLoading(false);
        }
      };

      load();
    }, []),
  );

  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("userId");
    await AsyncStorage.removeItem("userName");
    await AsyncStorage.removeItem("userEmail");
    await AsyncStorage.removeItem("role");
    router.replace("/");
  };

  const [activeTab, setActiveTab] = useState("valid");

  const validTickets = tickets.filter((t) => !t.isUsed && t.status !== "used");
  const usedTickets = tickets.filter((t) => t.isUsed || t.status === "used");

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>👤</Text>
          </View>
          <Text style={styles.headerName}>{userName}</Text>
          {userEmail ? (
            <Text style={styles.headerEmail}>{userEmail}</Text>
          ) : null}

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{tickets.length}</Text>
              <Text style={styles.statLabel}>Összes jegy</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{validTickets.length}</Text>
              <Text style={styles.statLabel}>Érvényes</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{usedTickets.length}</Text>
              <Text style={styles.statLabel}>Lejárt</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>Kijelentkezés</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lefoglalt jegyeim</Text>

          <View style={styles.tabRow}>
            <TouchableOpacity
              style={[
                styles.tabBtn,
                activeTab === "valid" && styles.tabBtnActive,
              ]}
              onPress={() => setActiveTab("valid")}
            >
              <Text
                style={[
                  styles.tabBtnText,
                  activeTab === "valid" && styles.tabBtnTextActive,
                ]}
              >
                Érvényes ({validTickets.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tabBtn,
                activeTab === "used" && styles.tabBtnActive,
              ]}
              onPress={() => setActiveTab("used")}
            >
              <Text
                style={[
                  styles.tabBtnText,
                  activeTab === "used" && styles.tabBtnTextActive,
                ]}
              >
                Lejárt ({usedTickets.length})
              </Text>
            </TouchableOpacity>
          </View>

          {loading && (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color="#E50914" />
              <Text style={styles.loadingText}>Jegyek betöltése...</Text>
            </View>
          )}

          {error && <Text style={styles.errorText}>{error}</Text>}

          {!loading && !error && tickets.length === 0 && (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyIcon}>🎟️</Text>
              <Text style={styles.emptyText}>Még nincsenek jegyeid.</Text>
              <TouchableOpacity
                style={styles.emptyBtn}
                onPress={() => router.push("/")}
              >
                <Text style={styles.emptyBtnText}>Nézzük a filmeket!</Text>
              </TouchableOpacity>
            </View>
          )}

          {!loading &&
            !error &&
            tickets.length > 0 &&
            (activeTab === "valid" ? validTickets : usedTickets).length ===
              0 && (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyIcon}>
                  {activeTab === "valid" ? "✅" : "🎟️"}
                </Text>
                <Text style={styles.emptyText}>
                  {activeTab === "valid"
                    ? "Nincs érvényes jegyed."
                    : "Nincs lejárt jegyed."}
                </Text>
              </View>
            )}

          {(activeTab === "valid" ? validTickets : usedTickets).map(
            (ticket) => (
              <TicketCard key={ticket.ticketCode} ticket={ticket} />
            ),
          )}
        </View>
      </ScrollView>
    </View>
  );
}

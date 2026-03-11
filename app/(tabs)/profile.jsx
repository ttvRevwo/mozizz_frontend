import AsyncStorage from "@react-native-async-storage/async-storage";
import { Link, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import styles from "../../styles/profileStyles";

const API_BASE = "http://192.168.137.1:5083/api";

const getTicketState = (ticket) => {
  if (ticket.isUsed === true) return "used";
  if (!ticket.showDate) return "valid";
  const dt = new Date(
    `${ticket.showDate.split("T")[0]}T${ticket.showTime?.slice(0, 5) ?? "00:00"}:00`,
  );
  if (!isNaN(dt) && dt < new Date()) return "expired";
  return "valid";
};

const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("hu-HU", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";

const formatShow = (d, t) => {
  if (!d) return "—";
  const date = new Date(d).toLocaleDateString("hu-HU", {
    month: "short",
    day: "numeric",
  });
  return `${date} ${t?.slice(0, 5) ?? ""}`.trim();
};

const TABS = [
  { key: "valid", label: "Érvényes" },
  { key: "expired", label: "Lejárt" },
  { key: "used", label: "Felhasznált" },
];

const STATE_LABELS = {
  valid: "Érvényes",
  expired: "Lejárt",
  used: "Felhasznált",
};

function TicketCard({ ticket, onCancel }) {
  const [showQr, setShowQr] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const state = getTicketState(ticket);
  const isUsed = state === "used";
  const isExpired = state === "expired";

  const canCancel = !isUsed && !isExpired;

  const handleCancel = () => {
    Alert.alert("Lemondás", "Biztosan lemondod ezt a foglalást?", [
      { text: "Mégsem", style: "cancel" },
      {
        text: "Igen",
        style: "destructive",
        onPress: async () => {
          setCancelling(true);
          try {
            const token = await AsyncStorage.getItem("token");
            const res = await fetch(
              `${API_BASE}/Reservation/Cancel/${ticket.reservationId}`,
              {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
              },
            );
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
              Alert.alert(
                "Lemondás sikertelen",
                data?.uzenet ?? data?.hiba ?? "Hiba történt.",
              );
              return;
            }
            onCancel(ticket.reservationId);
            Alert.alert("Siker", "A foglalás sikeresen lemondva!");
          } catch (err) {
            Alert.alert("Hiba", "Nem sikerült csatlakozni a szerverhez.");
          } finally {
            setCancelling(false);
          }
        },
      },
    ]);
  };

  return (
    <View style={[styles.card, isUsed && styles.cardUsed]}>
      <View style={styles.cardHeader}>
        <Text style={styles.cinemaName}>🎬 MOZIZZ</Text>
        <View style={[styles.badge, styles[`badge_${state}`]]}>
          <Text style={styles.badgeText}>{STATE_LABELS[state]}</Text>
        </View>
      </View>

      {isUsed && (
        <View style={styles.stamp}>
          <Text style={styles.stampText}>FELHASZNÁLVA</Text>
        </View>
      )}

      <Text style={styles.movieTitle}>
        {ticket.movieTitle || "Ismeretlen film"}
      </Text>

      <View style={styles.metaRow}>
        <View>
          <Text style={styles.metaLabel}>Kiállítva</Text>
          <Text style={styles.metaValue}>{formatDate(ticket.issuedDate)}</Text>
        </View>
        <View>
          <Text style={styles.metaLabel}>Vetítés</Text>
          <Text style={styles.metaValue}>
            {formatShow(ticket.showDate, ticket.showTime)}
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

      <View style={styles.actions}>
        {canCancel && (
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={handleCancel}
            disabled={cancelling}
          >
            <Text style={styles.cancelBtnText}>
              {cancelling ? "Lemondás..." : "✕ Lemondás"}
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.qrBtn}
          onPress={() => setShowQr((v) => !v)}
        >
          <Text style={styles.qrBtnText}>
            {showQr ? "▲ QR elrejtése" : "▼ QR kód"}
          </Text>
        </TouchableOpacity>
      </View>

      {showQr && (
        <View style={styles.qrSection}>
          <Image
            source={{
              uri: `https://quickchart.io/qr?text=${encodeURIComponent(ticket.ticketCode)}&size=180`,
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
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("valid");
  const [userName, setUserName] = useState("");

  const fetchTickets = useCallback(async () => {
    try {
      setError(null);
      const userId =
        Platform.OS === "web"
          ? sessionStorage.getItem("userId") ||
            (await AsyncStorage.getItem("userId"))
          : await AsyncStorage.getItem("userId");
      const token =
        Platform.OS === "web"
          ? sessionStorage.getItem("token") ||
            (await AsyncStorage.getItem("token"))
          : await AsyncStorage.getItem("token");

      if (!token || !userId) {
        setIsLoggedIn(false);
        setLoading(false);
        return;
      }
      setIsLoggedIn(true);

      const name =
        Platform.OS === "web"
          ? sessionStorage.getItem("userName") ||
            (await AsyncStorage.getItem("userName"))
          : await AsyncStorage.getItem("userName");
      if (name) setUserName(name);

      const headers = { Authorization: `Bearer ${token}` };

      const [resRes, ticketRes] = await Promise.all([
        fetch(`${API_BASE}/Booking/GetUserReservations/${userId}`, { headers }),
        fetch(`${API_BASE}/Ticket/MyTickets/${userId}`, { headers }),
      ]);

      const reservations = resRes.ok ? await resRes.json() : [];
      const ticketsData = ticketRes.ok ? await ticketRes.json() : [];

      const confirmedRes = reservations.filter((r) => r.status === "confirmed");

      const sortedRes = [...confirmedRes].sort(
        (a, b) => a.reservationId - b.reservationId,
      );
      const sortedTickets = [...ticketsData].sort(
        (a, b) => new Date(a.issuedDate) - new Date(b.issuedDate),
      );

      const merged = sortedRes.map((res, i) => ({
        ticketCode: sortedTickets[i]?.ticketCode ?? `RES-${res.reservationId}`,
        issuedDate: sortedTickets[i]?.issuedDate ?? null,
        isUsed: sortedTickets[i]?.isUsed === true,
        status: res.status,
        movieTitle: res.movieTitle,
        seats: res.seats ?? [],
        showDate: res.date,
        showTime: res.time,
        reservationId: res.reservationId,
      }));

      setTickets(merged);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchTickets();
    }, [fetchTickets]),
  );

  const handleCancel = (id) =>
    setTickets((prev) => prev.filter((t) => t.reservationId !== id));

  const handleLogout = () => {
    Alert.alert("Kijelentkezés", "Biztosan ki szeretnél jelentkezni?", [
      { text: "Mégsem", style: "cancel" },
      {
        text: "Igen",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.clear();
          if (Platform.OS === "web") {
            try {
              sessionStorage.clear();
            } catch {}
          }
          setIsLoggedIn(false);
          setTickets([]);
          setUserName("");
        },
      },
    ]);
  };

  const validCount = tickets.filter(
    (t) => getTicketState(t) === "valid",
  ).length;
  const filtered = tickets.filter((t) => getTicketState(t) === activeTab);

  if (isLoggedIn === null) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator
          size="large"
          color="#E50914"
          style={{ marginTop: 60 }}
        />
      </SafeAreaView>
    );
  }

  if (isLoggedIn === false) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 32,
            gap: 20,
          }}
        >
          <Text style={{ fontSize: 60 }}>🎬</Text>
          <Text
            style={{
              color: "#fff",
              fontSize: 22,
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            Jelentkezz be a profilodhoz!
          </Text>
          <Text
            style={{
              color: "#888",
              fontSize: 15,
              textAlign: "center",
              lineHeight: 22,
            }}
          >
            A jegyeid és foglalásaid megtekintéséhez bejelentkezés szükséges.
          </Text>
          <Link href="/login?redirect=/(tabs)/profile" asChild>
            <TouchableOpacity
              style={{
                backgroundColor: "#E50914",
                paddingHorizontal: 36,
                paddingVertical: 14,
                borderRadius: 10,
                marginTop: 8,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>
                Bejelentkezés
              </Text>
            </TouchableOpacity>
          </Link>
          <Link href="/register" asChild>
            <TouchableOpacity>
              <Text style={{ color: "#888", fontSize: 14 }}>
                Még nincs fiókod?{" "}
                <Text style={{ color: "#E50914", fontWeight: "bold" }}>
                  Regisztrálj!
                </Text>
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchTickets();
            }}
            tintColor="#E50914"
          />
        }
      >
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>👤</Text>
          </View>
          <Text style={styles.profileTitle}>{userName || "Profil"}</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{tickets.length}</Text>
              <Text style={styles.statLabel}>Összes jegy</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{validCount}</Text>
              <Text style={styles.statLabel}>Érvényes</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutBtnText}>Kijelentkezés</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lefoglalt jegyeim</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tabsRow}
          >
            {TABS.map((tab) => (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tab, activeTab === tab.key && styles.tabActive]}
                onPress={() => setActiveTab(tab.key)}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === tab.key && styles.tabTextActive,
                  ]}
                >
                  {tab.label}
                </Text>
                <View
                  style={[
                    styles.tabCount,
                    activeTab === tab.key && styles.tabCountActive,
                  ]}
                >
                  <Text style={styles.tabCountText}>
                    {
                      tickets.filter((t) => getTicketState(t) === tab.key)
                        .length
                    }
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {loading && (
            <ActivityIndicator
              size="large"
              color="#E50914"
              style={{ marginTop: 40 }}
            />
          )}
          {error && <Text style={styles.errorText}>⚠️ {error}</Text>}

          {!loading && !error && filtered.length === 0 && (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🎟️</Text>
              <Text style={styles.emptyText}>Nincs ilyen jegyed.</Text>
            </View>
          )}

          {filtered.map((ticket) => (
            <TicketCard
              key={ticket.ticketCode}
              ticket={ticket}
              onCancel={handleCancel}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

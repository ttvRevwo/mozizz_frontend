import { Alert, Platform } from "react-native";

const API_BASE = "http://192.168.137.1:5083/api";

const confirmAction = (message, onConfirm) => {
  if (Platform.OS === "web") {
    if (window.confirm(message)) onConfirm();
  } else {
    Alert.alert("Megerősítés", message, [
      { text: "Mégsem", style: "cancel" },
      { text: "Igen", style: "destructive", onPress: onConfirm },
    ]);
  }
};

function UsersTab({ token }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/User/GetAllUsers`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => setUsers(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return <ActivityIndicator color="#E0AA3E" style={{ marginTop: 40 }} />;

  return (
    <ScrollView style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Felhasználók</Text>
        <Text style={styles.sectionCount}>{users.length} db</Text>
      </View>
      {users.length === 0 && (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>👥</Text>
          <Text style={styles.emptyText}>Nincs felhasználó.</Text>
        </View>
      )}
      {users.map((u) => (
        <View key={u.userId} style={styles.userCard}>
          <Text style={styles.userName}>{u.name}</Text>
          <Text style={styles.userEmail}>{u.email}</Text>
          <Text style={styles.userRole}>{u.phone || "—"}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

function MoviesTab({ token }) {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMovies = useCallback(() => {
    setLoading(true);
    fetch(`${API_BASE}/Movie/GetMovies`)
      .then((r) => r.json())
      .then((d) => setMovies(Array.isArray(d) ? d : d.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchMovies();
  }, []);

  const handleDelete = (id, title) => {
    confirmAction(`Biztosan törlöd ezt a filmet?\n"${title}"`, async () => {
      try {
        const res = await fetch(`${API_BASE}/Movie/DeleteMovie/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          fetchMovies();
          Alert.alert("Siker", "Film törölve!");
        } else {
          Alert.alert("Hiba", "Nem sikerült törölni.");
        }
      } catch {
        Alert.alert("Hiba", "Szerver hiba.");
      }
    });
  };

  if (loading)
    return <ActivityIndicator color="#E0AA3E" style={{ marginTop: 40 }} />;

  return (
    <ScrollView style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Filmek</Text>
        <Text style={styles.sectionCount}>{movies.length} db</Text>
      </View>
      {movies.length === 0 && (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🎬</Text>
          <Text style={styles.emptyText}>Nincs film.</Text>
        </View>
      )}
      {movies.map((m) => (
        <View
          key={m.movieId}
          style={[styles.card, { borderLeftColor: "#ff6a00" }]}
        >
          <View style={styles.cardRow}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {m.title}
            </Text>
            {m.rating ? (
              <View style={styles.cardBadge}>
                <Text style={styles.cardBadgeText}>⭐ {m.rating}</Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.cardSub}>
            {m.genre || "Nincs műfaj"} •{" "}
            {m.duration ? `${m.duration} perc` : "—"}
          </Text>
          <View style={styles.btnRow}>
            <TouchableOpacity
              style={styles.btnDelete}
              onPress={() => handleDelete(m.movieId, m.title)}
            >
              <Text style={styles.btnDeleteText}>🗑 Törlés</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

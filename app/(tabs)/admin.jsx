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

  function ShowtimesTab({ token }) {
    const [showtimes, setShowtimes] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchShowtimes = useCallback(() => {
      setLoading(true);
      fetch(`${API_BASE}/Showtime/GetAllShowtimes`)
        .then((r) => r.json())
        .then((d) => setShowtimes(Array.isArray(d) ? d : d.data || []))
        .catch(() => {})
        .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
      fetchShowtimes();
    }, []);

    const handleDelete = (id, title) => {
      confirmAction(`Biztosan törlöd ezt a vetítést?\n"${title}"`, async () => {
        try {
          const res = await fetch(`${API_BASE}/Showtime/DeleteShowtime/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            fetchShowtimes();
            Alert.alert("Siker", "Vetítés törölve!");
          } else {
            Alert.alert(
              "Hiba",
              "Nem sikerült törölni. (Lehet, hogy van foglalás hozzá.)",
            );
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
          <Text style={styles.sectionTitle}>Vetítések</Text>
          <Text style={styles.sectionCount}>{showtimes.length} db</Text>
        </View>
        {showtimes.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🎥</Text>
            <Text style={styles.emptyText}>Nincs vetítés.</Text>
          </View>
        )}
        {showtimes.map((st) => {
          const id = st.showtimeId || st.ShowtimeId;
          const title = st.movieTitle || st.MovieTitle;
          const date = st.date || st.Date;
          const time = st.time || st.Time;
          const hall = st.hallName || st.HallName;
          return (
            <View
              key={id}
              style={[styles.card, { borderLeftColor: "#00d2ff" }]}
            >
              <Text style={styles.cardTitle} numberOfLines={1}>
                {title}
              </Text>
              <Text style={styles.cardSub}>
                {date} • {String(time).slice(0, 5)} • {hall}
              </Text>
              <View style={styles.btnRow}>
                <TouchableOpacity
                  style={styles.btnDelete}
                  onPress={() => handleDelete(id, title)}
                >
                  <Text style={styles.btnDeleteText}>🗑 Törlés</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>
    );
  }
}

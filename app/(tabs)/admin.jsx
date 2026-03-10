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

  function StatsTab({ token }) {
    const [daily, setDaily] = useState(null);
    const [topMovies, setTopMovies] = useState([]);
    const [occupancy, setOccupancy] = useState({
      aktivVetitesek: [],
      archivVetitesek: [],
    });
    const [loading, setLoading] = useState(true);
    const [occTab, setOccTab] = useState("aktiv");

    useEffect(() => {
      const headers = { Authorization: `Bearer ${token}` };
      Promise.all([
        fetch(`${API_BASE}/Admin/DailyReport`, { headers }).then((r) =>
          r.ok ? r.json() : null,
        ),
        fetch(`${API_BASE}/Admin/TopMovies`, { headers }).then((r) =>
          r.ok ? r.json() : [],
        ),
        fetch(`${API_BASE}/Admin/ShowtimeOccupancy`, { headers }).then((r) =>
          r.ok ? r.json() : null,
        ),
      ])
        .then(([d, t, o]) => {
          if (d) setDaily(d);
          if (t) setTopMovies(t);
          if (o) setOccupancy(o);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }, []);

    if (loading)
      return <ActivityIndicator color="#E0AA3E" style={{ marginTop: 40 }} />;

    const statCards = [
      {
        label: "Mai bevétel",
        value: daily?.maiBevetel ?? daily?.MaiBevetel ?? "0 Ft",
        color: "#E0AA3E",
      },
      {
        label: "Eladott jegyek",
        value: daily?.eladottJegyek ?? daily?.EladottJegyek ?? "0 db",
        color: "#00b4d8",
      },
      {
        label: "Foglalások",
        value: daily?.foglalasokSzama ?? daily?.FoglalasokSzama ?? 0,
        color: "#52b788",
      },
      {
        label: "Dátum",
        value: daily?.datum ?? daily?.Datum ?? "—",
        color: "#888",
      },
    ];

    const rankColors = ["#E0AA3E", "#c0c0c0", "#cd7f32"];
    const activeList = occupancy.aktivVetitesek || [];
    const archiveList = occupancy.archivVetitesek || [];
    const occList = occTab === "aktiv" ? activeList : archiveList;

    return (
      <ScrollView style={styles.section} showsVerticalScrollIndicator={false}>
        <Text style={[styles.sectionTitle, { marginBottom: 12 }]}>
          Mai nap – {daily?.datum ?? daily?.Datum ?? "—"}
        </Text>
        <View style={styles.statGrid}>
          {statCards.map((sc) => (
            <View
              key={sc.label}
              style={[styles.statCard, { borderTopColor: sc.color }]}
            >
              <Text style={styles.statLabel}>{sc.label}</Text>
              <Text style={[styles.statValue, { color: sc.color }]}>
                {sc.value}
              </Text>
            </View>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { marginBottom: 12 }]}>
          🏆 Top 3 film
        </Text>
        {topMovies.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Nincs adat.</Text>
          </View>
        ) : (
          topMovies.map((m, i) => (
            <View key={i} style={styles.topRow}>
              <Text
                style={[styles.topRank, { color: rankColors[i] || "#888" }]}
              >
                #{i + 1}
              </Text>
              <Text style={styles.topTitle} numberOfLines={1}>
                {m.filmCim || m.FilmCim}
              </Text>
              <Text style={styles.topCount}>
                {m.jegyekSzama ?? m.JegyekSzama ?? 0} jegy
              </Text>
            </View>
          ))
        )}
        <View
          style={[styles.sectionHeader, { marginTop: 20, marginBottom: 8 }]}
        >
          <Text style={styles.sectionTitle}>Telítettség</Text>
        </View>
        <View style={styles.occTabs}>
          {[
            { key: "aktiv", label: `Aktív (${activeList.length})` },
            { key: "archiv", label: `Archív (${archiveList.length})` },
          ].map((t) => (
            <TouchableOpacity
              key={t.key}
              style={[styles.occTab, occTab === t.key && styles.occTabActive]}
              onPress={() => setOccTab(t.key)}
            >
              <Text
                style={[
                  styles.occTabText,
                  occTab === t.key && styles.occTabTextActive,
                ]}
              >
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {occList.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Nincs adat.</Text>
          </View>
        ) : (
          occList.map((item, i) => {
            const pct = parseFloat(item.telitettseg) || 0;
            const barColor =
              pct >= 80 ? "#E50914" : pct >= 50 ? "#E0AA3E" : "#00b4d8";
            return (
              <View key={i} style={styles.occRow}>
                <Text style={styles.occFilm}>{item.film}</Text>
                <Text style={styles.occTime}>{item.idopont}</Text>
                <View style={styles.occBarTrack}>
                  <View
                    style={[
                      styles.occBarFill,
                      {
                        width: `${Math.min(pct, 100)}%`,
                        backgroundColor: barColor,
                      },
                    ]}
                  />
                </View>
                <View style={styles.occBottom}>
                  <Text style={[styles.occPct, { color: barColor }]}>
                    {item.telitettseg}
                  </Text>
                  <Text style={styles.occTickets}>
                    {item.eladottJegyek} jegy
                  </Text>
                </View>
              </View>
            );
          })
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    );
  }
}
export default function AdminScreen() {
  const [role, setRole] = useState(null);
  const [token, setToken] = useState(null);
  const [activeTab, setActiveTab] = useState("users");
  const [checking, setChecking] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const check = async () => {
        const r = await AsyncStorage.getItem("role");
        const t = await AsyncStorage.getItem("token");
        setRole(r);
        setToken(t);
        setChecking(false);
      };
      check();
    }, []),
  );

  if (checking) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color="#E0AA3E" style={{ marginTop: 60 }} />
      </SafeAreaView>
    );
  }

  if (role !== "Admin") {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.lockIcon}>🔒</Text>
          <Text style={styles.notAuthTitle}>Nincs hozzáférésed</Text>
          <Text style={styles.notAuthText}>
            Ez az oldal csak adminisztrátorok számára érhető el.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>⚙️ Admin Panel</Text>
        <Text style={styles.headerSub}>Mozizz rendszerkezelés</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabs}
        contentContainerStyle={{ gap: 8, paddingVertical: 10 }}
      >
        {TABS.map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tab, activeTab === t.key && styles.tabActive]}
            onPress={() => setActiveTab(t.key)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === t.key && styles.tabTextActive,
              ]}
            >
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {activeTab === "users" && <UsersTab token={token} />}
      {activeTab === "movies" && <MoviesTab token={token} />}
      {activeTab === "showtimes" && <ShowtimesTab token={token} />}
      {activeTab === "stats" && <StatsTab token={token} />}
    </SafeAreaView>
  );
}

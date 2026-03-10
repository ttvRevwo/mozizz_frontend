import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import styles from "../../styles/adminStyles";

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

function EditModal({ visible, title, fields, onSave, onClose, loading }) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalBox}>
          <Text style={styles.modalTitle}>{title}</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            {fields.map((f) => (
              <View key={f.key} style={{ marginBottom: 12 }}>
                <Text style={styles.modalLabel}>{f.label}</Text>
                <TextInput
                  style={styles.modalInput}
                  value={String(f.value ?? "")}
                  onChangeText={f.onChange}
                  placeholder={f.placeholder || f.label}
                  placeholderTextColor="#444"
                  keyboardType={f.numeric ? "numeric" : "default"}
                  editable={f.editable !== false}
                />
              </View>
            ))}
          </ScrollView>
          <View style={styles.modalBtns}>
            <TouchableOpacity style={styles.modalBtnCancel} onPress={onClose}>
              <Text style={styles.modalBtnCancelText}>Mégsem</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalBtnSave}
              onPress={onSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#111" size="small" />
              ) : (
                <Text style={styles.modalBtnSaveText}>Mentés</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function UsersTab({ token }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchUsers = useCallback(() => {
    setLoading(true);
    fetch(`${API_BASE}/User/GetAllUsers`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => setUsers(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = (id, name) => {
    confirmAction(
      `Biztosan törlöd ezt a felhasználót?\n"${name}"`,
      async () => {
        try {
          const res = await fetch(`${API_BASE}/User/DeleteUser/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            fetchUsers();
            Alert.alert("Siker", "Felhasználó törölve!");
          } else Alert.alert("Hiba", "Nem sikerült törölni.");
        } catch {
          Alert.alert("Hiba", "Szerver hiba.");
        }
      },
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/User/ModifyUser`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          UserId: editUser.UserId,
          Name: editUser.Name,
          Email: editUser.Email,
          PasswordHash: editUser.PasswordHash || "",
        }),
      });
      if (res.ok) {
        fetchUsers();
        setEditUser(null);
        Alert.alert("Siker", "Módosítva!");
      } else {
        const d = await res.json().catch(() => ({}));
        Alert.alert("Hiba", d?.uzenet || "Nem sikerült.");
      }
    } catch {
      Alert.alert("Hiba", "Szerver hiba.");
    } finally {
      setSaving(false);
    }
  };

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
        <View key={u.UserId || u.userId} style={styles.userCard}>
          <Text style={styles.userName}>{u.Name || u.name}</Text>
          <Text style={styles.userEmail}>{u.Email || u.email}</Text>
          <View style={styles.btnRow}>
            <TouchableOpacity
              style={styles.btnEdit}
              onPress={() =>
                setEditUser({
                  UserId: u.UserId || u.userId,
                  Name: u.Name || u.name,
                  Email: u.Email || u.email,
                  PasswordHash: u.PasswordHash || u.passwordHash || "",
                })
              }
            >
              <Text style={styles.btnEditText}>✏️ Szerkesztés</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.btnDelete}
              onPress={() =>
                handleDelete(u.UserId || u.userId, u.Name || u.name)
              }
            >
              <Text style={styles.btnDeleteText}>🗑 Törlés</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      {editUser && (
        <EditModal
          visible={!!editUser}
          title="Felhasználó szerkesztése"
          loading={saving}
          onClose={() => setEditUser(null)}
          onSave={handleSave}
          fields={[
            {
              key: "name",
              label: "Név",
              value: editUser.Name,
              onChange: (v) => setEditUser({ ...editUser, Name: v }),
            },
            {
              key: "email",
              label: "Email",
              value: editUser.Email,
              onChange: (v) => setEditUser({ ...editUser, Email: v }),
            },
          ]}
        />
      )}
    </ScrollView>
  );
}

function MoviesTab({ token }) {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMovie, setEditMovie] = useState(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);

  const emptyMovie = {
    Title: "",
    Genre: "",
    Duration: "",
    Rating: "",
    Description: "",
    ReleaseDate: "",
  };

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
        } else Alert.alert("Hiba", "Nem sikerült törölni.");
      } catch {
        Alert.alert("Hiba", "Szerver hiba.");
      }
    });
  };

  const handleSave = async () => {
    if (!editMovie.Title) {
      Alert.alert("Hiba", "A film neve kötelező!");
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      if (!isNew) fd.append("MovieId", String(editMovie.MovieId));
      fd.append("Title", editMovie.Title || "");
      fd.append("Genre", editMovie.Genre || "");
      fd.append("Duration", String(parseInt(editMovie.Duration) || 0));
      fd.append("Rating", editMovie.Rating || "");
      fd.append("Description", editMovie.Description || "");
      fd.append(
        "ReleaseDate",
        editMovie.ReleaseDate || new Date().toISOString().split("T")[0],
      );
      if (!isNew) fd.append("CreateDate", new Date().toISOString());

      const url = isNew
        ? `${API_BASE}/Movie/NewMovie`
        : `${API_BASE}/Movie/ModifyMovie`;
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (res.ok) {
        fetchMovies();
        setEditMovie(null);
        Alert.alert("Siker", isNew ? "Film hozzáadva!" : "Film módosítva!");
      } else {
        const d = await res.text();
        Alert.alert("Hiba", d || "Nem sikerült.");
      }
    } catch (e) {
      Alert.alert("Hiba", "Szerver hiba: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return <ActivityIndicator color="#E0AA3E" style={{ marginTop: 40 }} />;

  return (
    <ScrollView style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Filmek</Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text style={styles.sectionCount}>{movies.length} db</Text>
          <TouchableOpacity
            style={styles.btnAdd}
            onPress={() => {
              setIsNew(true);
              setEditMovie({ ...emptyMovie });
            }}
          >
            <Text style={styles.btnAddText}>+ Új film</Text>
          </TouchableOpacity>
        </View>
      </View>
      {movies.length === 0 && (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🎬</Text>
          <Text style={styles.emptyText}>Nincs film.</Text>
        </View>
      )}
      {movies.map((m) => (
        <View
          key={m.MovieId || m.movieId}
          style={[styles.card, { borderLeftColor: "#ff6a00" }]}
        >
          <View style={styles.cardRow}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {m.Title || m.title}
            </Text>
            {(m.Rating || m.rating) && (
              <View style={styles.cardBadge}>
                <Text style={styles.cardBadgeText}>
                  ⭐ {m.Rating || m.rating}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.cardSub}>
            {m.Genre || m.genre || "Nincs műfaj"} •{" "}
            {m.Duration || m.duration
              ? `${m.Duration || m.duration} perc`
              : "—"}
          </Text>
          <View style={styles.btnRow}>
            <TouchableOpacity
              style={styles.btnEdit}
              onPress={() => {
                setIsNew(false);
                setEditMovie({
                  MovieId: m.MovieId || m.movieId,
                  Title: m.Title || m.title || "",
                  Genre: m.Genre || m.genre || "",
                  Duration: String(m.Duration || m.duration || ""),
                  Rating: m.Rating || m.rating || "",
                  Description: m.Description || m.description || "",
                  ReleaseDate: m.ReleaseDate
                    ? String(m.ReleaseDate).split("T")[0]
                    : "",
                });
              }}
            >
              <Text style={styles.btnEditText}>✏️ Szerkesztés</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.btnDelete}
              onPress={() =>
                handleDelete(m.MovieId || m.movieId, m.Title || m.title)
              }
            >
              <Text style={styles.btnDeleteText}>🗑 Törlés</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      {editMovie && (
        <EditModal
          visible={!!editMovie}
          title={isNew ? "Új film hozzáadása" : "Film szerkesztése"}
          loading={saving}
          onClose={() => setEditMovie(null)}
          onSave={handleSave}
          fields={[
            {
              key: "title",
              label: "Cím *",
              value: editMovie.Title,
              onChange: (v) => setEditMovie({ ...editMovie, Title: v }),
            },
            {
              key: "genre",
              label: "Műfaj",
              value: editMovie.Genre,
              onChange: (v) => setEditMovie({ ...editMovie, Genre: v }),
            },
            {
              key: "duration",
              label: "Hossz (perc)",
              value: editMovie.Duration,
              onChange: (v) => setEditMovie({ ...editMovie, Duration: v }),
              numeric: true,
            },
            {
              key: "rating",
              label: "Értékelés (pl. 8.5)",
              value: editMovie.Rating,
              onChange: (v) => setEditMovie({ ...editMovie, Rating: v }),
            },
            {
              key: "releaseDate",
              label: "Megjelenés (ÉÉÉÉ-HH-NN)",
              value: editMovie.ReleaseDate,
              onChange: (v) => setEditMovie({ ...editMovie, ReleaseDate: v }),
            },
            {
              key: "desc",
              label: "Leírás",
              value: editMovie.Description,
              onChange: (v) => setEditMovie({ ...editMovie, Description: v }),
            },
          ]}
        />
      )}
    </ScrollView>
  );
}

function ShowtimesTab({ token }) {
  const [showtimes, setShowtimes] = useState([]);
  const [movies, setMovies] = useState([]);
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editSt, setEditSt] = useState(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);

  const emptySt = { MovieId: "", HallId: "", ShowDate: "", ShowTime1: "" };

  const fetchAll = useCallback(() => {
    setLoading(true);
    Promise.all([
      fetch(`${API_BASE}/Showtime/GetAllShowtimes`).then((r) => r.json()),
      fetch(`${API_BASE}/Movie/GetMovies`).then((r) => r.json()),
      fetch(`${API_BASE}/Hall/GetAllHall`).then((r) => r.json()),
    ])
      .then(([st, mv, hl]) => {
        setShowtimes(Array.isArray(st) ? st : st.data || []);
        setMovies(Array.isArray(mv) ? mv : mv.data || []);
        setHalls(Array.isArray(hl) ? hl : hl.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchAll();
  }, []);

  const handleDelete = (id, title) => {
    confirmAction(`Biztosan törlöd ezt a vetítést?\n"${title}"`, async () => {
      try {
        const res = await fetch(`${API_BASE}/Showtime/DeleteShowtime/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          fetchAll();
          Alert.alert("Siker", "Vetítés törölve!");
        } else
          Alert.alert(
            "Hiba",
            "Nem sikerült. (Lehet, hogy van foglalás hozzá.)",
          );
      } catch {
        Alert.alert("Hiba", "Szerver hiba.");
      }
    });
  };

  const handleSave = async () => {
    if (
      !editSt.MovieId ||
      !editSt.HallId ||
      !editSt.ShowDate ||
      !editSt.ShowTime1
    ) {
      Alert.alert("Hiba", "Minden mező kitöltése kötelező!");
      return;
    }
    setSaving(true);
    try {
      const body = {
        ShowtimeId: isNew ? 0 : editSt.ShowtimeId,
        MovieId: parseInt(editSt.MovieId),
        HallId: parseInt(editSt.HallId),
        ShowDate: editSt.ShowDate,
        ShowTime1: editSt.ShowTime1,
        CreatedAt: new Date().toISOString(),
      };
      const url = isNew
        ? `${API_BASE}/Showtime/NewShowtime`
        : `${API_BASE}/Showtime/ModifyShowtime`;
      const method = isNew ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        fetchAll();
        setEditSt(null);
        Alert.alert(
          "Siker",
          isNew ? "Vetítés hozzáadva!" : "Vetítés módosítva!",
        );
      } else {
        const d = await res.json().catch(() => ({}));
        Alert.alert("Hiba", d?.hiba || d?.uzenet || "Nem sikerült.");
      }
    } catch (e) {
      Alert.alert("Hiba", "Szerver hiba.");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return <ActivityIndicator color="#E0AA3E" style={{ marginTop: 40 }} />;

  const movieOptions = movies
    .map((m) => `${m.MovieId || m.movieId} – ${m.Title || m.title}`)
    .join("\n");
  const hallOptions = halls
    .map((h) => `${h.HallId || h.hallId} – ${h.Name || h.name}`)
    .join("\n");

  return (
    <ScrollView style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Vetítések</Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text style={styles.sectionCount}>{showtimes.length} db</Text>
          <TouchableOpacity
            style={styles.btnAdd}
            onPress={() => {
              setIsNew(true);
              setEditSt({ ...emptySt });
            }}
          >
            <Text style={styles.btnAddText}>+ Új vetítés</Text>
          </TouchableOpacity>
        </View>
      </View>

      {(movies.length > 0 || halls.length > 0) && (
        <View style={styles.helperBox}>
          <Text style={styles.helperTitle}>
            Elérhető filmek & termek (ID-khoz):
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <View>
                <Text style={styles.helperSub}>Filmek:</Text>
                {movies.slice(0, 10).map((m) => (
                  <Text key={m.MovieId || m.movieId} style={styles.helperRow}>
                    #{m.MovieId || m.movieId} {m.Title || m.title}
                  </Text>
                ))}
              </View>
              <View>
                <Text style={styles.helperSub}>Termek:</Text>
                {halls.map((h) => (
                  <Text key={h.HallId || h.hallId} style={styles.helperRow}>
                    #{h.HallId || h.hallId} {h.Name || h.name}
                  </Text>
                ))}
              </View>
            </View>
          </ScrollView>
        </View>
      )}

      {showtimes.length === 0 && (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🎥</Text>
          <Text style={styles.emptyText}>Nincs vetítés.</Text>
        </View>
      )}
      {showtimes.map((st) => {
        const id = st.ShowtimeId || st.showtimeId;
        const title = st.MovieTitle || st.movieTitle;
        const date = st.Date || st.date;
        const time = st.Time || st.time;
        const hall = st.HallName || st.hallName;
        return (
          <View key={id} style={[styles.card, { borderLeftColor: "#00d2ff" }]}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {title}
            </Text>
            <Text style={styles.cardSub}>
              {date} • {String(time).slice(0, 5)} • {hall}
            </Text>
            <View style={styles.btnRow}>
              <TouchableOpacity
                style={styles.btnEdit}
                onPress={() => {
                  setIsNew(false);
                  setEditSt({
                    ShowtimeId: id,
                    MovieId: String(st.MovieId || st.movieId || ""),
                    HallId: String(st.HallId || st.hallId || ""),
                    ShowDate: date ? String(date).split("T")[0] : "",
                    ShowTime1: time ? String(time).slice(0, 5) : "",
                  });
                }}
              >
                <Text style={styles.btnEditText}>✏️ Szerkesztés</Text>
              </TouchableOpacity>
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

      {editSt && (
        <EditModal
          visible={!!editSt}
          title={isNew ? "Új vetítés hozzáadása" : "Vetítés szerkesztése"}
          loading={saving}
          onClose={() => setEditSt(null)}
          onSave={handleSave}
          fields={[
            {
              key: "movieId",
              label: "Film ID *",
              value: editSt.MovieId,
              onChange: (v) => setEditSt({ ...editSt, MovieId: v }),
              numeric: true,
            },
            {
              key: "hallId",
              label: "Terem ID *",
              value: editSt.HallId,
              onChange: (v) => setEditSt({ ...editSt, HallId: v }),
              numeric: true,
            },
            {
              key: "date",
              label: "Dátum * (ÉÉÉÉ-HH-NN)",
              value: editSt.ShowDate,
              onChange: (v) => setEditSt({ ...editSt, ShowDate: v }),
            },
            {
              key: "time",
              label: "Időpont * (ÓÓ:PP)",
              value: editSt.ShowTime1,
              onChange: (v) => setEditSt({ ...editSt, ShowTime1: v }),
            },
          ]}
        />
      )}
    </ScrollView>
  );
}

function StatsTab({ token }) {
  const [daily, setDaily] = useState(null);
  const [topMovies, setTopMovies] = useState([]);
  const [occupancy, setOccupancy] = useState({
    AktivVetitesek: [],
    ArchivVetitesek: [],
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
      value: daily?.MaiBevetel ?? "0 Ft",
      color: "#E0AA3E",
    },
    {
      label: "Eladott jegyek",
      value: daily?.EladottJegyek ?? "0 db",
      color: "#00b4d8",
    },
    {
      label: "Foglalások",
      value: daily?.FoglalasokSzama ?? 0,
      color: "#52b788",
    },
    { label: "Dátum", value: daily?.Datum ?? "—", color: "#888" },
  ];
  const rankColors = ["#E0AA3E", "#c0c0c0", "#cd7f32"];
  const activeList = occupancy.AktivVetitesek || occupancy.aktivVetitesek || [];
  const archiveList =
    occupancy.ArchivVetitesek || occupancy.archivVetitesek || [];
  const occList = occTab === "aktiv" ? activeList : archiveList;

  return (
    <ScrollView style={styles.section} showsVerticalScrollIndicator={false}>
      <Text style={[styles.sectionTitle, { marginBottom: 12 }]}>
        Mai nap – {daily?.Datum ?? "—"}
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
            <Text style={[styles.topRank, { color: rankColors[i] || "#888" }]}>
              #{i + 1}
            </Text>
            <Text style={styles.topTitle} numberOfLines={1}>
              {m.FilmCim || m.filmCim}
            </Text>
            <Text style={styles.topCount}>
              {m.JegyekSzama ?? m.jegyekSzama ?? 0} jegy
            </Text>
          </View>
        ))
      )}

      <View style={[styles.sectionHeader, { marginTop: 20, marginBottom: 8 }]}>
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
          const pct = parseFloat(item.Telitettseg || item.telitettseg) || 0;
          const barColor =
            pct >= 80 ? "#E50914" : pct >= 50 ? "#E0AA3E" : "#00b4d8";
          return (
            <View key={i} style={styles.occRow}>
              <Text style={styles.occFilm}>{item.Film || item.film}</Text>
              <Text style={styles.occTime}>{item.Idopont || item.idopont}</Text>
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
                  {item.Telitettseg || item.telitettseg}
                </Text>
                <Text style={styles.occTickets}>
                  {item.EladottJegyek ?? item.eladottJegyek} jegy
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

const TABS = [
  { key: "users", label: "👥 Userek" },
  { key: "movies", label: "🎬 Filmek" },
  { key: "showtimes", label: "🎥 Vetítések" },
  { key: "stats", label: "📊 Statisztika" },
];

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

  if (checking)
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color="#E0AA3E" style={{ marginTop: 60 }} />
      </SafeAreaView>
    );

  if (role !== "Admin")
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

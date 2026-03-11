import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
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

const ask = (msg, fn) =>
  Platform.OS === "web"
    ? window.confirm(msg) && fn()
    : Alert.alert("Megerősítés", msg, [
        { text: "Mégsem", style: "cancel" },
        { text: "Igen", style: "destructive", onPress: fn },
      ]);

const authH = (token) => ({ Authorization: `Bearer ${token}` });
const safe = (v) => (v === null || v === undefined ? "" : String(v));

function EditModal({ visible, title, fields, onSave, onClose, saving }) {
  if (!visible || !fields) return null;
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
                {f.custom ? (
                  f.custom
                ) : (
                  <TextInput
                    style={styles.modalInput}
                    value={safe(f.value)}
                    onChangeText={f.onChange}
                    placeholder={f.label}
                    placeholderTextColor="#444"
                    keyboardType={f.numeric ? "numeric" : "default"}
                  />
                )}
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
              disabled={saving}
            >
              {saving ? (
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
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  const refetch = useCallback(() => {
    setLoading(true);
    fetch(`${API_BASE}/User/GetAllUsers`, { headers: authH(token) })
      .then((r) => (r.ok ? r.json() : []))
      .then((d) =>
        setUsers(
          Array.isArray(d) ? d.filter((u) => u && (u.UserId || u.userId)) : [],
        ),
      )
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const openEdit = (u) => {
    const id = u.UserId ?? u.userId;
    const name = u.Name ?? u.name ?? "";
    const email = u.Email ?? u.email ?? "";
    const phone = u.Phone ?? u.phone ?? "";
    const roleId = String(u.RoleId ?? u.roleId ?? 2);
    setForm({
      UserId: id,
      Name: name,
      Email: email,
      Phone: phone,
      RoleId: roleId,
      PasswordHash: "",
    });
    setEditId(id);
  };
  const closeEdit = () => {
    setEditId(null);
    setForm({});
  };

  const del = (id, name) =>
    ask(`Törlöd: "${name}"?`, async () => {
      const r = await fetch(`${API_BASE}/User/DeleteUser/${id}`, {
        method: "DELETE",
        headers: authH(token),
      });
      r.ok
        ? (refetch(), Alert.alert("Siker", "Törölve!"))
        : Alert.alert("Hiba", "Nem sikerült.");
    });

  const save = async () => {
    setSaving(true);
    let passwordHash = form.PasswordHash;
    if (!passwordHash) {
      try {
        const orig = await fetch(`${API_BASE}/User/UserById/${form.UserId}`, {
          headers: authH(token),
        });
        if (orig.ok) {
          const u = await orig.json();
          passwordHash = u.PasswordHash || u.passwordHash || "";
        }
      } catch {}
    }
    const r = await fetch(`${API_BASE}/User/ModifyUser`, {
      method: "PUT",
      headers: { ...authH(token), "Content-Type": "application/json" },
      body: JSON.stringify({
        UserId: form.UserId,
        Name: form.Name,
        Email: form.Email,
        Phone: form.Phone || null,
        RoleId: parseInt(form.RoleId) || 2,
        PasswordHash: passwordHash,
      }),
    }).catch(() => null);
    setSaving(false);
    if (r?.ok) {
      refetch();
      closeEdit();
      Alert.alert("Siker", "Módosítva!");
    } else {
      const d = await r?.text();
      Alert.alert("Hiba", d || "Nem sikerült.");
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
      {users.map((u) => {
        const uid = u.UserId ?? u.userId;
        const name = u.Name ?? u.name ?? "—";
        const email = u.Email ?? u.email ?? "—";
        return (
          <View key={uid} style={styles.userCard}>
            <Text style={styles.userName}>{name}</Text>
            <Text style={styles.userEmail}>{email}</Text>
            <View style={styles.btnRow}>
              <TouchableOpacity
                style={styles.btnEdit}
                onPress={() => openEdit(u)}
              >
                <Text style={styles.btnEditText}>✏️ Szerkesztés</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.btnDelete}
                onPress={() => del(uid, name)}
              >
                <Text style={styles.btnDeleteText}>🗑 Törlés</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}
      <EditModal
        visible={editId !== null}
        title="Felhasználó szerkesztése"
        saving={saving}
        onClose={closeEdit}
        onSave={save}
        fields={
          editId !== null
            ? [
                {
                  key: "name",
                  label: "Név",
                  value: form.Name,
                  onChange: (v) => setForm((f) => ({ ...f, Name: v })),
                },
                {
                  key: "email",
                  label: "Email",
                  value: form.Email,
                  onChange: (v) => setForm((f) => ({ ...f, Email: v })),
                },
                {
                  key: "phone",
                  label: "Telefon",
                  value: form.Phone,
                  onChange: (v) => setForm((f) => ({ ...f, Phone: v })),
                },
                {
                  key: "role",
                  label: "Szerepkör ID (1=Admin, 2=Customer)",
                  value: form.RoleId,
                  onChange: (v) => setForm((f) => ({ ...f, RoleId: v })),
                  numeric: true,
                },
                {
                  key: "pass",
                  label: "Új jelszó (üresen = nem változik)",
                  value: form.PasswordHash,
                  onChange: (v) => setForm((f) => ({ ...f, PasswordHash: v })),
                },
              ]
            : []
        }
      />
    </ScrollView>
  );
}

function MoviesTab({ token }) {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({});
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pickedImage, setPickedImage] = useState(null);

  const g = (m, k) => m?.[k] ?? m?.[k[0].toLowerCase() + k.slice(1)] ?? "";

  const refetch = useCallback(() => {
    setLoading(true);
    fetch(`${API_BASE}/Movie/GetMovies`)
      .then((r) => r.json())
      .then((d) => setMovies(Array.isArray(d) ? d.filter(Boolean) : []))
      .catch(() => setMovies([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const openEdit = (m = null) => {
    setIsNew(!m);
    setPickedImage(null);
    if (m) {
      setForm({
        MovieId: g(m, "MovieId"),
        Title: g(m, "Title"),
        Genre: g(m, "Genre"),
        Duration: String(g(m, "Duration")),
        Rating: g(m, "Rating"),
        Description: g(m, "Description"),
        ReleaseDate: String(g(m, "ReleaseDate")).split("T")[0],
        Img: g(m, "Img"),
      });
      setEditId(g(m, "MovieId"));
    } else {
      setForm({
        Title: "",
        Genre: "",
        Duration: "",
        Rating: "",
        Description: "",
        ReleaseDate: "",
      });
      setEditId("new");
    }
  };
  const closeEdit = () => {
    setEditId(null);
    setForm({});
  };

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Hiba", "Nincs engedély!");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled) setPickedImage(result.assets[0]);
  };

  const del = (id, title) =>
    ask(`Törlöd: "${title}"?`, async () => {
      const r = await fetch(`${API_BASE}/Movie/DeleteMovie/${id}`, {
        method: "DELETE",
        headers: authH(token),
      });
      r.ok
        ? (refetch(), Alert.alert("Siker", "Törölve!"))
        : Alert.alert("Hiba", "Nem sikerült.");
    });

  const save = async () => {
    if (!form.Title) {
      Alert.alert("Hiba", "A cím kötelező!");
      return;
    }
    setSaving(true);
    const fd = new FormData();
    if (!isNew) fd.append("MovieId", String(form.MovieId));
    fd.append("Title", form.Title);
    fd.append("Genre", form.Genre || "");
    fd.append("Duration", String(parseInt(form.Duration) || 0));
    fd.append("Rating", form.Rating || "");
    fd.append("Description", form.Description || "");
    fd.append(
      "ReleaseDate",
      form.ReleaseDate || new Date().toISOString().split("T")[0],
    );
    if (!isNew) fd.append("CreateDate", new Date().toISOString());
    if (pickedImage) {
      const ext = pickedImage.uri.split(".").pop();
      fd.append("imageFile", {
        uri: pickedImage.uri,
        name: `movie.${ext}`,
        type: `image/${ext}`,
      });
    }
    const r = await fetch(
      `${API_BASE}/Movie/${isNew ? "NewMovie" : "ModifyMovie"}`,
      {
        method: isNew ? "POST" : "PUT",
        headers: authH(token),
        body: fd,
      },
    ).catch(() => null);
    setSaving(false);
    if (r?.ok) {
      refetch();
      closeEdit();
      Alert.alert("Siker", isNew ? "Film hozzáadva!" : "Módosítva!");
    } else {
      const t = await r?.text();
      Alert.alert("Hiba", t || "Nem sikerült.");
    }
  };

  if (loading)
    return <ActivityIndicator color="#E0AA3E" style={{ marginTop: 40 }} />;

  return (
    <ScrollView style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Filmek</Text>
        <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
          <Text style={styles.sectionCount}>{movies.length} db</Text>
          <TouchableOpacity style={styles.btnAdd} onPress={() => openEdit()}>
            <Text style={styles.btnAddText}>+ Új film</Text>
          </TouchableOpacity>
        </View>
      </View>
      {movies.map((m) => (
        <View
          key={g(m, "MovieId")}
          style={[styles.card, { borderLeftColor: "#ff6a00" }]}
        >
          <View style={styles.cardRow}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {g(m, "Title")}
            </Text>
            {g(m, "Rating") ? (
              <View style={styles.cardBadge}>
                <Text style={styles.cardBadgeText}>⭐ {g(m, "Rating")}</Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.cardSub}>
            {g(m, "Genre") || "Nincs műfaj"} •{" "}
            {g(m, "Duration") ? `${g(m, "Duration")} perc` : "—"}
          </Text>
          <View style={styles.btnRow}>
            <TouchableOpacity
              style={styles.btnEdit}
              onPress={() => openEdit(m)}
            >
              <Text style={styles.btnEditText}>✏️ Szerkesztés</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.btnDelete}
              onPress={() => del(g(m, "MovieId"), g(m, "Title"))}
            >
              <Text style={styles.btnDeleteText}>🗑 Törlés</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
      <EditModal
        visible={editId !== null}
        title={isNew ? "Új film" : "Film szerkesztése"}
        saving={saving}
        onClose={closeEdit}
        onSave={save}
        fields={
          editId !== null
            ? [
                {
                  key: "title",
                  label: "Cím *",
                  value: form.Title,
                  onChange: (v) => setForm((f) => ({ ...f, Title: v })),
                },
                {
                  key: "genre",
                  label: "Műfaj",
                  value: form.Genre,
                  onChange: (v) => setForm((f) => ({ ...f, Genre: v })),
                },
                {
                  key: "dur",
                  label: "Hossz (perc)",
                  value: form.Duration,
                  onChange: (v) => setForm((f) => ({ ...f, Duration: v })),
                  numeric: true,
                },
                {
                  key: "rat",
                  label: "Értékelés",
                  value: form.Rating,
                  onChange: (v) => setForm((f) => ({ ...f, Rating: v })),
                },
                {
                  key: "date",
                  label: "Megjelenés (ÉÉÉÉ-HH-NN)",
                  value: form.ReleaseDate,
                  onChange: (v) => setForm((f) => ({ ...f, ReleaseDate: v })),
                },
                {
                  key: "desc",
                  label: "Leírás",
                  value: form.Description,
                  onChange: (v) => setForm((f) => ({ ...f, Description: v })),
                },
                {
                  key: "img",
                  label: "Borítókép",
                  custom: (
                    <View>
                      {pickedImage ? (
                        <Image
                          source={{ uri: pickedImage.uri }}
                          style={{
                            width: "100%",
                            height: 120,
                            borderRadius: 8,
                            marginBottom: 8,
                          }}
                          resizeMode="cover"
                        />
                      ) : form.Img ? (
                        <Text
                          style={{
                            color: "#666",
                            fontSize: 11,
                            marginBottom: 6,
                          }}
                        >
                          Jelenlegi: {form.Img}
                        </Text>
                      ) : null}
                      <TouchableOpacity
                        style={styles.btnEdit}
                        onPress={pickImage}
                      >
                        <Text style={styles.btnEditText}>
                          🖼{" "}
                          {pickedImage ? "Kép cserélése" : "Kép kiválasztása"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ),
                },
              ]
            : []
        }
      />
    </ScrollView>
  );
}

function ShowtimesTab({ token }) {
  const [showtimes, setShowtimes] = useState([]);
  const [movies, setMovies] = useState([]);
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({});
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);

  const g = (x, k) => x?.[k] ?? x?.[k[0].toLowerCase() + k.slice(1)] ?? "";

  const refetch = useCallback(() => {
    setLoading(true);
    Promise.all([
      fetch(`${API_BASE}/Showtime/GetAllShowtimes`).then((r) => r.json()),
      fetch(`${API_BASE}/Movie/GetMovies`).then((r) => r.json()),
      fetch(`${API_BASE}/Hall/GetAllHall`).then((r) => r.json()),
    ])
      .then(([st, mv, hl]) => {
        setShowtimes(Array.isArray(st) ? st.filter(Boolean) : []);
        setMovies(Array.isArray(mv) ? mv.filter(Boolean) : []);
        setHalls(Array.isArray(hl) ? hl.filter(Boolean) : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const openEdit = (st = null) => {
    setIsNew(!st);
    if (st) {
      setForm({
        ShowtimeId: g(st, "ShowtimeId"),
        MovieId: String(g(st, "MovieId")),
        HallId: String(g(st, "HallId")),
        ShowDate: String(g(st, "Date")).split("T")[0],
        ShowTime1: String(g(st, "Time")).slice(0, 5),
      });
      setEditId(g(st, "ShowtimeId"));
    } else {
      setForm({ MovieId: "", HallId: "", ShowDate: "", ShowTime1: "" });
      setEditId("new");
    }
  };
  const closeEdit = () => {
    setEditId(null);
    setForm({});
  };

  const del = (id, title) =>
    ask(`Törlöd: "${title}"?`, async () => {
      const r = await fetch(`${API_BASE}/Showtime/DeleteShowtime/${id}`, {
        method: "DELETE",
        headers: authH(token),
      });
      r.ok
        ? (refetch(), Alert.alert("Siker", "Törölve!"))
        : Alert.alert("Hiba", "Nem sikerült. (Aktív foglalás lehet hozzá.)");
    });

  const save = async () => {
    if (!form.MovieId || !form.HallId || !form.ShowDate || !form.ShowTime1) {
      Alert.alert("Hiba", "Minden mező kötelező!");
      return;
    }
    setSaving(true);
    const r = await fetch(
      `${API_BASE}/Showtime/${isNew ? "NewShowtime" : "ModifyShowtime"}`,
      {
        method: isNew ? "POST" : "PUT",
        headers: { ...authH(token), "Content-Type": "application/json" },
        body: JSON.stringify({
          ShowtimeId: isNew ? 0 : form.ShowtimeId,
          MovieId: parseInt(form.MovieId),
          HallId: parseInt(form.HallId),
          ShowDate: form.ShowDate,
          ShowTime1: form.ShowTime1,
          CreatedAt: new Date().toISOString(),
        }),
      },
    ).catch(() => null);
    setSaving(false);
    if (r?.ok) {
      refetch();
      closeEdit();
      Alert.alert("Siker", isNew ? "Hozzáadva!" : "Módosítva!");
    } else {
      const d = await r?.json().catch(() => ({}));
      Alert.alert("Hiba", d?.hiba || "Nem sikerült.");
    }
  };

  if (loading)
    return <ActivityIndicator color="#E0AA3E" style={{ marginTop: 40 }} />;

  return (
    <ScrollView style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Vetítések</Text>
        <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
          <Text style={styles.sectionCount}>{showtimes.length} db</Text>
          <TouchableOpacity style={styles.btnAdd} onPress={() => openEdit()}>
            <Text style={styles.btnAddText}>+ Új vetítés</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.helperBox}>
        <Text style={styles.helperTitle}>ID referencia:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: "row", gap: 20 }}>
            <View>
              <Text style={styles.helperSub}>Filmek</Text>
              {movies.slice(0, 8).map((m) => (
                <Text key={g(m, "MovieId")} style={styles.helperRow}>
                  #{g(m, "MovieId")} {g(m, "Title")}
                </Text>
              ))}
            </View>
            <View>
              <Text style={styles.helperSub}>Termek</Text>
              {halls.map((h) => (
                <Text key={g(h, "HallId")} style={styles.helperRow}>
                  #{g(h, "HallId")} {g(h, "Name")}
                </Text>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
      {showtimes.map((st) => (
        <View
          key={g(st, "ShowtimeId")}
          style={[styles.card, { borderLeftColor: "#00d2ff" }]}
        >
          <Text style={styles.cardTitle} numberOfLines={1}>
            {g(st, "MovieTitle")}
          </Text>
          <Text style={styles.cardSub}>
            {g(st, "Date")} • {String(g(st, "Time")).slice(0, 5)} •{" "}
            {g(st, "HallName")}
          </Text>
          <View style={styles.btnRow}>
            <TouchableOpacity
              style={styles.btnEdit}
              onPress={() => openEdit(st)}
            >
              <Text style={styles.btnEditText}>✏️ Szerkesztés</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.btnDelete}
              onPress={() => del(g(st, "ShowtimeId"), g(st, "MovieTitle"))}
            >
              <Text style={styles.btnDeleteText}>🗑 Törlés</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
      <EditModal
        visible={editId !== null}
        title={isNew ? "Új vetítés" : "Vetítés szerkesztése"}
        saving={saving}
        onClose={closeEdit}
        onSave={save}
        fields={
          editId !== null
            ? [
                {
                  key: "mid",
                  label: "Film ID *",
                  value: form.MovieId,
                  onChange: (v) => setForm((f) => ({ ...f, MovieId: v })),
                  numeric: true,
                },
                {
                  key: "hid",
                  label: "Terem ID *",
                  value: form.HallId,
                  onChange: (v) => setForm((f) => ({ ...f, HallId: v })),
                  numeric: true,
                },
                {
                  key: "date",
                  label: "Dátum * (ÉÉÉÉ-HH-NN)",
                  value: form.ShowDate,
                  onChange: (v) => setForm((f) => ({ ...f, ShowDate: v })),
                },
                {
                  key: "time",
                  label: "Időpont * (ÓÓ:PP)",
                  value: form.ShowTime1,
                  onChange: (v) => setForm((f) => ({ ...f, ShowTime1: v })),
                },
              ]
            : []
        }
      />
    </ScrollView>
  );
}

function StatsTab({ token }) {
  const [daily, setDaily] = useState(null);
  const [topMovies, setTopMovies] = useState([]);
  const [occ, setOcc] = useState({ AktivVetitesek: [], ArchivVetitesek: [] });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("aktiv");

  useEffect(() => {
    const h = authH(token);
    Promise.all([
      fetch(`${API_BASE}/Admin/DailyReport`, { headers: h }).then((r) =>
        r.ok ? r.json() : null,
      ),
      fetch(`${API_BASE}/Admin/TopMovies`, { headers: h }).then((r) =>
        r.ok ? r.json() : [],
      ),
      fetch(`${API_BASE}/Admin/ShowtimeOccupancy`, { headers: h }).then((r) =>
        r.ok ? r.json() : null,
      ),
    ])
      .then(([d, t, o]) => {
        if (d) setDaily(d);
        if (t) setTopMovies(t);
        if (o) setOcc(o);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return <ActivityIndicator color="#E0AA3E" style={{ marginTop: 40 }} />;

  const cards = [
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
  const activeList = occ.AktivVetitesek || occ.aktivVetitesek || [];
  const archiveList = occ.ArchivVetitesek || occ.archivVetitesek || [];
  const list = tab === "aktiv" ? activeList : archiveList;

  return (
    <ScrollView style={styles.section} showsVerticalScrollIndicator={false}>
      <Text style={[styles.sectionTitle, { marginBottom: 12 }]}>
        Mai nap – {daily?.Datum ?? "—"}
      </Text>
      <View style={styles.statGrid}>
        {cards.map((sc) => (
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
              style={[
                styles.topRank,
                { color: ["#E0AA3E", "#c0c0c0", "#cd7f32"][i] },
              ]}
            >
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
            style={[styles.occTab, tab === t.key && styles.occTabActive]}
            onPress={() => setTab(t.key)}
          >
            <Text
              style={[
                styles.occTabText,
                tab === t.key && styles.occTabTextActive,
              ]}
            >
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {list.map((item, i) => {
        const pct = parseFloat(item.Telitettseg || item.telitettseg) || 0;
        const color = pct >= 80 ? "#E50914" : pct >= 50 ? "#E0AA3E" : "#00b4d8";
        return (
          <View key={i} style={styles.occRow}>
            <Text style={styles.occFilm}>{item.Film || item.film}</Text>
            <Text style={styles.occTime}>{item.Idopont || item.idopont}</Text>
            <View style={styles.occBarTrack}>
              <View
                style={[
                  styles.occBarFill,
                  { width: `${Math.min(pct, 100)}%`, backgroundColor: color },
                ]}
              />
            </View>
            <View style={styles.occBottom}>
              <Text style={[styles.occPct, { color }]}>
                {item.Telitettseg || item.telitettseg}
              </Text>
              <Text style={styles.occTickets}>
                {item.EladottJegyek ?? item.eladottJegyek} jegy
              </Text>
            </View>
          </View>
        );
      })}
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
      const load = async () => {
        try {
          if (Platform.OS === "web") {
            const r = sessionStorage.getItem("role");
            const t = sessionStorage.getItem("token");
            setRole(r);
            setToken(t);
            setChecking(false);
          } else {
            const [[, r], [, t]] = await AsyncStorage.multiGet([
              "role",
              "token",
            ]);
            setRole(r);
            setToken(t);
            setChecking(false);
          }
        } catch {
          setChecking(false);
        }
      };
      load();
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
      {token && activeTab === "users" && <UsersTab token={token} />}
      {token && activeTab === "movies" && <MoviesTab token={token} />}
      {token && activeTab === "showtimes" && <ShowtimesTab token={token} />}
      {token && activeTab === "stats" && <StatsTab token={token} />}
    </SafeAreaView>
  );
}

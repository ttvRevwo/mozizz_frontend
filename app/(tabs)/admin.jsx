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

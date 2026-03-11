import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const API_BASE = "http://192.168.137.1:5083/api";

async function getToken() {
  try {
    if (Platform.OS === "web")
      return (
        sessionStorage.getItem("token") || (await AsyncStorage.getItem("token"))
      );
    return await AsyncStorage.getItem("token");
  } catch {
    return null;
  }
}

async function getRole() {
  try {
    if (Platform.OS === "web")
      return (
        sessionStorage.getItem("role") || (await AsyncStorage.getItem("role"))
      );
    return await AsyncStorage.getItem("role");
  } catch {
    return null;
  }
}

export default function ValidateScreen() {
  const [isAdmin, setIsAdmin] = useState(null);
  const [token, setToken] = useState(null);
  const [code, setCode] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      Promise.all([getRole(), getToken()]).then(([r, t]) => {
        setIsAdmin(r === "Admin");
        setToken(t);
      });
    }, []),
  );

  const validate = async () => {
    const trimmed = code.trim();
    if (!trimmed) {
      Alert.alert("Hiba", "Add meg a jegy kódját!");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const r = await fetch(
        `${API_BASE}/Ticket/ValidateTicket/${encodeURIComponent(trimmed)}`,
      );
      const d = await r.json();
      if (r.ok) {
        setResult({
          ok: true,
          uzenet: d.uzenet,
          film: d.film,
          idopont: d.idopont,
          szekek: d.szekek,
        });
      } else {
        setResult({
          ok: false,
          uzenet: d.uzenet || d.hiba || "Érvénytelen jegy!",
        });
      }
    } catch {
      setResult({ ok: false, uzenet: "Hálózati hiba!" });
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setCode("");
    setResult(null);
  };

  if (isAdmin === null) {
    return (
      <SafeAreaView style={s.container}>
        <ActivityIndicator color="#E0AA3E" style={{ marginTop: 60 }} />
      </SafeAreaView>
    );
  }

  if (!isAdmin) {
    return (
      <SafeAreaView style={s.container}>
        <View style={s.centered}>
          <Text style={s.lockIcon}>🔒</Text>
          <Text style={s.notAuthTitle}>Nincs hozzáférésed</Text>
          <Text style={s.notAuthText}>
            Ez az oldal csak adminisztrátorok számára érhető el.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <Text style={s.headerTitle}>🎫 Jegy érvényesítés</Text>
        <Text style={s.headerSub}>Add meg a jegy kódját a beolvasáshoz</Text>
      </View>

      <ScrollView style={s.content} keyboardShouldPersistTaps="handled">
        {!result ? (
          <View style={s.inputSection}>
            <Text style={s.label}>Jegy kód</Text>
            <TextInput
              style={s.input}
              value={code}
              onChangeText={setCode}
              placeholder="pl. TKT-XXXXXXXX"
              placeholderTextColor="#444"
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus
            />
            <TouchableOpacity
              style={[s.btn, loading && { opacity: 0.6 }]}
              onPress={validate}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#111" size="small" />
              ) : (
                <Text style={s.btnText}>✓ Érvényesítés</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View
            style={[
              s.resultBox,
              { borderColor: result.ok ? "#52b788" : "#E50914" },
            ]}
          >
            <Text style={s.resultIcon}>{result.ok ? "✅" : "❌"}</Text>
            <Text
              style={[
                s.resultMsg,
                { color: result.ok ? "#52b788" : "#E50914" },
              ]}
            >
              {result.uzenet}
            </Text>
            {result.ok && (
              <View style={s.resultDetails}>
                <View style={s.detailRow}>
                  <Text style={s.detailLabel}>🎬 Film</Text>
                  <Text style={s.detailValue}>{result.film}</Text>
                </View>
                <View style={s.detailRow}>
                  <Text style={s.detailLabel}>🕐 Időpont</Text>
                  <Text style={s.detailValue}>{result.idopont}</Text>
                </View>
                <View style={s.detailRow}>
                  <Text style={s.detailLabel}>💺 Székek</Text>
                  <Text style={s.detailValue}>{result.szekek}</Text>
                </View>
              </View>
            )}
            <TouchableOpacity style={s.resetBtn} onPress={reset}>
              <Text style={s.resetBtnText}>← Következő jegy</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  lockIcon: { fontSize: 64, marginBottom: 16 },
  notAuthTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
  },
  notAuthText: { color: "#888", fontSize: 15, textAlign: "center" },
  header: {
    padding: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1a1a1a",
  },
  headerTitle: { color: "#E0AA3E", fontSize: 22, fontWeight: "700" },
  headerSub: { color: "#888", fontSize: 13, marginTop: 4 },
  content: { flex: 1, padding: 20 },
  inputSection: { gap: 12, marginTop: 8 },
  label: { color: "#aaa", fontSize: 14, marginBottom: 4 },
  input: {
    backgroundColor: "#111",
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 12,
    color: "#fff",
    padding: 16,
    fontSize: 16,
    fontFamily: Platform.OS === "web" ? "monospace" : "Courier",
    letterSpacing: 1,
  },
  btn: {
    backgroundColor: "#E0AA3E",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 4,
  },
  btnText: { color: "#111", fontWeight: "700", fontSize: 16 },
  resultBox: {
    borderWidth: 2,
    borderRadius: 16,
    padding: 28,
    alignItems: "center",
    backgroundColor: "#0a0a0a",
    marginTop: 8,
  },
  resultIcon: { fontSize: 72, marginBottom: 12 },
  resultMsg: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  resultDetails: { width: "100%", marginTop: 16, gap: 10 },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#1a1a1a",
  },
  detailLabel: { color: "#888", fontSize: 14 },
  detailValue: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
    textAlign: "right",
  },
  resetBtn: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#333",
  },
  resetBtnText: { color: "#888", fontSize: 15 },
});

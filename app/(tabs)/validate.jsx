import AsyncStorage from "@react-native-async-storage/async-storage";
import { CameraView, useCameraPermissions } from "expo-camera";
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
  const [mode, setMode] = useState("scan");
  const [code, setCode] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  useFocusEffect(
    useCallback(() => {
      getRole().then((r) => setIsAdmin(r === "Admin"));
      setResult(null);
      setCode("");
      setScanned(false);
    }, []),
  );

  const validate = async (ticketCode) => {
    const trimmed = (ticketCode || code).trim();
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

  const onQrScanned = ({ data }) => {
    if (scanned || !data) return;
    setScanned(true);
    setCode(data);
    validate(data);
  };

  const reset = () => {
    setCode("");
    setResult(null);
    setScanned(false);
  };

  if (isAdmin === null)
    return (
      <SafeAreaView style={s.container}>
        <ActivityIndicator color="#E0AA3E" style={{ marginTop: 60 }} />
      </SafeAreaView>
    );

  if (!isAdmin)
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

  if (result)
    return (
      <SafeAreaView style={s.container}>
        <View style={s.header}>
          <Text style={s.headerTitle}>🎫 Jegy érvényesítés</Text>
        </View>
        <ScrollView contentContainerStyle={s.resultContainer}>
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
        </ScrollView>
      </SafeAreaView>
    );

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <Text style={s.headerTitle}>🎫 Jegy érvényesítés</Text>
      </View>

      {/* Mód váltó */}
      <View style={s.modeSwitcher}>
        <TouchableOpacity
          style={[s.modeBtn, mode === "scan" && s.modeBtnActive]}
          onPress={() => setMode("scan")}
        >
          <Text style={[s.modeBtnText, mode === "scan" && s.modeBtnTextActive]}>
            📷 QR Olvasó
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.modeBtn, mode === "manual" && s.modeBtnActive]}
          onPress={() => setMode("manual")}
        >
          <Text
            style={[s.modeBtnText, mode === "manual" && s.modeBtnTextActive]}
          >
            ⌨️ Kézi bevitel
          </Text>
        </TouchableOpacity>
      </View>

      {/* QR scanner mód */}
      {mode === "scan" && (
        <View style={s.scanContainer}>
          {!permission ? (
            <ActivityIndicator color="#E0AA3E" style={{ marginTop: 40 }} />
          ) : !permission.granted ? (
            <View style={s.permBox}>
              <Text style={s.permText}>
                📷 Kamera engedély szükséges a QR kód olvasáshoz.
              </Text>
              <TouchableOpacity style={s.permBtn} onPress={requestPermission}>
                <Text style={s.permBtnText}>Engedély megadása</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <CameraView
                style={s.camera}
                facing="back"
                barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
                onBarcodeScanned={scanned ? undefined : onQrScanned}
              />
              <View style={s.scanOverlay}>
                <View style={s.scanFrame} />
                <Text style={s.scanHint}>Irányítsd a QR kódra</Text>
              </View>
              {loading && (
                <View style={s.scanLoading}>
                  <ActivityIndicator color="#E0AA3E" size="large" />
                </View>
              )}
            </>
          )}
        </View>
      )}

      {/* Kézi bevitel mód */}
      {mode === "manual" && (
        <ScrollView
          style={s.manualContainer}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={s.label}>Jegy kód</Text>
          <TextInput
            style={s.input}
            value={code}
            onChangeText={setCode}
            placeholder="pl. XXXX-XXXX-XXXX-XXXX-XXXXX"
            placeholderTextColor="#444"
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus
          />
          <TouchableOpacity
            style={[s.btn, loading && { opacity: 0.6 }]}
            onPress={() => validate()}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#111" size="small" />
            ) : (
              <Text style={s.btnText}>✓ Érvényesítés</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      )}
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

  modeSwitcher: { flexDirection: "row", margin: 16, gap: 8 },
  modeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#333",
    alignItems: "center",
  },
  modeBtnActive: { backgroundColor: "#E0AA3E", borderColor: "#E0AA3E" },
  modeBtnText: { color: "#888", fontWeight: "600" },
  modeBtnTextActive: { color: "#111" },

  scanContainer: { flex: 1, position: "relative" },
  camera: { flex: 1 },
  scanOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  scanFrame: {
    width: 220,
    height: 220,
    borderWidth: 3,
    borderColor: "#E0AA3E",
    borderRadius: 16,
    backgroundColor: "transparent",
  },
  scanHint: {
    color: "#fff",
    marginTop: 16,
    fontSize: 15,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  scanLoading: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  permBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    gap: 16,
  },
  permText: { color: "#aaa", textAlign: "center", fontSize: 15 },
  permBtn: {
    backgroundColor: "#E0AA3E",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  permBtnText: { color: "#111", fontWeight: "700" },

  manualContainer: { flex: 1, padding: 20 },
  label: { color: "#aaa", fontSize: 14, marginBottom: 8 },
  input: {
    backgroundColor: "#111",
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 12,
    color: "#fff",
    padding: 16,
    fontSize: 16,
    letterSpacing: 1,
    marginBottom: 12,
  },
  btn: {
    backgroundColor: "#E0AA3E",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  btnText: { color: "#111", fontWeight: "700", fontSize: 16 },

  resultContainer: { padding: 20 },
  resultBox: {
    borderWidth: 2,
    borderRadius: 16,
    padding: 28,
    alignItems: "center",
    backgroundColor: "#0a0a0a",
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

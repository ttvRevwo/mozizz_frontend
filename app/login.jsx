import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import styles from "../styles/authStyles";

const API_BASE = "http://192.168.137.1:5083/api";

function decodeJwtPayload(token) {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

export default function LoginScreen() {
  const router = useRouter();
  const { redirect } = useLocalSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const [forgotModal, setForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotCode, setForgotCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPassword2, setNewPassword2] = useState("");
  const [forgotMsg, setForgotMsg] = useState("");
  const [forgotError, setForgotError] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setIsError(true);
      setMessage("Kérlek töltsd ki az összes mezőt!");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch(`${API_BASE}/Auth/Login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Email: email, Password: password }),
      });
      const data = await response.json();
      if (response.ok) {
        const content = data?.data ?? data;
        const token = content.token || content.jwtToken || content.accessToken;
        if (token) await AsyncStorage.setItem("token", token);
        if (content.userId)
          await AsyncStorage.setItem("userId", String(content.userId));
        if (content.name) await AsyncStorage.setItem("userName", content.name);
        if (content.role) await AsyncStorage.setItem("role", content.role);
        if (Platform.OS === "web") {
          try {
            if (token) sessionStorage.setItem("token", token);
            if (content.userId)
              sessionStorage.setItem("userId", String(content.userId));
            if (content.name) sessionStorage.setItem("userName", content.name);
            if (content.role) sessionStorage.setItem("role", content.role);
          } catch {}
        }
        setIsError(false);
        setMessage(
          `Sikeres bejelentkezés! Üdv, ${content.name || "felhasználó"}!`,
        );
        setTimeout(() => router.replace(redirect || "/"), 1000);
      } else {
        setIsError(true);
        setMessage(
          typeof data === "string" ? data : "Hibás email cím vagy jelszó!",
        );
      }
    } catch {
      setIsError(true);
      setMessage("Nem sikerült csatlakozni a szerverhez.");
    } finally {
      setLoading(false);
    }
  };

  const sendForgotCode = async () => {
    if (!forgotEmail) {
      setForgotError(true);
      setForgotMsg("Add meg az email címed!");
      return;
    }
    setForgotLoading(true);
    setForgotMsg("");
    try {
      const r = await fetch(`${API_BASE}/Auth/ForgotPassword`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Email: forgotEmail }),
      });
      const text = await r.text();
      if (r.ok) {
        setForgotError(false);
        setForgotMsg("Kód elküldve! Ellenőrizd az emailjeidet.");
        setForgotStep(2);
      } else {
        setForgotError(true);
        setForgotMsg(text || "Hiba történt.");
      }
    } catch {
      setForgotError(true);
      setForgotMsg("Nem sikerült csatlakozni a szerverhez.");
    } finally {
      setForgotLoading(false);
    }
  };

  const resetPassword = async () => {
    if (!forgotCode || !newPassword || !newPassword2) {
      setForgotError(true);
      setForgotMsg("Töltsd ki az összes mezőt!");
      return;
    }
    if (newPassword !== newPassword2) {
      setForgotError(true);
      setForgotMsg("A két jelszó nem egyezik!");
      return;
    }
    if (newPassword.length < 6) {
      setForgotError(true);
      setForgotMsg("A jelszó legalább 6 karakter legyen!");
      return;
    }
    setForgotLoading(true);
    setForgotMsg("");
    try {
      const r = await fetch(`${API_BASE}/Auth/ResetPassword`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Email: forgotEmail,
          Code: forgotCode,
          NewPassword: newPassword,
        }),
      });
      const text = await r.text();
      if (r.ok) {
        setForgotError(false);
        setForgotMsg("✓ Jelszó sikeresen megváltoztatva!");
        setTimeout(() => {
          setForgotModal(false);
          setForgotStep(1);
          setForgotEmail("");
          setForgotCode("");
          setNewPassword("");
          setNewPassword2("");
          setForgotMsg("");
        }, 1500);
      } else {
        setForgotError(true);
        setForgotMsg(text || "Hibás vagy lejárt kód!");
      }
    } catch {
      setForgotError(true);
      setForgotMsg("Nem sikerült csatlakozni a szerverhez.");
    } finally {
      setForgotLoading(false);
    }
  };

  const closeForgot = () => {
    setForgotModal(false);
    setForgotStep(1);
    setForgotEmail("");
    setForgotCode("");
    setNewPassword("");
    setNewPassword2("");
    setForgotMsg("");
    setForgotError(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.inner}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>← Vissza</Text>
        </TouchableOpacity>

        <Text style={styles.logo}>🎬 Mozizz</Text>
        <Text style={styles.title}>Bejelentkezés</Text>
        <Text style={styles.subtitle}>
          Üdvözlünk! Jelentkezz be a legjobb filmélményekért.
        </Text>

        <View style={styles.form}>
          <Text style={styles.label}>Email cím</Text>
          <TextInput
            style={styles.input}
            placeholder="pelda@email.com"
            placeholderTextColor="#555"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Jelszó</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="#555"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            onPress={() => setForgotModal(true)}
            style={{ alignSelf: "flex-end", marginBottom: 12 }}
          >
            <Text style={{ color: "#E50914", fontSize: 13 }}>
              Elfelejtett jelszó?
            </Text>
          </TouchableOpacity>

          {message ? (
            <Text
              style={[styles.message, isError ? styles.error : styles.success]}
            >
              {message}
            </Text>
          ) : null}

          <TouchableOpacity
            style={styles.btn}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Bejelentkezés</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/register")}>
            <Text style={styles.link}>
              Nincs még fiókod?{" "}
              <Text style={styles.linkBold}>Regisztrálj!</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        visible={forgotModal}
        transparent
        animationType="slide"
        onRequestClose={closeForgot}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.75)",
            justifyContent: "flex-end",
          }}
        >
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={closeForgot}
          />
          <View
            style={{
              backgroundColor: "#1a1a1a",
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: 24,
              paddingBottom: 40,
            }}
          >
            <Text
              style={{
                color: "#E0AA3E",
                fontSize: 18,
                fontWeight: "700",
                marginBottom: 6,
              }}
            >
              🔑 Elfelejtett jelszó
            </Text>
            <Text style={{ color: "#888", fontSize: 13, marginBottom: 20 }}>
              {forgotStep === 1
                ? "Add meg az email címed és küldünk egy kódot."
                : `Kód elküldve ide: ${forgotEmail}`}
            </Text>

            {forgotStep === 1 ? (
              <>
                <Text
                  style={{
                    color: "#aaa",
                    fontSize: 12,
                    marginBottom: 6,
                    textTransform: "uppercase",
                  }}
                >
                  Email cím
                </Text>
                <TextInput
                  style={{
                    backgroundColor: "#111",
                    borderWidth: 1,
                    borderColor: "#333",
                    borderRadius: 10,
                    color: "#fff",
                    padding: 12,
                    fontSize: 15,
                    marginBottom: 16,
                  }}
                  placeholder="pelda@email.com"
                  placeholderTextColor="#444"
                  value={forgotEmail}
                  onChangeText={setForgotEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </>
            ) : (
              <>
                <Text
                  style={{
                    color: "#aaa",
                    fontSize: 12,
                    marginBottom: 6,
                    textTransform: "uppercase",
                  }}
                >
                  6 jegyű kód
                </Text>
                <TextInput
                  style={{
                    backgroundColor: "#111",
                    borderWidth: 1,
                    borderColor: "#333",
                    borderRadius: 10,
                    color: "#fff",
                    padding: 12,
                    fontSize: 15,
                    marginBottom: 12,
                  }}
                  placeholder="123456"
                  placeholderTextColor="#444"
                  value={forgotCode}
                  onChangeText={setForgotCode}
                  keyboardType="number-pad"
                  maxLength={6}
                />
                <Text
                  style={{
                    color: "#aaa",
                    fontSize: 12,
                    marginBottom: 6,
                    textTransform: "uppercase",
                  }}
                >
                  Új jelszó
                </Text>
                <TextInput
                  style={{
                    backgroundColor: "#111",
                    borderWidth: 1,
                    borderColor: "#333",
                    borderRadius: 10,
                    color: "#fff",
                    padding: 12,
                    fontSize: 15,
                    marginBottom: 12,
                  }}
                  placeholder="••••••••"
                  placeholderTextColor="#444"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                />
                <Text
                  style={{
                    color: "#aaa",
                    fontSize: 12,
                    marginBottom: 6,
                    textTransform: "uppercase",
                  }}
                >
                  Új jelszó megerősítése
                </Text>
                <TextInput
                  style={{
                    backgroundColor: "#111",
                    borderWidth: 1,
                    borderColor: "#333",
                    borderRadius: 10,
                    color: "#fff",
                    padding: 12,
                    fontSize: 15,
                    marginBottom: 16,
                  }}
                  placeholder="••••••••"
                  placeholderTextColor="#444"
                  value={newPassword2}
                  onChangeText={setNewPassword2}
                  secureTextEntry
                />
              </>
            )}

            {forgotMsg ? (
              <Text
                style={{
                  color: forgotError ? "#E50914" : "#4CAF50",
                  fontSize: 13,
                  marginBottom: 12,
                }}
              >
                {forgotMsg}
              </Text>
            ) : null}

            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity
                onPress={closeForgot}
                style={{
                  flex: 1,
                  backgroundColor: "#2a2a2a",
                  borderRadius: 10,
                  paddingVertical: 13,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#aaa", fontWeight: "600" }}>Mégse</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={forgotStep === 1 ? sendForgotCode : resetPassword}
                disabled={forgotLoading}
                style={{
                  flex: 1,
                  backgroundColor: "#E50914",
                  borderRadius: 10,
                  paddingVertical: 13,
                  alignItems: "center",
                }}
              >
                {forgotLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ color: "#fff", fontWeight: "700" }}>
                    {forgotStep === 1 ? "Kód küldése" : "Jelszó mentése"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            {forgotStep === 2 && (
              <TouchableOpacity
                onPress={() => {
                  setForgotStep(1);
                  setForgotMsg("");
                }}
                style={{ marginTop: 12, alignItems: "center" }}
              >
                <Text style={{ color: "#555", fontSize: 12 }}>
                  ← Más email cím
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

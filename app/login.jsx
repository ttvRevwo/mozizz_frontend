import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
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
  // [2025-03-09] Redirect param - sikeres login után visszanavigál az előző oldalra
  const { redirect } = useLocalSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

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
        const claims = token ? decodeJwtPayload(token) : null;

        if (token) await AsyncStorage.setItem("token", token);
        if (content.userId)
          await AsyncStorage.setItem("userId", String(content.userId));
        if (content.name) await AsyncStorage.setItem("userName", content.name);
        if (content.role) await AsyncStorage.setItem("role", content.role);

        // [2025-03-09] Web: tracking prevention blokkolhatja az AsyncStorage-t, sessionStorage fallback
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
    </KeyboardAvoidingView>
  );
}

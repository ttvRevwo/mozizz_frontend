import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = 'http://192.168.137.1:5083/api';

function decodeJwtPayload(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setIsError(true);
      setMessage('Kérlek töltsd ki az összes mezőt!');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${API_BASE}/Auth/Login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Email: email, Password: password }),
      });

      const data = await response.json();

      if (response.ok) {
        const content = data?.data ?? data;
        const token = content.token || content.jwtToken || content.accessToken;
        const claims = token ? decodeJwtPayload(token) : null;

        if (token) await AsyncStorage.setItem('token', token);
        if (content.userId) await AsyncStorage.setItem('userId', String(content.userId));
        if (content.name) await AsyncStorage.setItem('userName', content.name);
        if (content.role) await AsyncStorage.setItem('role', content.role);

        setIsError(false);
        setMessage(`Sikeres bejelentkezés! Üdv, ${content.name || 'felhasználó'}!`);

        setTimeout(() => router.replace('/'), 1000);
      } else {
        setIsError(true);
        setMessage(typeof data === 'string' ? data : 'Hibás email cím vagy jelszó!');
      }
    } catch {
      setIsError(true);
      setMessage('Nem sikerült csatlakozni a szerverhez.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">

        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>← Vissza</Text>
        </TouchableOpacity>

        <Text style={styles.logo}>🎬 Mozizz</Text>
        <Text style={styles.title}>Bejelentkezés</Text>
        <Text style={styles.subtitle}>Üdvözlünk! Jelentkezz be a legjobb filmélményekért.</Text>

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
            <Text style={[styles.message, isError ? styles.error : styles.success]}>
              {message}
            </Text>
          ) : null}

          <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={loading}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnText}>Bejelentkezés</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/register')}>
            <Text style={styles.link}>Nincs még fiókod? <Text style={styles.linkBold}>Regisztrálj!</Text></Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#141414' },
  inner: { flexGrow: 1, padding: 24, paddingTop: 60 },

  backBtn: { marginBottom: 20 },
  backText: { color: '#888', fontSize: 15 },

  logo: { color: '#E50914', fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
  title: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { color: '#888', fontSize: 14, marginBottom: 32, lineHeight: 20 },

  form: { gap: 12 },
  label: { color: '#ccc', fontSize: 13, marginBottom: 4 },
  input: {
    backgroundColor: '#1a1a1a',
    color: '#fff',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 8,
  },

  message: { fontSize: 13, padding: 10, borderRadius: 8, textAlign: 'center' },
  error: { backgroundColor: '#3d0000', color: '#ff6b6b' },
  success: { backgroundColor: '#003d1a', color: '#6bff9e' },

  btn: {
    backgroundColor: '#E50914',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  link: { color: '#888', fontSize: 14, textAlign: 'center', marginTop: 16 },
  linkBold: { color: '#E50914', fontWeight: 'bold' },
});

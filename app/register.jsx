import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ScrollView,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';

const API_BASE = 'http://192.168.137.1:5083/api';

const validateFullname = (n) => /^[A-Za-zÁÉÍÓÖŐÚÜŰáéíóöőúüű]+ [A-Za-zÁÉÍÓÖŐÚÜŰáéíóöőúüű]+$/.test(n);
const validateEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
const validatePhone = (p) => /^[0-9]{9}$/.test(p);
const validatePassword = (p) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(p);

export default function RegisterScreen() {
  const router = useRouter();

  const [step, setStep] = useState('register'); // 'register' | 'verify' | 'success'
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+36');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [code, setCode] = useState('');

  const handleRegister = async () => {
    setMessage('');
    if (!agreed) { setIsError(true); setMessage('El kell fogadnod az ÁSZF-et!'); return; }
    if (!validateFullname(fullname)) { setIsError(true); setMessage('A teljes név két szóból álljon, csak betűk.'); return; }
    if (!validateEmail(email)) { setIsError(true); setMessage('Érvényes email címet adj meg.'); return; }
    if (!validatePhone(phone)) { setIsError(true); setMessage('A telefonszám 9 számjegyből álljon.'); return; }
    if (!validatePassword(password)) { setIsError(true); setMessage('Gyenge jelszó! Kell: nagy+kis betű, szám, speciális karakter, min. 8 jegy.'); return; }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/Auth/RegisterRequest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Name: fullname, Email: email, Phone: `${countryCode}${phone}`, Password: password }),
      });

      const data = await res.text();
      if (res.ok) {
        setIsError(false);
        setMessage('Kérlek írd be az emailben kapott 6 jegyű kódot!');
        setStep('verify');
      } else {
        setIsError(true);
        setMessage(data || 'Hiba történt a regisztráció során.');
      }
    } catch {
      setIsError(true);
      setMessage('Nem sikerült csatlakozni a szerverhez.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setLoading(true);
    setMessage('');
    try {
      const url = `${API_BASE}/Auth/VerifyAndRegister?email=${encodeURIComponent(email)}&code=${code}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Name: fullname, Email: email, Phone: `${countryCode}${phone}`, Password: password }),
      });

      const data = await res.text();
      if (res.ok) {
        setStep('success');
      } else {
        setIsError(true);
        setMessage(data || 'Hibás vagy lejárt kód!');
      }
    } catch {
      setIsError(true);
      setMessage('Hiba történt.');
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

        {step !== 'success' && (
          <TouchableOpacity style={styles.backBtn} onPress={() => step === 'verify' ? setStep('register') : router.back()}>
            <Text style={styles.backText}>← Vissza</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.logo}>🎬 Mozizz</Text>
        <Text style={styles.title}>Regisztráció</Text>

        {/* REGISTER STEP */}
        {step === 'register' && (
          <View style={styles.form}>
            <Text style={styles.subtitle}>Hozd létre a fiókodat a legjobb filmélményekért!</Text>

            <Text style={styles.label}>Teljes név</Text>
            <TextInput
              style={[styles.input, fullname && (validateFullname(fullname) ? styles.inputValid : styles.inputInvalid)]}
              placeholder="Kovács János"
              placeholderTextColor="#555"
              value={fullname}
              onChangeText={setFullname}
            />

            <Text style={styles.label}>Email cím</Text>
            <TextInput
              style={[styles.input, email && (validateEmail(email) ? styles.inputValid : styles.inputInvalid)]}
              placeholder="pelda@email.com"
              placeholderTextColor="#555"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.label}>Telefonszám</Text>
            <View style={styles.phoneRow}>
              <View style={styles.countryCodeBox}>
                <Text style={styles.countryCodeText}>{countryCode}</Text>
              </View>
              <TextInput
                style={[styles.input, styles.phoneInput, phone && (validatePhone(phone) ? styles.inputValid : styles.inputInvalid)]}
                placeholder="701234567"
                placeholderTextColor="#555"
                value={phone}
                onChangeText={t => setPhone(t.replace(/\D/g, '').slice(0, 9))}
                keyboardType="phone-pad"
              />
            </View>

            <Text style={styles.label}>Jelszó</Text>
            <TextInput
              style={[styles.input, password && (validatePassword(password) ? styles.inputValid : styles.inputInvalid)]}
              placeholder="••••••••"
              placeholderTextColor="#555"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <Text style={styles.hint}>Min. 8 karakter, nagy+kis betű, szám és speciális karakter (@$!%*?&)</Text>

            <TouchableOpacity style={styles.checkRow} onPress={() => setAgreed(!agreed)}>
              <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
                {agreed && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkLabel}>Elfogadom az Általános Szerződési Feltételeket</Text>
            </TouchableOpacity>

            {message ? (
              <Text style={[styles.message, isError ? styles.error : styles.success]}>{message}</Text>
            ) : null}

            <TouchableOpacity style={styles.btn} onPress={handleRegister} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Regisztráció</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/login')}>
              <Text style={styles.link}>Már van fiókod? <Text style={styles.linkBold}>Jelentkezz be!</Text></Text>
            </TouchableOpacity>
          </View>
        )}

        {/* VERIFY STEP */}
        {step === 'verify' && (
          <View style={styles.form}>
            <Text style={styles.subtitle}>
              Elküldtük a kódot a {email} címre.{'\n'}A kód 5 percig érvényes.
            </Text>

            <Text style={styles.label}>6 jegyű kód</Text>
            <TextInput
              style={styles.input}
              placeholder="123456"
              placeholderTextColor="#555"
              value={code}
              onChangeText={t => setCode(t.replace(/\D/g, '').slice(0, 6))}
              keyboardType="number-pad"
            />

            {message ? (
              <Text style={[styles.message, isError ? styles.error : styles.success]}>{message}</Text>
            ) : null}

            <TouchableOpacity style={styles.btn} onPress={handleVerify} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Kód beküldése</Text>}
            </TouchableOpacity>
          </View>
        )}

        {/* SUCCESS STEP */}
        {step === 'success' && (
          <View style={styles.successBox}>
            <Text style={styles.successIcon}>✅</Text>
            <Text style={styles.successTitle}>Sikeres regisztráció!</Text>
            <Text style={styles.successText}>A fiókodat létrehoztuk. Most már bejelentkezhetsz.</Text>
            <TouchableOpacity style={styles.btn} onPress={() => router.replace('/login')}>
              <Text style={styles.btnText}>Tovább a bejelentkezésre</Text>
            </TouchableOpacity>
          </View>
        )}

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
  subtitle: { color: '#888', fontSize: 14, marginBottom: 24, lineHeight: 20 },

  form: { gap: 6 },
  label: { color: '#ccc', fontSize: 13, marginBottom: 4, marginTop: 8 },
  input: {
    backgroundColor: '#1a1a1a',
    color: '#fff',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#333',
  },
  inputValid: { borderColor: '#4ade80' },
  inputInvalid: { borderColor: '#E50914' },
  hint: { color: '#555', fontSize: 11, marginTop: 4 },

  phoneRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  countryCodeBox: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1, borderColor: '#333', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 12,
  },
  countryCodeText: { color: '#fff', fontSize: 15 },
  phoneInput: { flex: 1 },

  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
  checkbox: {
    width: 22, height: 22, borderRadius: 4,
    borderWidth: 2, borderColor: '#555',
    justifyContent: 'center', alignItems: 'center',
  },
  checkboxChecked: { backgroundColor: '#E50914', borderColor: '#E50914' },
  checkmark: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  checkLabel: { color: '#ccc', fontSize: 13, flex: 1 },

  message: { fontSize: 13, padding: 10, borderRadius: 8, textAlign: 'center', marginTop: 8 },
  error: { backgroundColor: '#3d0000', color: '#ff6b6b' },
  success: { backgroundColor: '#003d1a', color: '#6bff9e' },

  btn: {
    backgroundColor: '#E50914',
    borderRadius: 8, paddingVertical: 14,
    alignItems: 'center', marginTop: 16,
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  link: { color: '#888', fontSize: 14, textAlign: 'center', marginTop: 16 },
  linkBold: { color: '#E50914', fontWeight: 'bold' },

  successBox: { alignItems: 'center', paddingTop: 40, gap: 16 },
  successIcon: { fontSize: 64 },
  successTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  successText: { color: '#888', fontSize: 14, textAlign: 'center', lineHeight: 20 },
});

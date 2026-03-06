import { useEffect, useState } from 'react';
import {
  View, Text, Image, TouchableOpacity,
  ActivityIndicator, StyleSheet, ScrollView, Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
import AsyncStorage from '@react-native-async-storage/async-storage';

const CLOUDINARY_BASE = 'https://res.cloudinary.com/dytjuv6qt/image/upload/';
const API_BASE = 'http://192.168.137.1:5083/api';

export default function HomeScreen() {
  const router = useRouter();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const checkLogin = async () => {
      const token = await AsyncStorage.getItem('token');
      const name = await AsyncStorage.getItem('userName');
      setIsLoggedIn(!!token);
      setUserName(name || '');
    };
    checkLogin();
  }, []);

  useEffect(() => {
    fetch(`${API_BASE}/Movie/GetMovies`)
      .then(res => res.json())
      .then(data => {
        const list = data.data || data;
        setMovies(list.slice(0, 6));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (movies.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % movies.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [movies.length]);

  const handleLogout = async () => {
    await AsyncStorage.clear();
    setIsLoggedIn(false);
    setUserName('');
  };

  const getImageUrl = (img) => {
    if (!img) return null;
    if (img.startsWith('http')) return img;
    return `${CLOUDINARY_BASE}${img}`;
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#E50914" />
        <Text style={styles.loadingText}>Betöltés...</Text>
      </View>
    );
  }

  const currentMovie = movies[currentSlide];
  const heroImageUrl = currentMovie ? getImageUrl(currentMovie.img) : null;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* NAVBAR */}
      <View style={styles.navbar}>
        <Text style={styles.logo}>🎬 Mozizz</Text>
        {isLoggedIn ? (
          <View style={styles.navRight}>
            <Text style={styles.navUser}>👤 {userName}</Text>
            <TouchableOpacity onPress={handleLogout}>
              <Text style={styles.navBtn}>Kilépés</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.navRight}>
            <TouchableOpacity onPress={() => router.push('/login')}>
              <Text style={styles.navBtn}>Bejelentkezés</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/register')}>
              <Text style={[styles.navBtn, styles.navBtnPrimary]}>Regisztráció</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* HERO SLIDER */}
      {currentMovie && (
        <View style={styles.hero}>
          {heroImageUrl && (
            <Image source={{ uri: heroImageUrl }} style={styles.heroImage} resizeMode="cover" />
          )}
          <View style={styles.heroOverlay} />
          <View style={styles.heroContent}>
            <Text style={styles.heroGenre}>{currentMovie.genre || 'Film'}</Text>
            <Text style={styles.heroTitle}>{currentMovie.title}</Text>
            <Text style={styles.heroDesc} numberOfLines={3}>{currentMovie.description}</Text>
            <View style={styles.heroButtons}>
              <TouchableOpacity
                style={styles.btnPrimary}
                onPress={() => router.push(`/movie/${currentMovie.movieId}`)}
              >
                <Text style={styles.btnPrimaryText}>🎟 Jegyfoglalás</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.btnSecondary}
                onPress={() => router.push(`/movie/${currentMovie.movieId}`)}
              >
                <Text style={styles.btnSecondaryText}>Részletek</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.dots}>
            {movies.map((_, i) => (
              <TouchableOpacity key={i} onPress={() => setCurrentSlide(i)}>
                <View style={[styles.dot, i === currentSlide && styles.dotActive]} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* AKTUÁLIS FILMEK */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Aktuális filmek</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {movies.map((item) => {
            const imgUrl = getImageUrl(item.img);
            return (
              <TouchableOpacity
                key={String(item.movieId)}
                style={styles.movieCard}
                onPress={() => router.push(`/movie/${item.movieId}`)}
              >
                {imgUrl ? (
                  <Image source={{ uri: imgUrl }} style={styles.moviePoster} resizeMode="cover" />
                ) : (
                  <View style={styles.noPoster}>
                    <Text style={styles.noPosterText}>Nincs kép</Text>
                  </View>
                )}
                <Text style={styles.movieCardTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.movieCardGenre}>{item.genre}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#141414' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#141414' },
  loadingText: { color: '#fff', marginTop: 10 },

  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
    backgroundColor: '#000',
  },
  logo: { color: '#E50914', fontSize: 22, fontWeight: 'bold' },
  navRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  navUser: { color: '#fff', fontSize: 13 },
  navBtn: { color: '#fff', fontSize: 13, marginLeft: 10 },
  navBtnPrimary: {
    backgroundColor: '#E50914',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6,
  },

  hero: { width: '100%', height: SCREEN_HEIGHT - 160, position: 'relative' },
  heroImage: { width: '100%', height: '100%', position: 'absolute' },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  heroContent: { position: 'absolute', bottom: 50, left: 20, right: 20 },
  heroGenre: {
    color: '#E50914', fontWeight: 'bold', fontSize: 12,
    textTransform: 'uppercase', marginBottom: 6,
  },
  heroTitle: { color: '#fff', fontSize: 26, fontWeight: 'bold', marginBottom: 8 },
  heroDesc: { color: '#ccc', fontSize: 13, marginBottom: 16, lineHeight: 18 },
  heroButtons: { flexDirection: 'row', gap: 12 },
  btnPrimary: {
    backgroundColor: '#E50914',
    paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8,
  },
  btnPrimaryText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  btnSecondary: {
    borderWidth: 1, borderColor: '#fff',
    paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8,
  },
  btnSecondaryText: { color: '#fff', fontSize: 14 },
  dots: {
    position: 'absolute', bottom: 16, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'center',
  },
  dot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.4)', margin: 3,
  },
  dotActive: { backgroundColor: '#E50914', width: 20 },

  section: { marginTop: 24, paddingLeft: 16, paddingBottom: 20 },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 14 },
  movieCard: { width: 130, marginRight: 12 },
  moviePoster: { width: 130, height: 190, borderRadius: 8, backgroundColor: '#333' },
  noPoster: {
    width: 130, height: 190, borderRadius: 8,
    backgroundColor: '#333', justifyContent: 'center', alignItems: 'center',
  },
  noPosterText: { color: '#888', fontSize: 12 },
  movieCardTitle: { color: '#fff', fontSize: 13, fontWeight: '600', marginTop: 6 },
  movieCardGenre: { color: '#888', fontSize: 11, marginTop: 2 },
});
import { useEffect, useState, useCallback } from 'react';
import {
  View, Text, Image, TouchableOpacity,
  ActivityIndicator, ScrollView
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';

import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '../../styles/homeStyles';

const CLOUDINARY_BASE = 'https://res.cloudinary.com/dytjuv6qt/image/upload/';
const API_BASE = 'http://192.168.137.1:5083/api';

export default function HomeScreen() {
  const router = useRouter();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);

  // Login állapot frissítése minden tab váltásnál
  useFocusEffect(
    useCallback(() => {
      const checkLogin = async () => {
        const token = await AsyncStorage.getItem('token');
        const name = await AsyncStorage.getItem('userName');
        setIsLoggedIn(!!token);
        setUserName(name || '');
      };
      checkLogin();
    }, [])
  );

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
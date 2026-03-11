import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { addCacheBust, getImageVersions } from "../../lib/imageCache";
import styles from "../../styles/homeStyles";

const CLOUDINARY_BASE = "https://res.cloudinary.com/dytjuv6qt/image/upload/";
const API_BASE = "http://192.168.137.1:5083/api";

export default function HomeScreen() {
  const router = useRouter();
  const [movies, setMovies] = useState([]);
  const [imgVersions, setImgVersions] = useState({});
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);

  useFocusEffect(
    useCallback(() => {
      const checkLogin = async () => {
        const token = await AsyncStorage.getItem("token");
        const name = await AsyncStorage.getItem("userName");
        setIsLoggedIn(!!token);
        setUserName(name || "");
      };
      checkLogin();
    }, []),
  );

  const [focusTick, setFocusTick] = useState(0);
  useFocusEffect(
    useCallback(() => {
      setFocusTick((t) => t + 1);
    }, []),
  );

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/Movie/GetMovies`).then((r) => r.json()),
      fetch(`${API_BASE}/Showtime/GetAllShowtimes`).then((r) => r.json()),
    ])
      .then(([moviesData, showtimesData]) => {
        const list = Array.isArray(moviesData)
          ? moviesData
          : moviesData.data || [];
        const showtimes = Array.isArray(showtimesData) ? showtimesData : [];
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        const parseDate = (raw) => {
          if (!raw) return null;
          const s = String(raw).trim();
          const dmyMatch = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
          if (dmyMatch)
            return new Date(+dmyMatch[3], +dmyMatch[2] - 1, +dmyMatch[1]);
          const isoMatch = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
          if (isoMatch)
            return new Date(+isoMatch[1], +isoMatch[2] - 1, +isoMatch[3]);
          return null;
        };

        const activeTitles = new Set(
          showtimes
            .filter((st) => {
              const dt = parseDate(st.Date || st.date);
              if (!dt) return false;
              return dt >= now;
            })
            .map((st) =>
              (st.MovieTitle || st.movieTitle || "").toLowerCase().trim(),
            )
            .filter(Boolean),
        );

        const active = list.filter((m) =>
          activeTitles.has((m.title || m.Title || "").toLowerCase().trim()),
        );

        const sorted = [...active].sort(
          (a, b) =>
            (b.movieId || b.MovieId || 0) - (a.movieId || a.MovieId || 0),
        );
        setMovies(sorted.slice(0, 6));
        setLoading(false);
        const ids = active.map((m) => m.movieId || m.MovieId).filter(Boolean);
        getImageVersions(ids).then(setImgVersions);
      })
      .catch(() => setLoading(false));
  }, [focusTick]);

  useEffect(() => {
    if (movies.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % movies.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [movies.length]);

  const handleLogout = async () => {
    await AsyncStorage.clear();
    setIsLoggedIn(false);
    setUserName("");
  };

  const getImageUrl = (img) => {
    if (!img) return null;
    if (img.startsWith("http")) return img;
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
            <TouchableOpacity
              onPress={() => router.push("/login?redirect=/(tabs)/profile")}
            >
              <Text style={styles.navBtn}>Bejelentkezés</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push("/register")}>
              <Text style={[styles.navBtn, styles.navBtnPrimary]}>
                Regisztráció
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* HERO SLIDER */}
      {currentMovie && (
        <View style={styles.hero}>
          {heroImageUrl && (
            <Image
              source={{ uri: heroImageUrl }}
              style={styles.heroImage}
              resizeMode="cover"
            />
          )}
          <View style={styles.heroOverlay} />
          <View style={styles.heroContent}>
            <Text style={styles.heroGenre}>{currentMovie.genre || "Film"}</Text>
            <Text style={styles.heroTitle}>{currentMovie.title}</Text>
            <Text style={styles.heroDesc} numberOfLines={3}>
              {currentMovie.description}
            </Text>
            <View style={styles.heroButtons}>
              <TouchableOpacity
                style={styles.btnPrimary}
                onPress={async () => {
                  if (!isLoggedIn) {
                    if (Platform.OS === "web") {
                      if (
                        window.confirm(
                          "A jegyfoglaláshoz be kell jelentkezned! Átirányítsunk a bejelentkezés oldalra?",
                        )
                      ) {
                        router.push(
                          `/login?redirect=/movie/${currentMovie.movieId}`,
                        );
                      }
                    } else {
                      Alert.alert(
                        "Bejelentkezés szükséges",
                        "A jegyfoglaláshoz be kell jelentkezned!",
                        [
                          { text: "Mégsem", style: "cancel" },
                          {
                            text: "Bejelentkezés",
                            onPress: () =>
                              router.push(
                                `/login?redirect=/movie/${currentMovie.movieId}`,
                              ),
                          },
                        ],
                      );
                    }
                    return;
                  }
                  router.push(`/movie/${currentMovie.movieId}`);
                }}
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
                <View
                  style={[styles.dot, i === currentSlide && styles.dotActive]}
                />
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
            const imgUrl = addCacheBust(
              getImageUrl(item.img || item.Img),
              imgVersions[String(item.movieId || item.MovieId)],
            );
            return (
              <TouchableOpacity
                key={String(item.movieId)}
                style={styles.movieCard}
                onPress={() => router.push(`/movie/${item.movieId}`)}
              >
                {imgUrl ? (
                  <Image
                    source={{ uri: imgUrl }}
                    style={styles.moviePoster}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.noPoster}>
                    <Text style={styles.noPosterText}>Nincs kép</Text>
                  </View>
                )}
                <Text style={styles.movieCardTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.movieCardGenre}>{item.genre}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </ScrollView>
  );
}

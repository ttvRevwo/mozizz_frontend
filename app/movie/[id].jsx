import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import styles from "../../styles/movieStyles";

const CLOUDINARY_BASE = "https://res.cloudinary.com/dytjuv6qt/image/upload/";
const API_BASE = "http://192.168.137.1:5083/api";

const getImageUrl = (img) => {
  if (!img) return null;
  if (img.startsWith("http")) return img;
  return `${CLOUDINARY_BASE}${img}`;
};

const formatDate = (dateStr) => {
  if (!dateStr) return "Ismeretlen dátum";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "Érvénytelen dátum";
  return date.toLocaleDateString("hu-HU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const getYear = (dateStr) => {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return null;
  return date.getFullYear();
};

export default function MovieDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [movie, setMovie] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id || id === "undefined") {
      setError("Érvénytelen film azonosító.");
      setLoading(false);
      return;
    }

    fetch(`${API_BASE}/Movie/MovieById/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Film nem található.");
        return res.json();
      })
      .then((data) => {
        const movieData = data.data || data;
        setMovie(movieData);

        return fetch(`${API_BASE}/Showtime/GetByMovie/${id}`);
      })
      .then((res) => res.json())
      .then((data) => {
        const all = Array.isArray(data) ? data : data.data || [];
        const now = new Date();
        const future = all.filter((st) => {
          const d = st.showDate || st.date || "";
          const t = st.showTime1 || st.time || "00:00";
          const dt = new Date(
            `${String(d).split("T")[0]}T${String(t).slice(0, 5)}:00`,
          );
          return dt > now;
        });
        const sorted = future.sort((a, b) => {
          const da =
            (a.showDate || a.date || "") + (a.showTime1 || a.time || "");
          const db =
            (b.showDate || b.date || "") + (b.showTime1 || b.time || "");
          return da.localeCompare(db);
        });
        setShowtimes(sorted);
        setLoading(false);
      })
      .catch((err) => {
        setError("Nem sikerült betölteni az adatokat.");
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#E50914" />
        <Text style={styles.loadingText}>Betöltés...</Text>
      </View>
    );
  }

  if (error || !movie) {
    return (
      <View style={styles.centered}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>← Vissza</Text>
        </TouchableOpacity>
        <Text style={styles.errorText}>{error || "A film nem található."}</Text>
      </View>
    );
  }

  const title = movie.title || movie.Title;
  const description = movie.description || movie.Description;
  const genre = movie.genre || movie.Genre;
  const rating = movie.rating || movie.Rating;
  const duration = movie.duration || movie.Duration;
  const releaseDate =
    movie.release_date || movie.releaseDate || movie.ReleaseDate;
  const imgUrl = getImageUrl(movie.img || movie.Img || movie.imageUrl);
  const releaseYear = getYear(releaseDate);

  return (
    <View style={styles.container}>
      {imgUrl && (
        <>
          <Image
            source={{ uri: imgUrl }}
            style={styles.bgImage}
            resizeMode="cover"
          />
          <View style={styles.bgOverlay} />
        </>
      )}

      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backText}>← Vissza</Text>
      </TouchableOpacity>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          {imgUrl ? (
            <Image
              source={{ uri: imgUrl }}
              style={styles.poster}
              resizeMode="cover"
            />
          ) : (
            <View
              style={[
                styles.poster,
                { justifyContent: "center", alignItems: "center" },
              ]}
            >
              <Text style={{ color: "#888" }}>Nincs kép</Text>
            </View>
          )}

          <View style={styles.headerInfo}>
            <Text style={styles.title}>{title}</Text>
            <View style={styles.tags}>
              {rating ? (
                <View style={[styles.tag, styles.tagRating]}>
                  <Text style={styles.tagRatingText}>⭐ {rating}</Text>
                </View>
              ) : null}
              {genre ? (
                <View style={styles.tag}>
                  <Text style={styles.tagText}>{genre}</Text>
                </View>
              ) : null}
              {duration > 0 ? (
                <View style={styles.tag}>
                  <Text style={styles.tagText}>⏱ {duration} perc</Text>
                </View>
              ) : null}
              {releaseYear ? (
                <View style={styles.tag}>
                  <Text style={styles.tagText}>{releaseYear}</Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Leírás</Text>
          <Text style={styles.description}>
            {description || "Ehhez a filmhez még nincs leírás megadva."}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.showtimesTitle}>Válassz időpontot</Text>
          {showtimes.length === 0 ? (
            <View style={styles.noShowtime}>
              <Text style={styles.noShowtimeText}>
                Jelenleg nincs meghirdetett vetítés ehhez a filmhez.
              </Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {showtimes.map((st) => {
                const stId = st.showtimeId || st.ShowtimeId || st.id;
                const timeRaw = st.showTime1 || st.time || st.Time;
                const dateRaw = st.showDate || st.date || st.Date;
                const hallName = st.hallName || st.HallName;
                const formattedTime = timeRaw
                  ? String(timeRaw).substring(0, 5)
                  : "";

                return (
                  <TouchableOpacity
                    key={String(stId)}
                    style={styles.showtimeCard}
                    onPress={async () => {
                      const token = await AsyncStorage.getItem("token");
                      if (!token) {
                        Alert.alert(
                          "Bejelentkezés szükséges",
                          "A jegyfoglaláshoz be kell jelentkezned!",
                          [
                            { text: "Mégsem", style: "cancel" },
                            {
                              text: "Bejelentkezés",
                              onPress: () =>
                                router.push(`/login?redirect=/movie/${id}`),
                            },
                          ],
                        );
                        return;
                      }
                      router.push(`/booking/${stId}`);
                    }}
                  >
                    <Text style={styles.showtimeTime}>{formattedTime}</Text>
                    <Text style={styles.showtimeDate}>
                      {String(dateRaw).split("T")[0]}
                    </Text>
                    {hallName && (
                      <Text style={styles.showtimeHall}>{hallName}</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </View>

        <View style={[styles.section, styles.releaseRow]}>
          <Text style={styles.releaseText}>
            Megjelenés:{" "}
            <Text style={styles.releaseValue}>{formatDate(releaseDate)}</Text>
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

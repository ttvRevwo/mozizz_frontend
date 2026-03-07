import { useEffect, useState } from 'react';
import {
  View, Text, Image, TouchableOpacity, TextInput,
  ActivityIndicator, ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import styles from '../../styles/catalogStyles';

const CLOUDINARY_BASE = 'https://res.cloudinary.com/dytjuv6qt/image/upload/';
const API_BASE = 'http://192.168.137.1:5083/api';

export default function CatalogScreen() {
  const router = useRouter();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch(`${API_BASE}/Movie/GetMovies`)
      .then(res => res.json())
      .then(data => {
        setMovies(data.data || data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const getImageUrl = (img) => {
    if (!img) return null;
    if (img.startsWith('http')) return img;
    return `${CLOUDINARY_BASE}${img}`;
  };

  const filtered = movies.filter(m =>
    (m.title || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🎬 Filmkatalógus</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Film keresése..."
          placeholderTextColor="#666"
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#E50914" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.grid}>
          {filtered.map((movie) => {
            const imgUrl = getImageUrl(movie.img);
            return (
              <TouchableOpacity
                key={movie.movieId}
                style={styles.card}
                onPress={() => router.push(`/movie/${movie.movieId}`)}
              >
                {imgUrl ? (
                  <Image source={{ uri: imgUrl }} style={styles.poster} resizeMode="cover" />
                ) : (
                  <View style={styles.noPoster}>
                    <Text style={styles.noPosterText}>Nincs kép</Text>
                  </View>
                )}
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle} numberOfLines={1}>{movie.title}</Text>
                  <Text style={styles.cardGenre}>{movie.genre}</Text>
                  <Text style={styles.cardRating}>{movie.rating}</Text>
                </View>
                <View style={styles.detailsBtn}>
                  <Text style={styles.detailsBtnText}>Részletek →</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}
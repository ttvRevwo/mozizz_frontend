import { useEffect, useState } from 'react';
import {
  View, Text, Image, TouchableOpacity, TextInput,
  ActivityIndicator, StyleSheet, ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';

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
      {/* Fejléc */}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#141414' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: {
    paddingTop: 55,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#000',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  searchInput: {
    backgroundColor: '#1a1a1a',
    color: '#fff',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#333',
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    gap: 10,
  },
  card: {
    width: '47%',
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    overflow: 'hidden',
  },
  poster: { width: '100%', height: 200 },
  noPoster: {
    width: '100%', height: 200,
    backgroundColor: '#333',
    justifyContent: 'center', alignItems: 'center',
  },
  noPosterText: { color: '#888', fontSize: 12 },
  cardInfo: { padding: 10 },
  cardTitle: { color: '#fff', fontSize: 14, fontWeight: '600' },
  cardGenre: { color: '#888', fontSize: 12, marginTop: 3 },
  cardRating: {
    color: '#E50914', fontSize: 11,
    fontWeight: 'bold', marginTop: 3,
  },
  detailsBtn: {
    borderTopWidth: 1, borderTopColor: '#333',
    padding: 10, alignItems: 'center',
  },
  detailsBtnText: { color: '#E50914', fontSize: 13, fontWeight: '600' },
});
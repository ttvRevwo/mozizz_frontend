import { StyleSheet } from 'react-native';

export default StyleSheet.create({
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
  cardRating: { color: '#E50914', fontSize: 11, fontWeight: 'bold', marginTop: 3 },
  detailsBtn: {
    borderTopWidth: 1, borderTopColor: '#333',
    padding: 10, alignItems: 'center',
  },
  detailsBtnText: { color: '#E50914', fontSize: 13, fontWeight: '600' },
});

import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: { flex: 1, backgroundColor: '#141414' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#141414' },
  loadingText: { color: '#fff', marginTop: 10 },
  errorText: { color: '#ff6b6b', fontSize: 15, textAlign: 'center', padding: 20 },

  bgImage: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 340,
  },
  bgOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 340,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  fadeOverlay: {
    position: 'absolute', top: 240, left: 0, right: 0, height: 100,
    backgroundColor: 'transparent',
  },

  backBtn: { position: 'absolute', top: 52, left: 16, zIndex: 10 },
  backText: { color: '#fff', fontSize: 15 },

  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 40 },

  header: { paddingTop: 280, paddingHorizontal: 16, flexDirection: 'row', gap: 16 },
  poster: {
    width: 110, height: 165, borderRadius: 10,
    backgroundColor: '#333', marginTop: -60,
    shadowColor: '#000', shadowOpacity: 0.6, shadowRadius: 10,
  },
  headerInfo: { flex: 1, paddingTop: 20 },
  title: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 8 },

  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  tag: {
    backgroundColor: '#222', borderRadius: 6,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  tagText: { color: '#ccc', fontSize: 12 },
  tagRating: { backgroundColor: '#E50914' },
  tagRatingText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },

  section: { paddingHorizontal: 16, marginTop: 20 },
  sectionTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  description: { color: '#bbb', fontSize: 14, lineHeight: 22 },

  showtimesTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  showtimeCard: {
    backgroundColor: '#E50914',
    borderRadius: 10, padding: 14,
    marginRight: 10, alignItems: 'center', minWidth: 90,
  },
  showtimeTime: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  showtimeDate: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 3 },
  showtimeHall: {
    color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 6,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.2)',
    paddingTop: 6, textAlign: 'center',
  },
  noShowtime: {
    backgroundColor: '#1a1a1a', borderRadius: 10,
    padding: 16, borderWidth: 1, borderColor: '#333',
  },
  noShowtimeText: { color: '#888', fontSize: 14 },

  releaseRow: { marginTop: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#222' },
  releaseText: { color: '#888', fontSize: 13 },
  releaseValue: { color: '#ccc', fontWeight: '600' },
});
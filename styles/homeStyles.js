import { StyleSheet, Dimensions } from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default StyleSheet.create({
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

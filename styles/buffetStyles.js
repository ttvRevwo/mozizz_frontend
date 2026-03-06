import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: { flex: 1, backgroundColor: '#141414' },

  header: {
    paddingTop: 55,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#000',
  },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  headerSub: { color: '#888', fontSize: 13, marginTop: 4 },

  section: { marginTop: 24, paddingLeft: 16 },
  sectionTitle: {
    color: '#fff', fontSize: 18, fontWeight: 'bold',
    marginBottom: 14, paddingRight: 16,
  },

  menuCard: {
    width: 180,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
  },
  menuIcon: { fontSize: 36, marginBottom: 8 },
  menuName: { color: '#fff', fontSize: 15, fontWeight: '600' },
  menuDesc: { color: '#888', fontSize: 12, marginTop: 4, lineHeight: 17 },
  menuPrice: { color: '#E50914', fontSize: 16, fontWeight: 'bold', marginTop: 10 },

  snackGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingRight: 16,
    paddingBottom: 30,
  },
  snackCard: {
    width: '30%',
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  snackIcon: { fontSize: 30, marginBottom: 6 },
  snackName: { color: '#fff', fontSize: 12, textAlign: 'center' },
  snackPrice: { color: '#E50914', fontSize: 13, fontWeight: 'bold', marginTop: 4 },
});

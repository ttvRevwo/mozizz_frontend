import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: { flex: 1, backgroundColor: '#141414' },
  inner: { flexGrow: 1, padding: 24, paddingTop: 60 },

  backBtn: { marginBottom: 20 },
  backText: { color: '#888', fontSize: 15 },

  logo: { color: '#E50914', fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
  title: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { color: '#888', fontSize: 14, marginBottom: 24, lineHeight: 20 },

  form: { gap: 6 },
  label: { color: '#ccc', fontSize: 13, marginBottom: 4, marginTop: 8 },
  input: {
    backgroundColor: '#1a1a1a',
    color: '#fff',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#333',
  },
  inputValid: { borderColor: '#4ade80' },
  inputInvalid: { borderColor: '#E50914' },
  hint: { color: '#555', fontSize: 11, marginTop: 4 },

  phoneRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  countryCodeBox: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1, borderColor: '#333', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 12,
  },
  countryCodeText: { color: '#fff', fontSize: 15 },
  phoneInput: { flex: 1 },

  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
  checkbox: {
    width: 22, height: 22, borderRadius: 4,
    borderWidth: 2, borderColor: '#555',
    justifyContent: 'center', alignItems: 'center',
  },
  checkboxChecked: { backgroundColor: '#E50914', borderColor: '#E50914' },
  checkmark: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  checkLabel: { color: '#ccc', fontSize: 13, flex: 1 },

  message: { fontSize: 13, padding: 10, borderRadius: 8, textAlign: 'center', marginTop: 8 },
  error: { backgroundColor: '#3d0000', color: '#ff6b6b' },
  success: { backgroundColor: '#003d1a', color: '#6bff9e' },

  btn: {
    backgroundColor: '#E50914',
    borderRadius: 8, paddingVertical: 14,
    alignItems: 'center', marginTop: 16,
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  link: { color: '#888', fontSize: 14, textAlign: 'center', marginTop: 16 },
  linkBold: { color: '#E50914', fontWeight: 'bold' },

  successBox: { alignItems: 'center', paddingTop: 40, gap: 16 },
  successIcon: { fontSize: 64 },
  successTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  successText: { color: '#888', fontSize: 14, textAlign: 'center', lineHeight: 20 },
});

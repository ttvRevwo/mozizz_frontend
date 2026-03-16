import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: { flex: 1, backgroundColor: "#141414" },

  header: {
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: "#000",
  },
  headerTitle: { color: "#fff", fontSize: 22, fontWeight: "bold" },
  headerSub: { color: "#E0AA3E", fontSize: 13, marginTop: 4 },

  section: { marginTop: 20, paddingLeft: 16, paddingBottom: 10 },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 14,
  },

  menuCard: {
    width: 180,
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    marginRight: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  menuImg: { width: 180, height: 110 },
  menuImgPlaceholder: {
    width: "100%",
    height: 110,
    backgroundColor: "#222",
    alignItems: "center",
    justifyContent: "center",
  },
  menuImgPlaceholderText: { fontSize: 44 },
  menuCardBody: { padding: 10 },
  menuName: { color: "#fff", fontSize: 14, fontWeight: "700", marginBottom: 4 },
  menuDesc: { color: "#888", fontSize: 11, lineHeight: 15, marginBottom: 8 },
  menuPrice: { color: "#E0AA3E", fontSize: 15, fontWeight: "700" },

  snackGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    gap: 10,
  },
  snackCard: {
    width: "30%",
    backgroundColor: "#1a1a1a",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2a2a2a",
    overflow: "hidden",
  },
  snackImg: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "#333",
  },
  snackImgPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#222",
    marginBottom: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  snackImgPlaceholderText: { fontSize: 30 },
  snackName: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 4,
  },
  snackPrice: { color: "#E0AA3E", fontSize: 13, fontWeight: "700" },
});

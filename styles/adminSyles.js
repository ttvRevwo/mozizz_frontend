export default StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f0f0f" },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0f0f0f",
    padding: 32,
  },

  header: {
    paddingTop: 52,
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: "#000",
    borderBottomWidth: 1,
    borderBottomColor: "#1a1a1a",
  },
  headerTitle: { color: "#E0AA3E", fontSize: 20, fontWeight: "bold" },
  headerSub: { color: "#666", fontSize: 12, marginTop: 2 },

  tabs: {
    flexDirection: "row",
    backgroundColor: "#000",
    paddingHorizontal: 12,
    paddingBottom: 10,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  tabActive: { backgroundColor: "#E0AA3E", borderColor: "#E0AA3E" },
  tabText: { color: "#888", fontSize: 12, fontWeight: "600" },
  tabTextActive: { color: "#111" },
});

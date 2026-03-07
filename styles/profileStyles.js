import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: { flex: 1, backgroundColor: "#141414" },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#141414",
  },
  loadingText: { color: "#fff", marginTop: 10 },
  errorText: {
    color: "#ff6b6b",
    fontSize: 14,
    textAlign: "center",
    padding: 20,
  },

  header: {
    backgroundColor: "#000",
    paddingTop: 55,
    paddingBottom: 20,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#222",
    borderWidth: 2,
    borderColor: "#E50914",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  avatarText: { fontSize: 32 },
  headerName: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  headerEmail: { color: "#888", fontSize: 13, marginTop: 2 },

  statsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 30,
    marginTop: 16,
  },
  statItem: { alignItems: "center" },
  statNumber: { color: "#E50914", fontSize: 22, fontWeight: "bold" },
  statLabel: { color: "#888", fontSize: 12, marginTop: 2 },

  logoutBtn: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#E50914",
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  logoutText: { color: "#E50914", fontSize: 14, fontWeight: "600" },

  section: { padding: 16 },
  sectionTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 14,
  },

  emptyBox: { alignItems: "center", paddingTop: 40, gap: 12 },
  emptyIcon: { fontSize: 48 },
  emptyText: { color: "#888", fontSize: 15 },
  emptyBtn: {
    backgroundColor: "#E50914",
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 8,
  },
  emptyBtnText: { color: "#fff", fontWeight: "bold", fontSize: 14 },

  tabRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#1a1a1a",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#333",
  },
  tabBtnActive: {
    backgroundColor: "#E50914",
    borderColor: "#E50914",
  },
  tabBtnText: { color: "#888", fontWeight: "600", fontSize: 13 },
  tabBtnTextActive: { color: "#fff" },

  ticketCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#333",
  },
  ticketUsed: { opacity: 0.6 },
  ticketUsedStamp: {
    position: "absolute",
    top: 14,
    right: 14,
    zIndex: 10,
    backgroundColor: "#555",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  ticketUsedStampText: { color: "#fff", fontSize: 10, fontWeight: "bold" },

  ticketHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#2a2a2a",
  },
  ticketCinema: { color: "#E50914", fontWeight: "bold", fontSize: 13 },
  ticketBadgeValid: {
    backgroundColor: "#003d1a",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  ticketBadgeUsed: {
    backgroundColor: "#3d0000",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  ticketBadgeText: { fontSize: 11, fontWeight: "bold" },
  ticketBadgeTextValid: { color: "#6bff9e" },
  ticketBadgeTextUsed: { color: "#ff6b6b" },

  ticketBody: { padding: 14 },
  ticketTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },

  ticketMetaRow: { flexDirection: "row", gap: 20, marginBottom: 10 },
  ticketMetaItem: { gap: 2 },
  metaLabel: { color: "#888", fontSize: 11 },
  metaValue: { color: "#ccc", fontSize: 13, fontWeight: "600" },

  seatsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 10,
  },
  seatBadge: {
    backgroundColor: "#222",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  seatBadgeText: { color: "#fff", fontSize: 12 },

  qrToggleBtn: {
    borderTopWidth: 1,
    borderTopColor: "#2a2a2a",
    paddingVertical: 10,
    alignItems: "center",
  },
  qrToggleText: { color: "#E50914", fontSize: 13 },

  qrSection: { alignItems: "center", paddingVertical: 14, gap: 8 },
  qrImage: { width: 150, height: 150 },
  ticketCode: { color: "#888", fontSize: 11, fontFamily: "monospace" },
});

import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

const menus = [
  { id: 1, name: 'Családi Mix', price: 4500, icon: '👨‍👩‍👧‍👦', desc: '2 nagy popcorn + 2 nagy üdítő + Nachos' },
  { id: 2, name: 'Páros Ajánlat', price: 3200, icon: '👫', desc: '1 nagy popcorn + 2 közepes üdítő' },
  { id: 3, name: 'Gyerek Menü', price: 2100, icon: '🧒', desc: 'Kis popcorn + Üdítő + Ajándék figura' },
  { id: 4, name: 'Heti Ajánlat', price: 2800, icon: '⭐', desc: 'Különleges fűszerezésű popcorn menü' },
  { id: 5, name: 'Mozimaraton', price: 5500, icon: '🎬', desc: 'Korlátlan üdítő + XXL Popcorn' },
];

const snacks = [
  { id: 101, name: 'Vajas Popcorn', price: 1200, icon: '🍿' },
  { id: 102, name: 'Sajtos Nachos', price: 1400, icon: '🧀' },
  { id: 103, name: 'Coca Cola 0.5L', price: 650, icon: '🥤' },
  { id: 104, name: 'KitKat', price: 450, icon: '🍫' },
  { id: 105, name: 'Gumicukor', price: 890, icon: '🍬' },
  { id: 106, name: 'Ásványvíz', price: 450, icon: '💧' },
  { id: 107, name: 'Mogyoró', price: 550, icon: '🥜' },
];

export default function BuffetScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      <View style={styles.header}>
        <Text style={styles.headerTitle}>🍿 Büfé</Text>
        <Text style={styles.headerSub}>💳 Szép kártyát elfogadunk!</Text>
      </View>

      {/* MENÜK */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Kombók & Menük</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {menus.map(item => (
            <TouchableOpacity key={item.id} style={styles.menuCard}>
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={styles.menuName}>{item.name}</Text>
              <Text style={styles.menuDesc} numberOfLines={2}>{item.desc}</Text>
              <Text style={styles.menuPrice}>{item.price} Ft</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* SNACKEK */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Snackek & Üdítők</Text>
        <View style={styles.snackGrid}>
          {snacks.map(item => (
            <TouchableOpacity key={item.id} style={styles.snackCard}>
              <Text style={styles.snackIcon}>{item.icon}</Text>
              <Text style={styles.snackName}>{item.name}</Text>
              <Text style={styles.snackPrice}>{item.price} Ft</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
  menuPrice: {
    color: '#E50914', fontSize: 16,
    fontWeight: 'bold', marginTop: 10,
  },

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
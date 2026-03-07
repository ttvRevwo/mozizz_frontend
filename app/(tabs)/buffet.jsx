import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import styles from '../../styles/buffetStyles';

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
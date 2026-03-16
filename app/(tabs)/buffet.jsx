import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Image, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import styles from "../../styles/buffetStyles";

const API_BASE = "http://192.168.137.1:5083/api";
const CLOUDINARY_BASE = "https://res.cloudinary.com/dytjuv6qt/image/upload/";
const CAT_ICON = {
  menü: "🎁",
  popcorn: "🍿",
  ital: "🥤",
  édesség: "🍭",
  snack: "🧆",
};

const normalize = (item) => ({
  itemId: item.itemId ?? item.ItemId,
  name: item.name ?? item.Name,
  description: item.description ?? item.Description,
  price: item.price ?? item.Price,
  category: item.category ?? item.Category ?? "snack",
  img: item.img ?? item.Img ?? null,
});

const getImgUrl = (img) => {
  if (!img) return null;
  if (img.startsWith("http")) return img;
  return CLOUDINARY_BASE + img;
};

export default function BuffetScreen() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetch(`${API_BASE}/Buffet/Items`)
        .then((r) => r.json())
        .then((data) => {
          const normalized = (Array.isArray(data) ? data : []).map(normalize);
          setItems(normalized);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }, []),
  );

  const menus = items.filter((i) => i.category === "menü");
  const others = items.filter((i) => i.category !== "menü");

  const grouped = others.reduce((acc, item) => {
    const cat = item.category || "snack";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  if (loading)
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator
          color="#E50914"
          size="large"
          style={{ marginTop: 60 }}
        />
      </SafeAreaView>
    );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🍿 Büfé</Text>
          <Text style={styles.headerSub}>💳 Szép kártyát elfogadunk!</Text>
        </View>

        {menus.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Kombók & Menük</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {menus.map((item) => {
                const imgUrl = getImgUrl(item.img);
                return (
                  <View key={item.itemId} style={styles.menuCard}>
                    {imgUrl ? (
                      <Image
                        source={{ uri: imgUrl }}
                        style={[styles.menuImg, { width: 180, height: 110 }]}
                        resizeMode="cover"
                        onError={(e) =>
                          console.log("menuImg error:", e.nativeEvent.error)
                        }
                      />
                    ) : (
                      <View style={styles.menuImgPlaceholder}>
                        <Text style={styles.menuImgPlaceholderText}>🎁</Text>
                      </View>
                    )}
                    <View style={styles.menuCardBody}>
                      <Text style={styles.menuName}>{item.name}</Text>
                      {!!item.description && (
                        <Text style={styles.menuDesc} numberOfLines={2}>
                          {item.description}
                        </Text>
                      )}
                      <Text style={styles.menuPrice}>
                        {item.price.toLocaleString()} Ft
                      </Text>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        )}

        {Object.entries(grouped).map(([cat, catItems]) => (
          <View key={cat} style={styles.section}>
            <Text style={styles.sectionTitle}>
              {CAT_ICON[cat] || "•"}{" "}
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </Text>
            <View style={styles.snackGrid}>
              {catItems.map((item) => {
                const imgUrl = getImgUrl(item.img);
                return (
                  <View key={item.itemId} style={styles.snackCard}>
                    {imgUrl ? (
                      <Image
                        source={{ uri: imgUrl }}
                        style={[styles.snackImg, { width: 60, height: 60 }]}
                        resizeMode="cover"
                        onError={(e) =>
                          console.log("snackImg error:", e.nativeEvent.error)
                        }
                      />
                    ) : (
                      <View style={styles.snackImgPlaceholder}>
                        <Text style={styles.snackImgPlaceholderText}>
                          {CAT_ICON[cat] || "🍿"}
                        </Text>
                      </View>
                    )}
                    <Text style={styles.snackName} numberOfLines={2}>
                      {item.name}
                    </Text>
                    <Text style={styles.snackPrice}>
                      {item.price.toLocaleString()} Ft
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

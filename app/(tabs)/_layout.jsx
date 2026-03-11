import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Tabs } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { AppState, Platform } from "react-native";

async function getRole() {
  try {
    if (Platform.OS === "web") {
      return (
        sessionStorage.getItem("role") || (await AsyncStorage.getItem("role"))
      );
    }
    return await AsyncStorage.getItem("role");
  } catch {
    return null;
  }
}

export default function TabLayout() {
  const [isAdmin, setIsAdmin] = useState(false);

  const checkRole = useCallback(async () => {
    const role = await getRole();
    setIsAdmin(role === "Admin");
  }, []);

  useEffect(() => {
    checkRole();
  }, [checkRole]);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") checkRole();
    });
    return () => sub.remove();
  }, [checkRole]);

  useEffect(() => {
    const interval = setInterval(checkRole, 1000);
    return () => clearInterval(interval);
  }, [checkRole]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#000",
          borderTopColor: "#222",
        },
        tabBarActiveTintColor: "#E50914",
        tabBarInactiveTintColor: "#888",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="catalog"
        options={{
          title: "Filmek",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="film" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="buffet"
        options={{
          title: "Büfé",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="fast-food" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="validate"
        options={{
          title: "Érvényesítés",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="qr-code" size={size} color={color} />
          ),
          href: isAdmin ? undefined : null,
          tabBarItemStyle: isAdmin ? {} : { display: "none", width: 0 },
        }}
      />
      <Tabs.Screen
        name="admin"
        options={{
          title: "Admin",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
          href: isAdmin ? undefined : null,
          tabBarItemStyle: isAdmin ? {} : { display: "none", width: 0 },
        }}
      />
    </Tabs>
  );
}

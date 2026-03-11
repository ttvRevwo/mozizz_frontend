import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const KEY = (id) => `img_v_${id}`;

export async function bustImageCache(movieId) {
  const ts = String(Date.now());
  try {
    await AsyncStorage.setItem(KEY(movieId), ts);
    if (Platform.OS === "web") sessionStorage.setItem(KEY(movieId), ts);
  } catch {}
}

export async function getImageVersion(movieId) {
  try {
    if (Platform.OS === "web")
      return sessionStorage.getItem(KEY(movieId)) || null;
    return await AsyncStorage.getItem(KEY(movieId));
  } catch {
    return null;
  }
}

export async function getImageVersions(movieIds = []) {
  const result = {};
  await Promise.all(
    movieIds.map(async (id) => {
      const v = await getImageVersion(id);
      if (v) result[String(id)] = v;
    }),
  );
  return result;
}

export function addCacheBust(url, version) {
  if (!url || !version) return url;
  return url.includes("?") ? `${url}&_v=${version}` : `${url}?_v=${version}`;
}

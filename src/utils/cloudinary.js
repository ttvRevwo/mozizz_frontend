export const CLOUDINARY_BASE = "https://res.cloudinary.com/dytjuv6qt/image/upload/";

export const MANUAL_LOGO_SOURCE = 'logo_qysony.webp';

export function getCloudinaryImageUrl(imageName) {
  if (!imageName) return '';
  if (typeof imageName === 'string' && imageName.startsWith('http')) return imageName;
  const normalized = String(imageName).replace(/^\/+/, '');
  return `${CLOUDINARY_BASE}${normalized}`;
}

export function getManualLogoUrl() {
  const envSource = import.meta.env.VITE_LOGO_SOURCE;
  const source = envSource || MANUAL_LOGO_SOURCE;
  return getCloudinaryImageUrl(source);
}
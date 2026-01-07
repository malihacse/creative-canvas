// Configuration utilities for the frontend
export const getApiBaseUrl = () => {
  return import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
};

export const getBackendBaseUrl = () => {
  // Extract the base URL from API URL by removing '/api'
  const apiUrl = getApiBaseUrl();
  return apiUrl.replace('/api', '');
};

export const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) return imagePath;
  // Otherwise, prepend backend base URL
  return `${getBackendBaseUrl()}${imagePath}`;
};

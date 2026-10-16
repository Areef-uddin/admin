export const GOOGLE_MAPS_API_KEY =
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyD59viz5tbHPkJ_AmIeuOq283EZuEqcGww';

export const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? 'https://backend-gi0y.onrender.com/api/v1' : '/api/v1');

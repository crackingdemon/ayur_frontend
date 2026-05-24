import axios from 'axios';

// Create an Axios instance with base configuration
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('vaidyaos_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Add interceptors here if needed (e.g., for attaching auth tokens later)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // We don't want to console.error here because expected 404s (like fetching a non-existent prescription) 
    // will trigger Next.js's red Error Overlay in development.
    if (error.response?.status === 401) {
       if (typeof window !== 'undefined') {
         localStorage.removeItem('vaidyaos_token');
         localStorage.removeItem('vaidyaos_user');
         localStorage.removeItem('vaidyaos_org');
         window.location.href = '/login';
       }
    }
    return Promise.reject(error);
  }
);

import axios from 'axios';
import { toast } from 'sonner';

// Create an Axios instance with base configuration
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5001/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const facilityId = localStorage.getItem('vaidyaos_facility');
    if (facilityId) {
      config.headers['x-facility-id'] = facilityId;
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
         localStorage.removeItem('vaidyaos_user');
         localStorage.removeItem('vaidyaos_org');
         window.location.href = '/login';
       }
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    } else if (error.response?.data?.error) {
      // toast.error(error.response.data.error); // Optional: global toast for 400s
    } else if (error.message === 'Network Error') {
      toast.error('Network error. Please check your connection.');
    }
    return Promise.reject(error);
  }
);

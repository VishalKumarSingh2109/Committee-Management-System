import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Attach the JWT (if present) to every outgoing request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cms_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let lastNetworkErrorToast = 0;

// On a 401 (expired/invalid token), clear stored auth and bounce to login.
// On a network failure (backend unreachable), surface it clearly instead
// of leaving the user staring at a page that silently did nothing.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      // Debounce so a burst of parallel failed requests doesn't spam toasts.
      const now = Date.now();
      if (now - lastNetworkErrorToast > 4000) {
        toast.error('Could not reach the server. Check your connection or that the server is running.');
        lastNetworkErrorToast = now;
      }
      return Promise.reject(error);
    }

    if (error.response.status === 401) {
      localStorage.removeItem('cms_token');
      localStorage.removeItem('cms_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

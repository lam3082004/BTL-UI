import axios from 'axios';

const inferApiBaseUrl = () => {
  if (typeof window === 'undefined') {
    return 'http://localhost:3001';
  }

  // When testing on a phone via LAN (e.g. http://192.168.x.x:5173),
  // the backend is typically on the same host at :3001.
  return `${window.location.protocol}//${window.location.hostname}:3001`;
};

const envBaseUrl = import.meta.env.VITE_API_BASE_URL;
const shouldIgnoreLocalhostEnv =
  typeof window !== 'undefined' &&
  window.location.hostname !== 'localhost' &&
  window.location.hostname !== '127.0.0.1' &&
  typeof envBaseUrl === 'string' &&
  /\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(envBaseUrl.trim());

const baseURL = !envBaseUrl || shouldIgnoreLocalhostEnv ? inferApiBaseUrl() : envBaseUrl;

const client = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add JWT token to all requests if available
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwtToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default client;

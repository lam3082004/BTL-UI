import axios from 'axios';

const inferApiBaseUrl = (): string => {
  if (typeof window === 'undefined') return 'http://localhost:3001';
  const { protocol, hostname } = window.location;
  // LAN testing on a phone: backend is on same host at :3001
  if (hostname === 'localhost' || hostname === '127.0.0.1' || /^192\.168\./.test(hostname)) {
    return `${protocol}//${hostname}:3001`;
  }
  // Production / staging on a real domain: must use VITE_API_BASE_URL
  return 'http://localhost:3001';
};

const envBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;
const isEnvUrlLocal =
  typeof envBaseUrl === 'string' &&
  /\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(envBaseUrl.trim());

// On a real (non-localhost) domain, a localhost env URL is useless — fall back to infer
const baseURL =
  envBaseUrl && !isEnvUrlLocal ? envBaseUrl.trim().replace(/\/$/, '') : inferApiBaseUrl();

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

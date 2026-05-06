import axios from 'axios';

const sanitizeApiBaseUrl = (rawValue: string | undefined): string | undefined => {
  if (!rawValue) return undefined;
  const value = rawValue.trim();

  // Handle accidental concatenation like "https://a.comhttps://a.com"
  const match = value.match(/https?:\/\/[a-zA-Z0-9.-]+(?::\d+)?/);
  const candidate = match ? match[0] : value;

  try {
    const parsed = new URL(candidate);
    return parsed.origin;
  } catch {
    return undefined;
  }
};

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

const envBaseUrl = sanitizeApiBaseUrl(import.meta.env.VITE_API_BASE_URL as string | undefined);
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

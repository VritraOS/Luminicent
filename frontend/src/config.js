// Centralized configuration for Backend API & Socket.IO URL
// Works seamlessly in both local development and production environments.

export const getBackendUrl = () => {
  if (import.meta.env.VITE_BACKEND_URL) {
    return import.meta.env.VITE_BACKEND_URL;
  }
  // If running in production mode or served via reverse proxy (e.g. Docker Nginx on port 80/443)
  if (import.meta.env.PROD && typeof window !== 'undefined' && window.location.port !== '5173') {
    return window.location.origin;
  }
  // Default for local development
  return 'http://localhost:5000';
};

export const BACKEND_URL = getBackendUrl();

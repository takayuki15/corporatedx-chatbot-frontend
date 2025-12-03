// Application Constants
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  SETTINGS: '/settings',
} as const;

export const THEME_COLORS = {
  PRIMARY: '#1976d2',
  SECONDARY: '#dc004e',
  SUCCESS: '#2e7d32',
  ERROR: '#d32f2f',
  WARNING: '#ed6c02',
} as const;

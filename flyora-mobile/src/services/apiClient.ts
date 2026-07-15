import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

import Constants from 'expo-constants';

// Dynamically determine the local machine's IP address from Expo's manifest
// This ensures that physical devices on the same Wi-Fi can reach the local backend
const getDevServerIP = () => {
  if (process.env.NODE_ENV !== 'production' && Constants.expoConfig?.hostUri) {
    const host = Constants.expoConfig.hostUri.split(':')[0];
    if (host) {
      return `http://${host}:5000`;
    }
  }
  return 'https://flyorago-backend-1.onrender.com'; // Production live URL fallback
};

export const LOCAL_API_URL = getDevServerIP();

let currentBaseUrl = LOCAL_API_URL;

// Simple configuration to set base URL dynamically (e.g. from a settings page in the app)
export const setApiBaseUrl = async (url: string) => {
  const formattedUrl = url.trim();
  currentBaseUrl = formattedUrl;
  apiClient.defaults.baseURL = formattedUrl;
  try {
    await SecureStore.setItemAsync('flyora_api_url', formattedUrl);
  } catch (e) {
    console.warn('Failed to save API URL to SecureStore', e);
  }
};

export const getApiBaseUrl = () => {
  return currentBaseUrl;
};

export const apiClient = axios.create({
  baseURL: currentBaseUrl,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Load saved API URL on startup if it exists
try {
  SecureStore.getItemAsync('flyora_api_url').then((savedUrl) => {
    if (savedUrl) {
      currentBaseUrl = savedUrl;
      apiClient.defaults.baseURL = savedUrl;
    }
  }).catch((e) => {
    console.warn('Failed to load saved API URL on startup', e);
  });
} catch (e) {
  console.warn('Failed to load saved API URL on startup', e);
}

// Request Interceptor: Attach admin token if it exists
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const savedUrl = await SecureStore.getItemAsync('flyora_api_url');
      if (savedUrl) {
        config.baseURL = savedUrl;
      }

      const adminToken = await SecureStore.getItemAsync('flyora_admin_token');
      if (adminToken) {
        config.headers['Authorization'] = `Bearer ${adminToken}`;
      }
      
      const userId = await SecureStore.getItemAsync('flyora_user_id');
      if (userId) {
        config.headers['X-User-Id'] = userId;
      }
    } catch (e) {
      console.warn('Could not retrieve tokens/URL for request interceptor', e);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Global error handler
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if network error
    if (!error.response) {
      console.error('Network Error: Please make sure the backend is running.', error);
      return Promise.reject(new Error('Failed to connect to the server. Please verify if the API is running or try again.'));
    }
    
    // Auto logout if unauthorized (e.g. 401)
    if (error.response.status === 401) {
      // Handle session expiration here if needed
      console.warn('Session expired (401)');
    }
    
    return Promise.reject(error.response.data || error);
  }
);

import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { apiClient } from '../services/apiClient';

interface AuthState {
  isAuthenticated: boolean;
  isAdminAuthenticated: boolean;
  userId: string | null;
  userName: string | null;
  userEmail: string | null;
  userRole: string | null;
  profileImageUrl: string | null;
  adminToken: string | null;
  adminUsername: string | null;
  isLoading: boolean;
  hasSeenOnboarding: boolean;
  
  initialize: () => Promise<void>;
  login: (userId: string, userName: string, userEmail: string, userRole: string, profileImageUrl?: string | null) => Promise<void>;
  updateProfileImage: (url: string | null) => Promise<void>;
  adminLogin: (token: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
  adminLogout: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isAdminAuthenticated: false,
  userId: null,
  userName: null,
  userEmail: null,
  userRole: null,
  profileImageUrl: null,
  adminToken: null,
  adminUsername: null,
  isLoading: true,
  hasSeenOnboarding: false,

  initialize: async () => {
    try {
      const userId = await SecureStore.getItemAsync('flyora_user_id');
      const userName = await SecureStore.getItemAsync('flyora_user_name');
      const userEmail = await SecureStore.getItemAsync('flyora_user_email');
      const userRole = await SecureStore.getItemAsync('flyora_user_role');
      const adminToken = await SecureStore.getItemAsync('flyora_admin_token');
      const adminUsername = await SecureStore.getItemAsync('flyora_admin_username');
      const onboardingCompleted = await SecureStore.getItemAsync('flyora_has_seen_onboarding');

      // Fetch profile image from backend asynchronously if logged in to avoid blocking splash screen
      let profileImageUrl = null;

      set({
        userId,
        userName,
        userEmail,
        userRole,
        profileImageUrl,
        isAuthenticated: !!userId,
        adminToken,
        adminUsername,
        isAdminAuthenticated: !!adminToken,
        hasSeenOnboarding: onboardingCompleted === 'true',
        isLoading: false,
      });

      // Lazy-load profile details in the background if we have a session
      if (userId) {
        apiClient.get(`/api/dashboard/profile/${userId}`).then((res) => {
          if (res.data && res.data.success && res.data.data) {
            set({ profileImageUrl: res.data.data.profileImageUrl });
          }
        }).catch((e) => {
          console.warn('Failed to lazy-load profile details on initialization:', e);
        });
      }
    } catch (error) {
      console.error('Failed to initialize auth store:', error);
      set({ isLoading: false });
    }
  },

  login: async (userId, userName, userEmail, userRole, profileImageUrl) => {
    try {
      await SecureStore.setItemAsync('flyora_user_id', userId);
      await SecureStore.setItemAsync('flyora_user_name', userName);
      await SecureStore.setItemAsync('flyora_user_email', userEmail);
      await SecureStore.setItemAsync('flyora_user_role', userRole);

      set({
        userId,
        userName,
        userEmail,
        userRole,
        profileImageUrl: profileImageUrl || null,
        isAuthenticated: true,
      });
    } catch (error) {
      console.error('Failed to store user auth details:', error);
    }
  },

  updateProfileImage: async (url) => {
    try {
      set({ profileImageUrl: url });
    } catch (error) {
      console.error('Failed to update profile image in store:', error);
    }
  },

  adminLogin: async (token, username) => {
    try {
      await SecureStore.setItemAsync('flyora_admin_token', token);
      await SecureStore.setItemAsync('flyora_admin_username', username);

      set({
        adminToken: token,
        adminUsername: username,
        isAdminAuthenticated: true,
      });
    } catch (error) {
      console.error('Failed to store admin auth details:', error);
    }
  },

  logout: async () => {
    try {
      await SecureStore.deleteItemAsync('flyora_user_id');
      await SecureStore.deleteItemAsync('flyora_user_name');
      await SecureStore.deleteItemAsync('flyora_user_email');
      await SecureStore.deleteItemAsync('flyora_user_role');

      set({
        userId: null,
        userName: null,
        userEmail: null,
        userRole: null,
        profileImageUrl: null,
        isAuthenticated: false,
      });
    } catch (error) {
      console.error('Failed to clear user auth details:', error);
    }
  },

  adminLogout: async () => {
    try {
      await SecureStore.deleteItemAsync('flyora_admin_token');
      await SecureStore.deleteItemAsync('flyora_admin_username');

      set({
        adminToken: null,
        adminUsername: null,
        isAdminAuthenticated: false,
      });
    } catch (error) {
      console.error('Failed to clear admin auth details:', error);
    }
  },

  completeOnboarding: async () => {
    try {
      await SecureStore.setItemAsync('flyora_has_seen_onboarding', 'true');
      set({ hasSeenOnboarding: true });
    } catch (error) {
      console.error('Failed to store onboarding status:', error);
    }
  },
}));

interface ThemeState {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: 'system',
  setTheme: (theme) => set({ theme }),
}));

interface ToastState {
  visible: boolean;
  message: string;
  type: 'success' | 'error' | 'info';
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  hideToast: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  visible: false,
  message: '',
  type: 'info',
  showToast: (message, type = 'info') => {
    set({ visible: true, message, type });
    // Auto hide after 3.5s
    setTimeout(() => {
      set({ visible: false });
    }, 3500);
  },
  hideToast: () => set({ visible: false }),
}));

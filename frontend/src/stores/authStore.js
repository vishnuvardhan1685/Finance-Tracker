import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

// Backend default port is 5001 (see root `.env` PORT)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Configure axios to send cookies
axios.defaults.withCredentials = true;

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isLoading: true,
      error: null,

      // Check if user is authenticated
      checkAuth: async () => {
        try {
          set({ isLoading: true, error: null });
          const response = await axios.get(`${API_URL}/user/profile`);
          set({ user: response.data.user, isLoading: false });
          return { success: true };
        } catch {
          set({ user: null, isLoading: false });
          return { success: false };
        }
      },

      // Signup
      signup: async (name, email, password) => {
        try {
          set({ isLoading: true, error: null });
          const response = await axios.post(`${API_URL}/auth/signup`, {
            name,
            email,
            password,
          });
          set({ user: response.data.user, isLoading: false });
          return { success: true };
        } catch (error) {
          const message = error.response?.data?.message || 'Signup failed';
          set({ error: message, isLoading: false });
          return { success: false, message };
        }
      },

      // Login
      login: async (email, password) => {
        try {
          set({ isLoading: true, error: null });
          const response = await axios.post(`${API_URL}/auth/login`, {
            email,
            password,
          });
          set({ user: response.data.user, isLoading: false });
          return { success: true };
        } catch (error) {
          const status = error.response?.status;
          const message = status === 401
            ? 'Invalid email or password'
            : (error.response?.data?.message || 'Login failed');
          set({ error: message, isLoading: false });
          return { success: false, message };
        }
      },

      // Logout
      logout: async () => {
        try {
          await axios.post(`${API_URL}/auth/logout`);
          set({ user: null, error: null });
          return { success: true };
        } catch {
          // Clear user anyway on logout
          set({ user: null, error: null });
          return { success: true };
        }
      },

      // Clear error
      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
);

export default useAuthStore;

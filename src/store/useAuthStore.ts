import { create } from "zustand";

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  role: "user" | "admin";
  avatar: string;
  phone?: string;
  address?: string;
  city?: string;
  defaultShippingAddress?: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
  } | null;
  gender?: string;
  birthDate?: string;
  level?: number;
  xp?: number;
  walletBalance?: number;
  favoriteCategories?: string[];
}

interface AuthState {
  user: UserProfile | null;
  isLoading: boolean;
  checkAuth: () => Promise<void>;
  setUser: (user: UserProfile | null) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  checkAuth: async () => {
    try {
      set({ isLoading: true });
      const res = await fetch("/api/auth/me");
      const json = await res.json();
      if (json.success && json.data.user) {
        set({ user: json.data.user, isLoading: false });
      } else {
        set({ user: null, isLoading: false });
      }
    } catch {
      set({ user: null, isLoading: false });
    }
  },
  setUser: (user) => set({ user }),
  logout: async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      set({ user: null });
      window.location.href = "/";
    }
  },
}));

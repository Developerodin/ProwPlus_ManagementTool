'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from './api';

export type Role = 'admin' | 'team' | 'client';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
  designation?: string;
  company?: string;
  phone?: string;
  avatar?: string;
  isActive: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  setSession: (user: User, token: string) => void;
  clear: () => void;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  refresh: () => Promise<User | null>;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      setSession: (user, token) => {
        if (typeof window !== 'undefined') localStorage.setItem('token', token);
        set({ user, token });
      },
      clear: () => {
        if (typeof window !== 'undefined') localStorage.removeItem('token');
        set({ user: null, token: null });
      },
      login: async (email, password) => {
        const { user, token } = await api.post<{ user: User; token: string }>('/auth/login', {
          email,
          password,
        });
        get().setSession(user, token);
        return user;
      },
      logout: async () => {
        try { await api.post('/auth/logout'); } catch {}
        get().clear();
      },
      refresh: async () => {
        try {
          const { user } = await api.get<{ user: User }>('/auth/me');
          set({ user });
          return user;
        } catch {
          get().clear();
          return null;
        }
      },
    }),
    { name: 'prowplus-auth', partialize: (s) => ({ user: s.user, token: s.token }) }
  )
);

export const dashboardPathFor = (role: Role) => {
  if (role === 'admin') return '/admin/dashboard';
  if (role === 'team') return '/team/dashboard';
  return '/client/dashboard';
};

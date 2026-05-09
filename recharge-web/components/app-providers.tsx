'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { authService } from '@/services/auth';
import { tokenStore } from '@/lib/storage';
import type { AuthUser } from '@/types/api';

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AppProviders({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  const refreshUser = useCallback(async () => {
    if (!tokenStore.refresh) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const data = await authService.me();
      setUser(data.user);
      tokenStore.saveUser(data.user);
    } catch {
      tokenStore.clear();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const cached = tokenStore.readUser<AuthUser>();
    if (cached) setUser(cached);
    void refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    if (loading) return;
    const isPublic =
      pathname === '/' ||
      pathname === '/login' ||
      pathname === '/about' ||
      pathname === '/contact' ||
      pathname === '/support' ||
      pathname === '/privacy-policy' ||
      pathname === '/terms' ||
      pathname === '/refund-policy' ||
      pathname.startsWith('/services') ||
      pathname.startsWith('/policies');
    if (!user && !isPublic) router.replace('/login');
    if (user && pathname === '/login') router.replace('/recharge');
  }, [loading, pathname, router, user]);

  const signOut = useCallback(async () => {
    await authService.logout();
    setUser(null);
    router.replace('/login');
  }, [router]);

  const value = useMemo(
    () => ({ user, loading, refreshUser, signOut }),
    [user, loading, refreshUser, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AppProviders');
  return ctx;
}

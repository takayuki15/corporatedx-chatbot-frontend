'use client';

import type { User } from '@/lib/api';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

interface UserContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: React.ReactNode;
}

/**
 * ユーザー情報を管理するProvider
 * ALBから付与されるx-amzn-oidc-accesstokenヘッダーを使用して
 * バックエンドAPIからユーザー情報を取得
 */
export function UserProvider({ children }: UserProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // /chatbot/api/me/ エンドポイントを呼び出し
      // このエンドポイントがALBヘッダーから情報を取得する
      const response = await fetch('/chatbot/api/me/');

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch user');
      }

      const userData = (await response.json()) as User;
      setUser(userData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error fetching user:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const value: UserContextType = {
    user,
    loading,
    error,
    refetch: fetchUser,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

/**
 * ユーザー情報を取得するカスタムフック
 */
export function useUserContext(): UserContextType {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserContext must be used within UserProvider');
  }
  return context;
}

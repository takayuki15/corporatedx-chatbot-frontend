'use client';

import type { EmployeeResponse, User } from '@/lib/api';
import type { EmployeeInfo } from '@/lib/storage';
import {
  deleteEmployeeInfo,
  loadEmployeeInfo,
  saveEmployeeInfo,
} from '@/lib/storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

interface UserContextType {
  user: User | null;
  employeeInfo: EmployeeInfo | null;
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
 * バックエンドAPIからユーザー情報を取得し、
 * 初回アクセス時に従業員情報（company_code, office_code）も取得
 */
export function UserProvider({ children }: UserProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [employeeInfo, setEmployeeInfo] = useState<EmployeeInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // localStorageから既存のemployee情報を読み込み
      const cachedEmployeeInfo = loadEmployeeInfo();
      if (cachedEmployeeInfo) {
        setEmployeeInfo(cachedEmployeeInfo);
      }

      // /chatbot/api/me/ エンドポイントを呼び出し
      // このエンドポイントがALBヘッダーから情報を取得する
      const meResponse = await fetch('/chatbot/api/me/');

      if (!meResponse.ok) {
        const errorData = await meResponse.json();
        throw new Error(errorData.error || 'Failed to fetch user');
      }

      const userData = (await meResponse.json()) as User;
      setUser(userData);

      // employee情報がキャッシュされていない場合、APIから取得
      if (!cachedEmployeeInfo && userData.unique_name) {
        try {
          const employeeResponse = await fetch(
            `/chatbot/api/employees?MIAMID=${encodeURIComponent(userData.unique_name)}`
          );

          if (employeeResponse.ok) {
            const employeeData =
              (await employeeResponse.json()) as EmployeeResponse;

            if (
              employeeData.employee?.company_code &&
              employeeData.employee?.office_code
            ) {
              const newEmployeeInfo: EmployeeInfo = {
                company_code: employeeData.employee.company_code,
                office_code: employeeData.employee.office_code,
              };

              // localStorageに保存
              saveEmployeeInfo(newEmployeeInfo);
              setEmployeeInfo(newEmployeeInfo);
            }
          }
        } catch (employeeErr) {
          console.error('Error fetching employee info:', employeeErr);
          // employee情報の取得失敗はuser情報取得には影響させない
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error fetching user:', err);
      // エラー時はキャッシュをクリア
      deleteEmployeeInfo();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const value: UserContextType = {
    user,
    employeeInfo,
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

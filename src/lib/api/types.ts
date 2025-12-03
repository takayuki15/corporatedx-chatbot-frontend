/**
 * API Response Types
 * バックエンドAPIのレスポンス型定義
 */

/**
 * 共通APIレスポンス
 */
export interface ApiResponse<T> {
  statusCode: number;
  body: T;
}

/**
 * エラーレスポンス
 * バックエンドAPIから返されるエラーの形式
 */
export interface ErrorResponse {
  error: string;
}

/**
 * User型
 * ユーザーの詳細情報
 */
export interface User {
  name: string;
  unique_name: string;
}

/**
 * Employee型
 * 従業員の詳細情報
 */
export interface Employee {
  name?: string;
  company?: string;
  department?: string;
  displayName?: string;
  lastLogonTimestamp?: string;
  mail?: string;
  office?: string;
  [key: string]: unknown;
}

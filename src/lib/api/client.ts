/**
 * Backend API Client
 * PythonバックエンドAPIとの通信を管理するクライアント
 */

import type { ErrorResponse } from './types';

export interface ApiClientConfig {
  baseUrl: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export class ApiClient {
  private baseUrl: string;
  private timeout: number;
  private defaultHeaders: Record<string, string>;

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl;
    this.timeout = config.timeout || 30000;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...config.headers,
    };
  }

  /**
   * GETリクエスト
   */
  async get<T>(
    endpoint: string,
    params?: Record<string, string | number>,
    headers?: Record<string, string>
  ): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    return this.request<T>(url.toString(), {
      method: 'GET',
      headers,
    });
  }

  /**
   * POSTリクエスト
   */
  async post<T>(
    endpoint: string,
    data?: unknown,
    headers?: Record<string, string>
  ): Promise<T> {
    return this.request<T>(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      headers,
    });
  }

  /**
   * PUTリクエスト
   */
  async put<T>(
    endpoint: string,
    data?: unknown,
    headers?: Record<string, string>
  ): Promise<T> {
    return this.request<T>(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      headers,
    });
  }

  /**
   * DELETEリクエスト
   */
  async delete<T>(
    endpoint: string,
    headers?: Record<string, string>
  ): Promise<T> {
    return this.request<T>(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers,
    });
  }

  /**
   * 共通リクエストハンドラー
   */
  private async request<T>(url: string, options: RequestInit): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.defaultHeaders,
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorResponse: ErrorResponse = {
          error: errorData.error || `HTTP Error: ${response.status}`,
        };
        throw errorResponse;
      }

      if (response.status === 204) {
        return null as T;
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);

      if (error && typeof error === 'object' && 'error' in error) {
        throw error as ErrorResponse;
      }

      const errorResponse: ErrorResponse = {
        error:
          (error as Error).name === 'AbortError'
            ? 'Request timeout'
            : error instanceof Error
              ? error.message
              : 'Unknown error occurred',
      };
      throw errorResponse;
    }
  }
}

/**
 * デフォルトのAPIクライアントインスタンス
 */
export const apiClient = new ApiClient({
  baseUrl: process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8000',
  timeout: 30000,
  headers: process.env.NEXT_PUBLIC_API_GATEWAY_ID
    ? { 'x-apigw-api-id': process.env.NEXT_PUBLIC_API_GATEWAY_ID }
    : undefined,
});

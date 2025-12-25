import type { RagResponse } from './api';

/**
 * localStorage でチャット履歴を管理するためのユーティリティ
 */

const STORAGE_KEY_PREFIX = 'message_';

/**
 * セッションIDからlocalStorageのキー名を生成
 */
function getStorageKey(sessionId: string): string {
  return `${STORAGE_KEY_PREFIX}${sessionId}`;
}

/**
 * チャット履歴を保存
 */
export function saveChatHistory(
  sessionId: string,
  messages: RagResponse[],
  status?: 'open' | 'closed'
): void {
  try {
    const key = getStorageKey(sessionId);
    const dataToSave = {
      messages,
      status: status || 'open',
    };
    localStorage.setItem(key, JSON.stringify(dataToSave));
  } catch (error) {
    console.error('Failed to save chat history to localStorage:', error);
  }
}

/**
 * チャット履歴を読み込み
 */
export function loadChatHistory(sessionId: string): {
  messages: RagResponse[];
  status: 'open' | 'closed';
} {
  try {
    const key = getStorageKey(sessionId);
    const data = localStorage.getItem(key);
    if (!data) {
      return { messages: [], status: 'open' };
    }
    const parsed = JSON.parse(data);
    // 後方互換性: 配列形式の場合は古いフォーマット
    if (Array.isArray(parsed)) {
      return { messages: parsed as RagResponse[], status: 'open' };
    }
    return parsed as { messages: RagResponse[]; status: 'open' | 'closed' };
  } catch (error) {
    console.error('Failed to load chat history from localStorage:', error);
    return { messages: [], status: 'open' };
  }
}

/**
 * チャット履歴を削除
 */
export function deleteChatHistory(sessionId: string): void {
  try {
    const key = getStorageKey(sessionId);
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to delete chat history from localStorage:', error);
  }
}

/**
 * すべてのチャット履歴のセッションIDリストを取得
 */
export function getAllSessionIds(): string[] {
  try {
    const sessionIds: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(STORAGE_KEY_PREFIX)) {
        const sessionId = key.substring(STORAGE_KEY_PREFIX.length);
        sessionIds.push(sessionId);
      }
    }
    return sessionIds;
  } catch (error) {
    console.error('Failed to get all session IDs from localStorage:', error);
    return [];
  }
}

/**
 * セッションの最終更新時刻を取得（最後のメッセージのタイムスタンプ）
 */
export function getSessionLastUpdate(sessionId: string): Date | null {
  try {
    const messages = loadChatHistory(sessionId);
    if (messages.length === 0) {
      return null;
    }
    // TODO: メッセージにタイムスタンプが追加されたら、それを使用
    // 現在は取得時刻を返す
    return new Date();
  } catch (error) {
    console.error('Failed to get session last update:', error);
    return null;
  }
}

/**
 * Employee情報（company, office）の保存・取得
 */

const EMPLOYEE_INFO_KEY = 'employee_info';

export interface EmployeeInfo {
  company_code: string;
  office_code: string;
}

/**
 * Employee情報を保存
 */
export function saveEmployeeInfo(info: EmployeeInfo): void {
  try {
    localStorage.setItem(EMPLOYEE_INFO_KEY, JSON.stringify(info));
  } catch (error) {
    console.error('Failed to save employee info to localStorage:', error);
  }
}

/**
 * Employee情報を読み込み
 */
export function loadEmployeeInfo(): EmployeeInfo | null {
  try {
    const data = localStorage.getItem(EMPLOYEE_INFO_KEY);
    if (!data) {
      return null;
    }
    return JSON.parse(data) as EmployeeInfo;
  } catch (error) {
    console.error('Failed to load employee info from localStorage:', error);
    return null;
  }
}

/**
 * Employee情報を削除
 */
export function deleteEmployeeInfo(): void {
  try {
    localStorage.removeItem(EMPLOYEE_INFO_KEY);
  } catch (error) {
    console.error('Failed to delete employee info from localStorage:', error);
  }
}

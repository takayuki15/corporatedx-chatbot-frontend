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
export function saveChatHistory(sessionId: string, messages: RagResponse[]): void {
  try {
    const key = getStorageKey(sessionId);
    localStorage.setItem(key, JSON.stringify(messages));
  } catch (error) {
    console.error('Failed to save chat history to localStorage:', error);
  }
}

/**
 * チャット履歴を読み込み
 */
export function loadChatHistory(sessionId: string): RagResponse[] {
  try {
    const key = getStorageKey(sessionId);
    const data = localStorage.getItem(key);
    if (!data) {
      return [];
    }
    return JSON.parse(data) as RagResponse[];
  } catch (error) {
    console.error('Failed to load chat history from localStorage:', error);
    return [];
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

import type { RagRequest, RagResponse } from '@/lib/api';
import {
  deleteChatHistory,
  loadChatHistory,
  saveChatHistory,
} from '@/lib/storage';
import { useCallback, useState } from 'react';

/**
 * RAGチャットの状態
 */
export interface RagChatState {
  messages: RagResponse[];
  loading: boolean;
  error: string | null;
  sessionId: string | null;
  lastUserMessage: string | null;
  status: 'open' | 'closed';
}

/**
 * RAGチャットAPI用のカスタムフック
 */
export function useRagChat() {
  const [state, setState] = useState<RagChatState>({
    messages: [],
    loading: false,
    error: null,
    sessionId: null,
    lastUserMessage: null,
    status: 'open',
  });

  /**
   * RAG APIにメッセージを送信
   */
  const sendMessage = useCallback(
    async (query: string, options?: Partial<RagRequest>) => {
      setState(prev => ({
        ...prev,
        loading: true,
        error: null,
        lastUserMessage: query,
      }));

      try {
        // 必須パラメータのチェック
        if (!options?.company || !options?.office || !options?.miam_id) {
          throw new Error('company, office, and miam_id are required');
        }

        const requestBody: RagRequest = {
          query,
          company: options.company,
          office: options.office,
          miam_id: options.miam_id,
          session_id: state.sessionId || undefined,
          language: options?.language || 'ja',
          ...options,
        };

        const response = await fetch('/chatbot/api/answer/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to send message');
        }

        const data: RagResponse = await response.json();

        // フロントエンド側でユーザーの質問文とタイムスタンプを追加
        const dataWithUserQuery = {
          ...data,
          userQuery: query,
          timestamp: new Date().toISOString(),
        };

        const updatedMessages = [...state.messages, dataWithUserQuery];

        setState(prev => ({
          messages: updatedMessages,
          loading: false,
          error: null,
          sessionId: data.session_id,
          lastUserMessage: null,
          status: prev.status,
        }));

        // localStorageに保存
        saveChatHistory(data.session_id, updatedMessages, state.status);

        return data;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error occurred';

        setState(prev => ({
          ...prev,
          loading: false,
          error: errorMessage,
          lastUserMessage: null,
        }));

        throw error;
      }
    },
    [state.sessionId, state.messages]
  );

  /**
   * チャット履歴をクリア
   */
  const clearMessages = useCallback(() => {
    // localStorageから削除
    if (state.sessionId) {
      deleteChatHistory(state.sessionId);
    }

    setState({
      messages: [],
      loading: false,
      error: null,
      sessionId: null,
      lastUserMessage: null,
      status: 'open',
    });
  }, [state.sessionId]);

  /**
   * エラーをクリア
   */
  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null,
    }));
  }, []);

  /**
   * セッションIDをリセット（新しい会話を開始）
   */
  const resetSession = useCallback(() => {
    setState({
      messages: [],
      loading: false,
      error: null,
      sessionId: null,
      lastUserMessage: null,
      status: 'open',
    });
  }, []);

  /**
   * 指定したセッションを読み込む
   */
  const loadSession = useCallback((sessionId: string) => {
    const { messages: savedMessages, status } = loadChatHistory(sessionId);
    setState({
      messages: savedMessages,
      loading: false,
      error: null,
      sessionId: sessionId,
      lastUserMessage: null,
      status: status,
    });
  }, []);

  /**
   * チャットをクローズ（有人窓口への問い合わせ完了時）
   */
  const closeChat = useCallback(() => {
    setState(prev => {
      const newState = { ...prev, status: 'closed' as const };
      // localStorageに保存
      if (prev.sessionId) {
        saveChatHistory(prev.sessionId, prev.messages, 'closed');
      }
      return newState;
    });
  }, []);

  return {
    messages: state.messages,
    loading: state.loading,
    error: state.error,
    sessionId: state.sessionId,
    lastUserMessage: state.lastUserMessage,
    status: state.status,
    sendMessage,
    clearMessages,
    clearError,
    resetSession,
    loadSession,
    closeChat,
  };
}

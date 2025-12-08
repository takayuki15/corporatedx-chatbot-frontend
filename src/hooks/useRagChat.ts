import type { RagRequest, RagResponse } from '@/lib/api';
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
        // TODO: 実際の会社コードと事業所コードを取得
        const requestBody: RagRequest = {
          query,
          company_code: options?.company_code || 'MMC',
          office_code: options?.office_code || 'MM00',
          session_id: state.sessionId || undefined,
          language: options?.language || 'ja',
          retrieval_mode: options?.retrieval_mode || 'hybrid',
          top_n: options?.top_n || 5,
          ...options,
        };

        const response = await fetch('/chatbot/api/rag/', {
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

        setState(prev => ({
          messages: [...prev.messages, data],
          loading: false,
          error: null,
          sessionId: data.session_id,
          lastUserMessage: null,
        }));

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
    [state.sessionId]
  );

  /**
   * チャット履歴をクリア
   */
  const clearMessages = useCallback(() => {
    setState({
      messages: [],
      loading: false,
      error: null,
      sessionId: null,
      lastUserMessage: null,
    });
  }, []);

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
    setState(prev => ({
      ...prev,
      sessionId: null,
    }));
  }, []);

  return {
    messages: state.messages,
    loading: state.loading,
    error: state.error,
    sessionId: state.sessionId,
    lastUserMessage: state.lastUserMessage,
    sendMessage,
    clearMessages,
    clearError,
    resetSession,
  };
}

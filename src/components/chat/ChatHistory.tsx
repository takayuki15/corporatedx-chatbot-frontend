'use client';

import { Box, Typography, Alert, Skeleton, Paper } from '@mui/material';
import { useEffect, useRef } from 'react';
import type { RagResponse } from '@/lib/api';
import ChatMessage from './ChatMessage';

interface ChatHistoryProps {
  messages: RagResponse[];
  loading?: boolean;
  error?: string | null;
  lastUserMessage?: string | null;
}

/**
 * チャット履歴表示コンポーネント
 */
export default function ChatHistory({ messages, loading, error, lastUserMessage }: ChatHistoryProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // 新しいメッセージが追加されたら自動スクロール
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  if (messages.length === 0 && !loading && !error) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          p: 4,
        }}
      >
        <Typography variant="body1" color="text.secondary" textAlign="center">
          質問を入力して会話を始めましょう
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        flexGrow: 1,
        overflow: 'auto',
        p: 3,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* エラー表示 */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* メッセージ履歴 */}
      {messages.map((message, index) => (
        <ChatMessage key={index} response={message} />
      ))}

      {/* ローディング表示（スケルトン） */}
      {loading && lastUserMessage && (
        <Box sx={{ mb: 4 }}>
          {/* ユーザーメッセージ */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Paper
              elevation={1}
              sx={{
                maxWidth: '70%',
                p: 2,
                bgcolor: '#6E41FF',
                color: 'white',
                borderRadius: 2,
              }}
            >
              <Typography variant="body1">{lastUserMessage}</Typography>
            </Paper>
          </Box>

          {/* AIレスポンスのスケルトン */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
            <Paper
              elevation={1}
              sx={{
                maxWidth: '85%',
                p: 2,
                bgcolor: 'background.paper',
                borderRadius: 2,
              }}
            >
              {/* 業務小分類タグのスケルトン */}
              <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
                <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 1 }} />
                <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 1 }} />
              </Box>

              {/* FAQ回答セクションのスケルトン */}
              <Box sx={{ mb: 3 }}>
                <Skeleton variant="text" width={100} height={24} sx={{ mb: 1 }} />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Paper variant="outlined" sx={{ p: 1.5, bgcolor: 'action.hover' }}>
                    <Skeleton variant="text" width="90%" />
                    <Skeleton variant="text" width="80%" />
                  </Paper>
                  <Paper variant="outlined" sx={{ p: 1.5, bgcolor: 'action.hover' }}>
                    <Skeleton variant="text" width="85%" />
                    <Skeleton variant="text" width="75%" />
                  </Paper>
                </Box>
              </Box>

              {/* RAG回答セクションのスケルトン */}
              <Box>
                <Skeleton variant="text" width={100} height={24} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="95%" />
                <Skeleton variant="text" width="100%" />
                <Skeleton variant="text" width="90%" />
                <Skeleton variant="text" width="85%" />
              </Box>

              {/* 参照元のスケルトン */}
              <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                <Skeleton variant="text" width={60} height={20} />
              </Box>
            </Paper>
          </Box>
        </Box>
      )}

      {/* 自動スクロール用の要素 */}
      <div ref={bottomRef} />
    </Box>
  );
}

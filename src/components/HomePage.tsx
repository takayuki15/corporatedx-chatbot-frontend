'use client';

import { Box, Container, IconButton } from '@mui/material';
import { useState } from 'react';
import { BsLayoutSidebar } from 'react-icons/bs';

import ChatHistory from '@/components/chat/ChatHistory';
import ChatInput from '@/components/chat/ChatInput';
import ChatHeader from '@/components/chat/ChatHeader';
import TermsModal from '@/components/common/TermsModal';
import Sidebar from '@/components/layout/Sidebar';
import { useRagChat } from '@/hooks';
import { deleteChatHistory } from '@/lib/storage';

export default function HomePage() {
  const [chatInputValue, setChatInputValue] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // RAGチャット機能を使用
  const { messages, loading, error, lastUserMessage, sendMessage, resetSession, loadSession } = useRagChat();

  const handleChatSend = async (
    text: string,
    options: { confidential: boolean; files: File[] }
  ) => {
    try {
      // TODO: confidentialフラグとfilesをバックエンドに送信する処理を追加
      console.log('Chat options:', {
        confidential: options.confidential,
        filesCount: options.files.length,
      });

      await sendMessage(text);
      setChatInputValue('');
    } catch (error) {
      console.error('Failed to send message:', error);
      // エラーは useRagChat で管理されるため、ここでは追加処理不要
    }
  };

  // セッション選択時の処理
  const handleSelectSession = (sessionId: string) => {
    loadSession(sessionId);
  };

  // 新しいチャット開始時の処理
  const handleNewChat = () => {
    resetSession();
  };

  // チャット削除時の処理
  const handleDeleteChat = () => {
    if (confirm('このチャットを削除しますか？')) {
      const currentSessionId = messages[0]?.session_id;
      if (currentSessionId) {
        deleteChatHistory(currentSessionId);
      }
      resetSession();
    }
  };

  // 有人窓口ボタンクリック時の処理
  const handleSupport = () => {
    // TODO: 有人窓口への遷移処理を実装
    console.log('有人窓口へ遷移');
  };

  // チャットタイトルを取得（初回ユーザー入力の先頭15文字）
  const getChatTitle = () => {
    if (messages.length === 0) return '新しいチャット';

    const firstUserMessage = messages[0]?.chat_history?.find(
      msg => msg.role === 'user'
    );
    const title = firstUserMessage?.content || '新しいチャット';
    return title.length > 15 ? title.substring(0, 15) + '...' : title;
  };

  // メッセージがある場合とない場合でレイアウトを切り替え
  const hasMessages = messages.length > 0;

  return (
    <Container maxWidth="lg">
      {/* 利用規約モーダル */}
      <TermsModal />

      <Box sx={{ display: 'flex', height: '100vh' }}>
        {/* 既存のSidebarコンポーネントを使用 */}
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onSelectSession={handleSelectSession}
          onNewChat={handleNewChat}
        />

        {/* メインコンテンツ */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            marginLeft: sidebarOpen ? '280px' : 0,
            transition: 'margin-left 0.3s ease',
          }}
        >
          {/* ツールバー（サイドバーが閉じている時のみ表示） */}
          {!sidebarOpen && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                p: 2,
                position: 'absolute',
                top: 0,
                left: 0,
                zIndex: 1000,
              }}
            >
              <IconButton
                onClick={() => setSidebarOpen(true)}
                size="small"
                sx={{
                  color: 'text.secondary',
                  width: 32,
                  height: 32,
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
                aria-label="サイドバーを開く"
              >
                <BsLayoutSidebar size={16} />
              </IconButton>
            </Box>
          )}

          {/* ヘッダー（メッセージがある場合のみ表示） */}
          {hasMessages && (
            <ChatHeader
              title={getChatTitle()}
              onDelete={handleDeleteChat}
              onSupport={handleSupport}
            />
          )}

          {/* メインエリア */}
          <Box
            sx={{
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
              ...(hasMessages
                ? {
                    // メッセージがある場合: チャット履歴を上部に表示
                    justifyContent: 'flex-start',
                  }
                : {
                    // メッセージがない場合: 中央に配置
                    justifyContent: 'center',
                    alignItems: 'center',
                    px: 4,
                    pt: 8,
                  }),
              pb: 4,
              overflow: 'hidden',
            }}
          >
            {hasMessages ? (
              // チャット履歴表示モード
              <Box
                sx={{
                  flexGrow: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  maxWidth: 900,
                  width: '100%',
                  mx: 'auto',
                }}
              >
                <ChatHistory
                  messages={messages}
                  loading={loading}
                  error={error}
                  lastUserMessage={lastUserMessage}
                />

                {/* チャット入力エリア（下部固定） */}
                <Box sx={{ px: 3, pb: 2 }}>
                  <ChatInput
                    onSend={handleChatSend}
                    value={chatInputValue}
                    onChange={setChatInputValue}
                    disabled={loading}
                    loading={loading}
                  />
                </Box>
              </Box>
            ) : (
              // 初期表示モード（クイックアクション + 入力エリア）
              <Box
                sx={{
                  maxWidth: 900,
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                  mt: 6,
                }}
              >
                {/* チャット入力エリア（クイックアクションのすぐ下） */}
                <Box sx={{ width: '100%', maxWidth: 800 }}>
                  <ChatInput
                    onSend={handleChatSend}
                    value={chatInputValue}
                    onChange={setChatInputValue}
                    disabled={loading}
                    loading={loading}
                  />
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Container>
  );
}

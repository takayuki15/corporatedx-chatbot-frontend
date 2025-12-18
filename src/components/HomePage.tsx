'use client';

import { Box, IconButton } from '@mui/material';
import { useEffect, useState } from 'react';
import { BsLayoutSidebar } from 'react-icons/bs';

import ChatHeader from '@/components/chat/ChatHeader';
import ChatHistory from '@/components/chat/ChatHistory';
import ChatInput from '@/components/chat/ChatInput';
import TermsMessage from '@/components/chat/TermsMessage';
import Sidebar from '@/components/layout/Sidebar';
import SupportSidebar from '@/components/layout/SupportSidebar';
import { useUserContext } from '@/contexts';
import { useRagChat } from '@/hooks';
import type { ChatMessage } from '@/lib/api';
import { deleteChatHistory } from '@/lib/storage';

export default function HomePage() {
  const { user, employeeInfo } = useUserContext();
  const [chatInputValue, setChatInputValue] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [supportSidebarOpen, setSupportSidebarOpen] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // RAGチャット機能を使用
  const {
    messages,
    loading,
    error,
    lastUserMessage,
    sendMessage,
    resetSession,
    loadSession,
  } = useRagChat();

  // 利用規約の同意状態をチェック
  useEffect(() => {
    const termsConsent = sessionStorage.getItem('termsConsent');
    setTermsAccepted(termsConsent === 'accepted');
  }, []);

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

      // ユーザー情報と従業員情報が必要
      if (!user || !employeeInfo) {
        throw new Error('ユーザー情報または従業員情報が取得できていません');
      }

      await sendMessage(text, {
        company: employeeInfo.company_code,
        office: employeeInfo.office_code,
        miam_id: user.unique_name,
      });
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
    // 新しいチャット開始時に利用規約を再表示
    sessionStorage.removeItem('termsConsent');
    setTermsAccepted(false);
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
    setSupportSidebarOpen(true);
  };

  // 利用規約同意状態変更ハンドラー
  const handleTermsAgreeChange = (agreed: boolean) => {
    if (agreed) {
      sessionStorage.setItem('termsConsent', 'accepted');
    } else {
      sessionStorage.removeItem('termsConsent');
    }
    setTermsAccepted(agreed);
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

  // 最新のRAGレスポンスから有人窓口情報を取得
  const getMannedCounterData = (): {
    priorityMannedCounterNames: string[];
    chatHistory: ChatMessage[];
    businessSubCategories: string[];
  } => {
    // 最新のメッセージから情報を取得
    const latestMessage = messages[messages.length - 1];

    if (!latestMessage) {
      return {
        priorityMannedCounterNames: [],
        chatHistory: [],
        businessSubCategories: [],
      };
    }

    return {
      priorityMannedCounterNames:
        latestMessage.priority_manned_counter_names || [],
      chatHistory: latestMessage.chat_history || [],
      businessSubCategories: latestMessage.business_sub_categories || [],
    };
  };

  const { priorityMannedCounterNames, chatHistory, businessSubCategories } =
    getMannedCounterData();

  return (
    <>
      <Box sx={{ display: 'flex', height: '100vh' }}>
        {/* 既存のSidebarコンポーネントを使用 */}
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onSelectSession={handleSelectSession}
          onNewChat={handleNewChat}
        />

        {/* 有人窓口サイドバー */}
        <SupportSidebar
          open={supportSidebarOpen}
          onClose={() => setSupportSidebarOpen(false)}
          priorityMannedCounterNames={priorityMannedCounterNames}
          chatHistory={chatHistory}
          businessSubCategories={businessSubCategories}
        />

        {/* メインコンテンツ */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            width: '100%',
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
              sidebarOpen={sidebarOpen}
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
              // 初期表示モード
              <Box
                sx={{
                  maxWidth: 900,
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  gap: 4,
                  mt: 6,
                }}
              >
                {/* 利用規約 */}
                <TermsMessage onAgreeChange={handleTermsAgreeChange} />

                {/* チャット入力エリア（常に表示、同意状態で有効/無効を切り替え） */}
                <Box sx={{ width: '100%', maxWidth: 800, px: 3 }}>
                  <ChatInput
                    onSend={handleChatSend}
                    value={chatInputValue}
                    onChange={setChatInputValue}
                    disabled={
                      !termsAccepted || !user || !employeeInfo || loading
                    }
                    loading={loading}
                  />
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </>
  );
}

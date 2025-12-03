'use client';

import { Box, Container, IconButton } from '@mui/material';
import { useState } from 'react';
import { BsLayoutSidebar } from 'react-icons/bs';

import ChatInput from '@/components/chat/ChatInput';
import Sidebar from '@/components/layout/Sidebar';
import QuickActions from '@/components/QuickActions';
import TermsModal from '@/components/common/TermsModal';

export default function HomePage() {
  const [chatInputValue, setChatInputValue] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleChatSend = (
    text: string,
    options: { confidential: boolean; files: File[] }
  ) => {
    // eslint-disable-next-line no-console
    console.log('Chat message sent:', { text, options });
  };

  const handleQuickActionSelect = (text: string) => {
    setChatInputValue(text);
  };

  return (
    <Container maxWidth="lg">
      {/* 利用規約モーダル */}
      <TermsModal />

      <Box sx={{ display: 'flex', height: '100vh' }}>
        {/* 既存のSidebarコンポーネントを使用 */}
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

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

          {/* メインエリア */}
          <Box
            sx={{
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              px: 4,
              pt: 8,
              pb: 4,
              overflow: 'auto',
            }}
          >
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
              <QuickActions onActionSelect={handleQuickActionSelect} />

              {/* チャット入力エリア（クイックアクションのすぐ下） */}
              <Box sx={{ width: '100%', maxWidth: 800 }}>
                <ChatInput
                  onSend={handleChatSend}
                  value={chatInputValue}
                  onChange={setChatInputValue}
                />
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}

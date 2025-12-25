'use client';

import { useUserContext } from '@/contexts';
import { getAllSessionIds, loadChatHistory } from '@/lib/storage';
import {
  Create as CreateIcon,
  ExpandMore as ExpandMoreIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { BsLayoutSidebar } from 'react-icons/bs';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  onSelectSession?: (sessionId: string) => void;
  onNewChat?: () => void;
  refreshTrigger?: number;
}

interface ChatHistoryItem {
  sessionId: string;
  title: string;
  lastUpdate: Date;
}

export default function Sidebar({
  open,
  onClose,
  onSelectSession,
  onNewChat,
  refreshTrigger,
}: SidebarProps) {
  const { user, loading } = useUserContext();
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);

  // localStorageからチャット履歴を読み込み
  useEffect(() => {
    if (!open) return; // サイドバーが閉じている場合は読み込まない

    const sessionIds = getAllSessionIds();
    const historyItems: ChatHistoryItem[] = sessionIds
      .map(sessionId => {
        const { messages } = loadChatHistory(sessionId);
        if (messages.length === 0) return null;

        // 最初のユーザーメッセージをタイトルとして使用
        // userQueryを優先、なければchat_historyから取得
        const firstMessage = messages[0];
        const title =
          firstMessage?.userQuery ||
          firstMessage?.chat_history?.find(msg => msg.role === 'user')
            ?.content ||
          'タイトルなし';

        return {
          sessionId,
          title: title.length > 30 ? title.substring(0, 30) + '...' : title,
          lastUpdate: new Date(), // TODO: 実際のタイムスタンプを使用
        };
      })
      .filter((item): item is ChatHistoryItem => item !== null)
      .sort((a, b) => b.lastUpdate.getTime() - a.lastUpdate.getTime()); // 新しい順

    setChatHistory(historyItems);
  }, [open, refreshTrigger]); // サイドバーが開くたびに、または削除時に再読み込み

  // nameからスラッシュ以降の日本語名を抽出
  const displayName = user?.name?.includes('/')
    ? user.name.split('/')[1]
    : user?.name || '不明';

  // unique_nameから@以前の文字列を抽出
  const displayUniqueName = user?.unique_name?.includes('@')
    ? user.unique_name.split('@')[0]
    : user?.unique_name || '不明';

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={open}
      sx={{
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 280,
          boxSizing: 'border-box',
          borderRight: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        },
      }}
    >
      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Header Section */}
        <Box sx={{ p: 2 }}>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 600, color: '#6E41FF' }}
            >
              MurataHelp
            </Typography>

            <ExpandMoreIcon sx={{ fontSize: 20, color: 'text.secondary' }} />

            <Box sx={{ flex: 1 }} />

            <IconButton
              onClick={onClose}
              size="small"
              sx={{
                color: 'text.secondary',
                width: 32,
                height: 32,
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              <BsLayoutSidebar size={16} />
            </IconButton>
          </Stack>
        </Box>

        {/* New Chat Button */}
        <Box sx={{ px: 2, pb: 2 }}>
          <Button
            variant="contained"
            fullWidth
            startIcon={<CreateIcon />}
            onClick={onNewChat}
            sx={{
              justifyContent: 'center',
              borderRadius: 2,
              textTransform: 'none',
              py: 1.5,
              bgcolor: '#6E41FF',
              color: 'white',
              '&:hover': {
                bgcolor: '#5C35CC',
              },
            }}
          >
            新しいチャット
          </Button>
        </Box>

        {/* Chat History */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          <List sx={{ px: 1 }}>
            {chatHistory.length === 0 ? (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  チャット履歴がありません
                </Typography>
              </Box>
            ) : (
              chatHistory.map(chat => (
                <ListItem key={chat.sessionId} disablePadding>
                  <ListItemButton
                    onClick={() => onSelectSession?.(chat.sessionId)}
                    sx={{
                      borderRadius: 2,
                      mx: 1,
                      mb: 0.5,
                      '&:hover': {
                        bgcolor: 'primary.50',
                      },
                    }}
                  >
                    <ListItemText
                      primary={chat.title}
                      slotProps={{
                        primary: {
                          variant: 'body2',
                          noWrap: true,
                          sx: { color: 'text.primary' },
                        },
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              ))
            )}
          </List>
        </Box>

        <Divider />

        {/* User Account Section */}
        <Box sx={{ p: 2 }}>
          <ListItemButton
            sx={{
              borderRadius: 2,
              '&:hover': {
                bgcolor: 'primary.50',
              },
            }}
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: '#6E41FF', mr: 1.5 }}>
              {loading ? (
                <CircularProgress size={16} sx={{ color: 'white' }} />
              ) : (
                <PersonIcon sx={{ fontSize: 20 }} />
              )}
            </Avatar>
            <ListItemText
              primary={displayName}
              secondary={displayUniqueName}
              slotProps={{
                primary: {
                  variant: 'body2',
                  fontWeight: 500,
                },
                secondary: {
                  variant: 'caption',
                  color: 'text.secondary',
                },
              }}
            />
          </ListItemButton>
        </Box>
      </Box>
    </Drawer>
  );
}

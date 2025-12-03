'use client';

import { useUserContext } from '@/contexts';
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
import { BsLayoutSidebar } from 'react-icons/bs';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const chatHistory = [
  'Next.jsプロジェクトについて',
  'MUIコンポーネントの使い方',
  'TypeScriptの型定義',
  'Reactのベストプラクティス',
  'デザインシステムの構築',
];

export default function Sidebar({ open, onClose }: SidebarProps) {
  const { user, loading } = useUserContext();

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
              ムラタヘルプ
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
            {chatHistory.map((chat, index) => (
              <ListItem key={index} disablePadding>
                <ListItemButton
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
                    primary={chat}
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
            ))}
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
              primary={user?.name || '不明'}
              secondary={user?.unique_name || '不明'}
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

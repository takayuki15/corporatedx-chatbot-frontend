'use client';

import { DeleteOutline as DeleteIcon } from '@mui/icons-material';
import { Box, IconButton, Typography, Button } from '@mui/material';

interface ChatHeaderProps {
  title: string;
  onDelete?: () => void;
  onSupport?: () => void;
}

/**
 * チャットヘッダーコンポーネント
 */
export default function ChatHeader({ title, onDelete, onSupport }: ChatHeaderProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 4,
        py: 2,
        borderBottom: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        width: '100%',
      }}
    >
      {/* 左側: タイトル + 削除アイコン */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
          {title}
        </Typography>
        {onDelete && (
          <IconButton
            size="small"
            onClick={onDelete}
            sx={{
              color: 'text.secondary',
              '&:hover': {
                color: 'error.main',
                bgcolor: 'error.lighter',
              },
            }}
            aria-label="チャットを削除"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      {/* 右側: 有人窓口ボタン */}
      <Button
        variant="outlined"
        onClick={onSupport}
        sx={{
          textTransform: 'none',
          borderRadius: 2,
          borderColor: 'divider',
          color: '#6E41FF',
          '&:hover': {
            borderColor: '#6E41FF',
            bgcolor: 'rgba(110, 65, 255, 0.15)',
          },
        }}
      >
        有人窓口
      </Button>
    </Box>
  );
}

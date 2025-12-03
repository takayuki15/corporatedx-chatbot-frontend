'use client';

import { Box, Chip, Stack, Typography } from '@mui/material';

const quickActionItems = [
  '入社時の提出書類について知りたい',
  '出張について知りたい',
  '機密情報について知りたい',
];

interface QuickActionsProps {
  onActionSelect: (text: string) => void;
}

export default function QuickActions({ onActionSelect }: QuickActionsProps) {
  const handleChipClick = (text: string) => {
    onActionSelect(text);
  };

  return (
    <Box sx={{ textAlign: 'center' }}>
      {/* メインタイトル */}
      <Typography
        variant="h5"
        component="h1"
        sx={{ mb: 4, fontWeight: 600 }}
        aria-level={1}
      >
        お手伝いできることはありますか？
      </Typography>

      {/* クイックアクションチップ */}
      <Stack
        direction="row"
        spacing={2}
        sx={{
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {quickActionItems.map((item, index) => (
          <Chip
            key={index}
            label={item}
            onClick={() => handleChipClick(item)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleChipClick(item);
              }
            }}
            variant="outlined"
            sx={{
              fontSize: 'body2.fontSize',
              py: 1,
              px: 2,
              borderRadius: 2,
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: 'action.hover',
                borderColor: 'primary.main',
              },
              '&:focus': {
                backgroundColor: 'action.hover',
                borderColor: 'primary.main',
              },
            }}
            aria-label={`クイックアクション: ${item}`}
            tabIndex={0}
          />
        ))}
      </Stack>
    </Box>
  );
}

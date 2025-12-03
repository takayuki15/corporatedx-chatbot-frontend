'use client';

import { Box, Chip } from '@mui/material';

import CitationPopover, { Citation } from './CitationPopover';

interface CitationTextProps {
  text: string;
  citation: Citation;
}

export default function CitationText({ text, citation }: CitationTextProps) {
  // textが空の場合はラベルのみ表示
  if (!text) {
    return (
      <CitationPopover citation={citation}>
        <Chip
          label={citation.title}
          size="small"
          sx={{
            ml: 0.5,
            height: '20px',
            fontSize: '0.75rem',
            backgroundColor: 'rgba(110, 65, 255, 0.15)',
            color: '#6E41FF',
            fontWeight: 500,
            cursor: 'pointer',
            verticalAlign: 'baseline',
            '&:hover': {
              backgroundColor: 'rgba(110, 65, 255, 0.25)',
            },
            '& .MuiChip-label': {
              px: 1,
            },
          }}
        />
      </CitationPopover>
    );
  }

  // textがある場合はハイライト付きで表示
  return (
    <Box
      component="span"
      sx={{
        display: 'inline',
        backgroundColor: 'rgba(110, 65, 255, 0.1)',
        borderRadius: '4px',
        padding: '2px 4px',
      }}
    >
      <Box component="span" sx={{ display: 'inline' }}>
        {text}
      </Box>
      <CitationPopover citation={citation}>
        <Chip
          label={citation.title}
          size="small"
          sx={{
            ml: 0.5,
            height: '20px',
            fontSize: '0.75rem',
            backgroundColor: 'rgba(110, 65, 255, 0.15)',
            color: '#6E41FF',
            fontWeight: 500,
            cursor: 'pointer',
            verticalAlign: 'baseline',
            '&:hover': {
              backgroundColor: 'rgba(110, 65, 255, 0.25)',
            },
            '& .MuiChip-label': {
              px: 1,
            },
          }}
        />
      </CitationPopover>
    </Box>
  );
}

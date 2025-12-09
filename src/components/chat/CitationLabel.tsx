'use client';

import { Box, Chip, Link, Popover, Typography } from '@mui/material';
import { MouseEvent, useState } from 'react';

import { Citation } from './CitationPopover';

interface CitationLabelProps {
  citations: Citation[];
}

export default function CitationLabel({ citations }: CitationLabelProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'citation-popover' : undefined;

  if (citations.length === 0) return null;

  const firstCitation = citations[0];
  const additionalCount = citations.length - 1;
  const label =
    additionalCount > 0
      ? `${firstCitation.title}+${additionalCount}`
      : firstCitation.title;

  return (
    <>
      <Chip
        label={label}
        size="small"
        onClick={handleClick}
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
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              maxWidth: 400,
              p: 2,
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            },
          },
        }}
      >
        <Box>
          {citations.map((citation, index) => (
            <Box
              key={citation.id}
              sx={{
                mb: index < citations.length - 1 ? 2 : 0,
                pb: index < citations.length - 1 ? 2 : 0,
                borderBottom:
                  index < citations.length - 1
                    ? '1px solid rgba(0, 0, 0, 0.12)'
                    : 'none',
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 600,
                  mb: 1,
                  color: 'text.primary',
                }}
              >
                {citation.title}
              </Typography>
              {citation.description && (
                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.secondary',
                    mb: 1.5,
                  }}
                >
                  {citation.description}
                </Typography>
              )}
              <Link
                href={citation.file_name}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  fontSize: '0.875rem',
                  color: 'primary.main',
                  textDecoration: 'none',
                  display: 'block',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                {citation.file_name}
              </Link>
            </Box>
          ))}
        </Box>
      </Popover>
    </>
  );
}

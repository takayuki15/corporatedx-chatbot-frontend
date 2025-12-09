'use client';

import { Box, Popover, Typography } from '@mui/material';
import { MouseEvent, useState } from 'react';

export interface Citation {
  id: string;
  title: string;
  file_name: string;
  description?: string;
}

interface CitationPopoverProps {
  citation: Citation;
  children: React.ReactNode;
}

export default function CitationPopover({
  citation,
  children,
}: CitationPopoverProps) {
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
  const id = open ? `citation-popover-${citation.id}` : undefined;

  return (
    <>
      <Box
        component="span"
        onClick={handleClick}
        sx={{
          cursor: 'pointer',
          display: 'inline',
        }}
      >
        {children}
      </Box>
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
          <Typography
            variant="body2"
            sx={{
              fontSize: '0.875rem',
              color: 'text.secondary',
            }}
          >
            {citation.file_name}
          </Typography>
        </Box>
      </Popover>
    </>
  );
}

'use client';
import { Menu as MenuIcon } from '@mui/icons-material';
import { Box, IconButton } from '@mui/material';
import { useState } from 'react';

import Sidebar from './Sidebar';

const DRAWER_WIDTH = 280;

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true);

  const handleToggleSidebar = () => {
    setOpen(!open);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100dvh' }}>
      <Sidebar open={open} onClose={handleToggleSidebar} />
      <Box
        component="main"
        sx={theme => ({
          flex: 1,
          minWidth: 0,
          ml: open ? `${DRAWER_WIDTH}px` : 0,
          transition: theme.transitions.create('margin-left', {
            duration: theme.transitions.duration.shorter,
          }),
        })}
      >
        {/* Hamburger menu button when sidebar is closed */}
        {!open && (
          <Box
            sx={{
              position: 'fixed',
              top: 16,
              left: 16,
              zIndex: 1200,
            }}
          >
            <IconButton
              onClick={handleToggleSidebar}
              sx={{
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                width: 40,
                height: 40,
                '&:hover': {
                  bgcolor: 'primary.50',
                  borderColor: 'primary.main',
                },
              }}
            >
              <MenuIcon />
            </IconButton>
          </Box>
        )}
        {children}
      </Box>
    </Box>
  );
}

'use client';

import CssBaseline from '@mui/material/CssBaseline';
import {
  createTheme,
  ThemeProvider as MuiThemeProvider,
} from '@mui/material/styles';
import { ReactNode } from 'react';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: '"Noto Sans JP", "Roboto", "Helvetica", "Arial", sans-serif',
    body1: {
      fontSize: '16px',
      lineHeight: '20px',
    },
    body2: {
      fontSize: '14px',
      lineHeight: '20px',
    },
    subtitle1: {
      fontSize: '16px',
      lineHeight: '20px',
    },
    subtitle2: {
      fontSize: '14px',
      lineHeight: '20px',
    },
    h5: {
      fontSize: '24px',
      lineHeight: '32px',
    },
  },
});

interface ThemeProviderProps {
  children: ReactNode;
}

export default function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}

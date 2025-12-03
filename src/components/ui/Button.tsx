import {
  CircularProgress,
  Button as MuiButton,
  ButtonProps as MuiButtonProps,
} from '@mui/material';
import { ReactNode } from 'react';

interface ButtonProps extends Omit<MuiButtonProps, 'variant'> {
  variant?: 'text' | 'outlined' | 'contained' | 'gradient';
  loading?: boolean;
  children: ReactNode;
}

export default function Button({
  variant = 'contained',
  loading = false,
  disabled,
  children,
  sx,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const getButtonSx = () => {
    const baseSx = {
      textTransform: 'none' as const,
      borderRadius: 2,
      fontWeight: 600,
      ...(sx || {}),
    };

    if (variant === 'gradient') {
      return {
        ...baseSx,
        background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
        color: 'white',
        border: 0,
        '&:hover': {
          background: 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)',
        },
        '&:disabled': {
          background: 'linear-gradient(45deg, #ccc 30%, #ddd 90%)',
        },
      };
    }

    return baseSx;
  };

  return (
    <MuiButton
      variant={variant === 'gradient' ? 'contained' : variant}
      disabled={isDisabled}
      sx={getButtonSx()}
      {...props}
    >
      {loading && (
        <CircularProgress
          size={16}
          sx={{
            color: 'inherit',
            mr: 1,
          }}
        />
      )}
      {children}
    </MuiButton>
  );
}

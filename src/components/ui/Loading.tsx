import { Box, CircularProgress, Skeleton, Typography } from '@mui/material';

interface LoadingProps {
  variant?: 'circular' | 'linear' | 'skeleton';
  size?: number | string;
  message?: string;
  fullScreen?: boolean;
  rows?: number;
}

export default function Loading({
  variant = 'circular',
  size = 40,
  message,
  fullScreen = false,
  rows = 3,
}: LoadingProps) {
  const containerSx = fullScreen
    ? {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'rgba(255, 255, 255, 0.8)',
        zIndex: 9999,
      }
    : {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      };

  if (variant === 'skeleton') {
    return (
      <Box sx={{ width: '100%' }}>
        {Array.from({ length: rows }).map((_, index) => (
          <Skeleton
            key={index}
            variant="rectangular"
            height={40}
            sx={{
              mb: 1,
              borderRadius: 1,
              ...(index === 0 && { width: '60%' }),
              ...(index === rows - 1 && { width: '80%' }),
            }}
          />
        ))}
      </Box>
    );
  }

  return (
    <Box sx={containerSx as Record<string, unknown>}>
      <CircularProgress
        size={size}
        sx={{
          color: 'primary.main',
          ...(variant === 'linear' && {
            width: '100%',
            maxWidth: 200,
          }),
        }}
      />
      {message && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 2, textAlign: 'center' }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );
}

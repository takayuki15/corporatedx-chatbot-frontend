import { MoreVert as MoreIcon } from '@mui/icons-material';
import {
  CardActions,
  CardContent,
  CardHeader,
  Divider,
  IconButton,
  Card as MuiCard,
  Typography,
} from '@mui/material';
import { ReactNode } from 'react';

interface CardProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  actions?: ReactNode;
  onMenuClick?: () => void;
  elevation?: number;
  variant?: 'elevation' | 'outlined';
}

export default function Card({
  title,
  subtitle,
  children,
  actions,
  onMenuClick,
  elevation = 1,
  variant = 'elevation',
}: CardProps) {
  return (
    <MuiCard
      elevation={elevation}
      variant={variant}
      sx={{
        borderRadius: 2,
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          elevation: elevation + 2,
          transform: 'translateY(-2px)',
        },
      }}
    >
      {(title || subtitle || onMenuClick) && (
        <>
          <CardHeader
            title={
              title && (
                <Typography variant="h6" component="h2">
                  {title}
                </Typography>
              )
            }
            subheader={
              subtitle && (
                <Typography variant="body2" color="text.secondary">
                  {subtitle}
                </Typography>
              )
            }
            action={
              onMenuClick && (
                <IconButton aria-label="settings" onClick={onMenuClick}>
                  <MoreIcon />
                </IconButton>
              )
            }
            sx={{ pb: 1 }}
          />
          <Divider />
        </>
      )}

      <CardContent sx={{ py: 2 }}>{children}</CardContent>

      {actions && (
        <>
          <Divider />
          <CardActions sx={{ justifyContent: 'flex-end', px: 2, py: 1 }}>
            {actions}
          </CardActions>
        </>
      )}
    </MuiCard>
  );
}

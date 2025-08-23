// src/components/utils/FormSectionMUI.tsx
import React from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  useTheme,
  alpha,
  Stack
} from '@mui/material';
import {
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';

interface FormSectionMUIProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  onDelete?: () => void;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

const FormSectionMUI: React.FC<FormSectionMUIProps> = ({
  title,
  icon,
  children,
  onDelete,
  collapsible = false,
  defaultExpanded = true
}) => {
  const theme = useTheme();
  const [expanded, setExpanded] = React.useState(defaultExpanded);

  return (
    <Paper
      elevation={0}
      sx={{
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        overflow: 'hidden',
        mb: 3
      }}
    >
      {/* Header */}
      <Box
        sx={{
          bgcolor: alpha(theme.palette.primary.main, 0.04),
          borderBottom: `1px solid ${theme.palette.divider}`,
          px: 2,
          py: 1
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1}>
            {icon && (
              <Box sx={{ color: theme.palette.primary.main, display: 'flex' }}>
                {icon}
              </Box>
            )}
            <Typography variant="subtitle1" component="h3" sx={{ fontWeight: 500, fontSize: '0.875rem' }}>
              {title}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1}>
            {onDelete && (
              <IconButton
                size="small"
                onClick={onDelete}
                sx={{
                  color: theme.palette.error.main,
                  '&:hover': {
                    bgcolor: alpha(theme.palette.error.main, 0.08)
                  }
                }}
              >
                <DeleteIcon />
              </IconButton>
            )}
            
            {collapsible && (
              <IconButton
                size="small"
                onClick={() => setExpanded(!expanded)}
                sx={{
                  transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: theme.transitions.create('transform')
                }}
              >
                <ExpandMoreIcon />
              </IconButton>
            )}
          </Stack>
        </Stack>
      </Box>

      {/* Content */}
      {(!collapsible || expanded) && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </Paper>
  );
};

export default FormSectionMUI;
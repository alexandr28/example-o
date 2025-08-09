// src/components/modal/Modal.tsx
import React, { ReactNode } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Box,
  Typography,
  useTheme,
  useMediaQuery,
  Slide,
  Paper
} from '@mui/material';
import {
  Close as CloseIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { TransitionProps } from '@mui/material/transitions';

// Animación de slide
const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

// Styled components
const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: theme.spacing(2),
    boxShadow: theme.shadows[10],
    maxHeight: '90vh',
    margin: theme.spacing(2)
  }
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  margin: 0,
  padding: theme.spacing(2, 3),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderBottom: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.grey[50]
}));

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  padding: theme.spacing(3),
  overflow: 'auto'
}));

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'fullscreen';
  showHeader?: boolean;
  showCloseButton?: boolean;
  actions?: ReactNode;
  disableBackdropClick?: boolean;
  disableEscapeKeyDown?: boolean;
  fullWidth?: boolean;
  className?: string;
}

/**
 * Modal base con Material UI que mantiene la misma interfaz
 * pero usa componentes de Material UI
 */
const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showHeader = true,
  showCloseButton = true,
  actions,
  disableBackdropClick = false,
  disableEscapeKeyDown = false,
  fullWidth = true,
  className
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Mapear tamaños a maxWidth de Material UI
  const getMaxWidth = () => {
    switch (size) {
      case 'sm': return 'sm';
      case 'md': return 'md';
      case 'lg': return 'lg';
      case 'xl': return 'xl';
      case 'fullscreen': return false;
      default: return 'md';
    }
  };

  // Manejar el cierre del modal
  const handleClose = (event: {}, reason: 'backdropClick' | 'escapeKeyDown') => {
    if (reason === 'backdropClick' && disableBackdropClick) {
      return;
    }
    if (reason === 'escapeKeyDown' && disableEscapeKeyDown) {
      return;
    }
    onClose();
  };

  return (
    <StyledDialog
      open={isOpen}
      onClose={handleClose}
      TransitionComponent={Transition}
      fullWidth={fullWidth}
      maxWidth={getMaxWidth()}
      fullScreen={size === 'fullscreen' || isMobile}
      className={className}
      aria-labelledby="modal-title"
    >
      {showHeader && (
        <StyledDialogTitle id="modal-title">
          <Typography variant="h6" component="span" fontWeight={600}>
            {title || 'Modal'}
          </Typography>
          {showCloseButton && (
            <IconButton
              aria-label="cerrar"
              onClick={onClose}
              size="small"
              sx={{
                color: theme.palette.grey[500],
                '&:hover': {
                  color: theme.palette.grey[700],
                  backgroundColor: theme.palette.action.hover
                }
              }}
            >
              <CloseIcon />
            </IconButton>
          )}
        </StyledDialogTitle>
      )}

      <StyledDialogContent dividers>
        {children}
      </StyledDialogContent>

      {actions && (
        <DialogActions sx={{ px: 3, py: 2 }}>
          {actions}
        </DialogActions>
      )}
    </StyledDialog>
  );
};

export default Modal;
// src/components/navigation/SafeListItemButton.tsx
import React, { forwardRef, useCallback } from 'react';
import { ListItemButton, ListItemButtonProps } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useFormContext } from '../../context';

interface SafeListItemButtonProps extends ListItemButtonProps {
  to: string;
  confirmMessage?: string;
  skipConfirmation?: boolean;
  onNavigate?: () => void;
}

/**
 * Versión segura de ListItemButton que verifica cambios sin guardar
 */
export const SafeListItemButton = forwardRef<HTMLDivElement, SafeListItemButtonProps>(({
  to,
  onClick,
  confirmMessage = '¿Estás seguro de que quieres abandonar esta página? Los cambios sin guardar se perderán.',
  skipConfirmation = false,
  onNavigate,
  children,
  ...props
}, ref) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { hasUnsavedChanges, clearUnsavedChanges } = useFormContext();

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // Si la ruta actual es la misma que el destino, no hacer nada
    if (location.pathname === to) {
      return;
    }

    // Si hay cambios sin guardar y no se debe saltar la confirmación
    if (hasUnsavedChanges && !skipConfirmation) {
      const confirmed = window.confirm(confirmMessage);
      
      if (confirmed) {
        clearUnsavedChanges();
        if (onNavigate) onNavigate();
        navigate(to);
      }
    } else {
      // Si no hay cambios sin guardar o se debe saltar la confirmación
      if (onNavigate) onNavigate();
      navigate(to);
    }

    // Ejecutar onClick original si existe
    if (onClick) {
      onClick(e);
    }
  }, [hasUnsavedChanges, skipConfirmation, confirmMessage, clearUnsavedChanges, navigate, to, onClick, location.pathname, onNavigate]);

  return (
    <ListItemButton
      ref={ref}
      onClick={handleClick}
      {...props}
    >
      {children}
    </ListItemButton>
  );
});

SafeListItemButton.displayName = 'SafeListItemButton';

export default SafeListItemButton;
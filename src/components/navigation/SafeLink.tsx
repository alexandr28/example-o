// src/components/navigation/SafeLink.tsx
import React, { forwardRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useFormContext } from '../../context/FormContex';

interface SafeLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
  confirmMessage?: string;
  skipConfirmation?: boolean;
  component?: React.ElementType;
  sx?: any; // Para estilos de MUI
}

/**
 * Componente que verifica si hay cambios sin guardar antes de navegar.
 * Funciona tanto como un enlace normal como un componente para Material-UI
 */
export const SafeLink = forwardRef<HTMLAnchorElement, SafeLinkProps>(({
  to,
  onClick,
  confirmMessage = '¿Estás seguro de que quieres abandonar esta página? Los cambios sin guardar se perderán.',
  skipConfirmation = false,
  children,
  component: Component = 'a',
  sx,
  ...props
}, ref) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { hasUnsavedChanges, clearUnsavedChanges } = useFormContext();

  const handleClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    // Si la ruta actual es la misma que el destino, no hacer nada
    if (location.pathname === to) {
      return;
    }

    // Si hay cambios sin guardar y no se debe saltar la confirmación
    if (hasUnsavedChanges && !skipConfirmation) {
      const confirmed = window.confirm(confirmMessage);
      
      if (confirmed) {
        clearUnsavedChanges();
        navigate(to);
      }
    } else {
      // Si no hay cambios sin guardar o se debe saltar la confirmación
      navigate(to);
    }

    // Ejecutar onClick original si existe
    if (onClick) {
      onClick(e);
    }
  }, [hasUnsavedChanges, skipConfirmation, confirmMessage, clearUnsavedChanges, navigate, to, onClick, location.pathname]);

  // Props para el componente
  const componentProps = {
    ...props,
    ref,
    href: to,
    onClick: handleClick,
    sx,
    children
  };

  // Si es un componente personalizado (como ListItemButton)
  if (Component !== 'a') {
    return <Component {...componentProps} />;
  }

  // Si es un enlace normal
  return <a {...componentProps} />;
});

SafeLink.displayName = 'SafeLink';

export default SafeLink;
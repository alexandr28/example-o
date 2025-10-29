// src/hooks/useHotkeys.ts
import { useEffect, useRef, useCallback } from 'react';

export interface HotkeyConfig {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  meta?: boolean;
  description?: string;
  preventDefault?: boolean;
  enabled?: boolean;
}

export type HotkeyHandler = (event: KeyboardEvent) => void;

/**
 * Hook para manejar atajos de teclado (hotkeys)
 * Soporta combinaciones con Ctrl, Alt, Shift, Meta
 */
export const useHotkeys = (
  hotkeys: HotkeyConfig[],
  handler: HotkeyHandler,
  dependencies: any[] = []
) => {
  const handlerRef = useRef(handler);

  // Actualizar la referencia del handler
  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Ignorar eventos de inputs, textareas, etc. a menos que se especifique
      const target = event.target as HTMLElement;
      const tagName = target.tagName.toLowerCase();
      const isEditable =
        tagName === 'input' ||
        tagName === 'textarea' ||
        target.isContentEditable;

      for (const hotkey of hotkeys) {
        // Si está deshabilitado, saltar
        if (hotkey.enabled === false) continue;

        // Verificar si la tecla coincide
        const keyMatch =
          event.key.toLowerCase() === hotkey.key.toLowerCase() ||
          event.code.toLowerCase() === hotkey.key.toLowerCase();

        // Verificar modificadores
        const ctrlMatch = hotkey.ctrl ? event.ctrlKey : !event.ctrlKey;
        const altMatch = hotkey.alt ? event.altKey : !event.altKey;
        const shiftMatch = hotkey.shift ? event.shiftKey : !event.shiftKey;
        const metaMatch = hotkey.meta ? event.metaKey : !event.metaKey;

        const modifiersMatch = ctrlMatch && altMatch && shiftMatch && metaMatch;

        if (keyMatch && modifiersMatch) {
          // Si es un input editable y no hay modificadores especiales, permitir comportamiento por defecto
          if (isEditable && !hotkey.ctrl && !hotkey.alt && !hotkey.meta) {
            continue;
          }

          // Prevenir comportamiento por defecto si se especifica
          if (hotkey.preventDefault !== false) {
            event.preventDefault();
            event.stopPropagation();
          }

          // Ejecutar el handler
          handlerRef.current(event);
          break;
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hotkeys, ...dependencies]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
};

/**
 * Hook simplificado para un solo atajo de teclado
 */
export const useHotkey = (
  key: string,
  handler: HotkeyHandler,
  options: Omit<HotkeyConfig, 'key'> = {},
  dependencies: any[] = []
) => {
  const hotkey: HotkeyConfig = {
    key,
    ...options,
  };

  useHotkeys([hotkey], handler, dependencies);
};

/**
 * Utilidad para formatear una combinación de teclas como string
 */
export const formatHotkey = (hotkey: HotkeyConfig): string => {
  const parts: string[] = [];

  if (hotkey.ctrl) parts.push('Ctrl');
  if (hotkey.alt) parts.push('Alt');
  if (hotkey.shift) parts.push('Shift');
  if (hotkey.meta) parts.push('Cmd');

  // Formatear la tecla principal
  const mainKey = hotkey.key.length === 1
    ? hotkey.key.toUpperCase()
    : hotkey.key.replace(/^f(\d+)$/i, 'F$1'); // F1-F12

  parts.push(mainKey);

  return parts.join('+');
};

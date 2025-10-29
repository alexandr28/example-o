// src/hooks/useKeyPress.ts
import { useEffect, useState } from 'react';

interface KeyPressOptions {
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
}

/**
 * Hook para detectar cuando se presiona una tecla específica
 * @param targetKey - La tecla a detectar (ej: 'Enter', 'Escape', 'f')
 * @param options - Modificadores de tecla (ctrl, alt, shift, meta)
 * @returns boolean - true si la tecla está presionada
 */
export const useKeyPress = (
  targetKey: string,
  options: KeyPressOptions = {}
): boolean => {
  const [keyPressed, setKeyPressed] = useState(false);

  useEffect(() => {
    const downHandler = (event: KeyboardEvent) => {
      const { ctrlKey = false, altKey = false, shiftKey = false, metaKey = false } = options;

      // Verificar si la tecla coincide
      const keyMatch = event.key.toLowerCase() === targetKey.toLowerCase();

      // Verificar modificadores
      const modifiersMatch =
        event.ctrlKey === ctrlKey &&
        event.altKey === altKey &&
        event.shiftKey === shiftKey &&
        event.metaKey === metaKey;

      if (keyMatch && modifiersMatch) {
        setKeyPressed(true);
      }
    };

    const upHandler = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === targetKey.toLowerCase()) {
        setKeyPressed(false);
      }
    };

    window.addEventListener('keydown', downHandler);
    window.addEventListener('keyup', upHandler);

    return () => {
      window.removeEventListener('keydown', downHandler);
      window.removeEventListener('keyup', upHandler);
    };
  }, [targetKey, options.ctrlKey, options.altKey, options.shiftKey, options.metaKey]);

  return keyPressed;
};

// src/components/debug/PropDebugger.tsx
import React from 'react';

interface PropDebuggerProps {
  componentName: string;
  props: Record<string, any>;
  showInProduction?: boolean;
}

/**
 * Componente para depurar props problemáticas
 * Identifica props booleanas que pueden causar el error
 */
const PropDebugger: React.FC<PropDebuggerProps> = ({ 
  componentName, 
  props, 
  showInProduction = false 
}) => {
  // Solo mostrar en desarrollo a menos que se especifique lo contrario
  if (process.env.NODE_ENV === 'production' && !showInProduction) {
    return null;
  }

  // Detectar props problemáticas
  const problematicProps = Object.entries(props).filter(([key, value]) => {
    // Props booleanas que pueden causar problemas en elementos DOM
    if (typeof value === 'boolean' && value === false) {
      // Lista de props HTML válidas que pueden ser booleanas
      const validBooleanProps = [
        'disabled', 'hidden', 'checked', 'selected', 'readonly', 
        'required', 'autofocus', 'multiple', 'draggable', 'spellcheck'
      ];
      
      // Si no es una prop HTML válida, es problemática
      return !validBooleanProps.includes(key.toLowerCase());
    }
    return false;
  });

  if (problematicProps.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-20 right-4 bg-red-100 border-2 border-red-300 rounded-lg p-4 max-w-md z-50">
      <h4 className="text-red-800 font-bold mb-2">
        ⚠️ Props problemáticas en {componentName}
      </h4>
      <div className="text-xs space-y-1">
        {problematicProps.map(([key, value]) => (
          <div key={key} className="bg-red-200 p-1 rounded">
            <span className="font-mono">{key}</span>: 
            <span className="font-mono ml-1">{String(value)}</span>
            <span className="text-red-600 ml-2">(false no permitido)</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-red-700 mt-2">
        Estas props están causando el error "Received false for a non-boolean attribute"
      </p>
    </div>
  );
};

/**
 * HOC para depurar props de cualquier componente
 */
export function withPropDebugger<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
): React.FC<P> {
  return (props: P) => {
    return (
      <>
        <PropDebugger 
          componentName={componentName} 
          props={props as Record<string, any>} 
        />
        <Component {...props} />
      </>
    );
  };
}

export default PropDebugger;
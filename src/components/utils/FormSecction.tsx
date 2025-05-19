import React, { FC, memo, ReactNode } from 'react';

interface FormSectionProps {
  title: string;
  children: ReactNode;
  debug?: ReactNode;
}

/**
 * Componente para secciones de formulario con título y contenido
 * 
 * Proporciona un estilo consistente para las distintas secciones de formulario
 */
const FormSection: FC<FormSectionProps> = memo(({ title, children, debug }) => {
  return (
    <section className="bg-white rounded-md shadow-sm overflow-hidden">
      <header className="px-6 py-4 bg-gray-50 border-b">
        <h2 className="text-lg font-medium text-gray-800">{title}</h2>
        {debug && <div className="text-xs text-gray-500 mt-1">{debug}</div>}
      </header>
      <div className="p-6">
        {children}
      </div>
    </section>
  );
});

// Nombre para DevTools
FormSection.displayName = 'FormSection';

export default FormSection;
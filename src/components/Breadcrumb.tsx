import React, { FC, memo } from 'react';

export interface BreadcrumbItem {
  label: string;
  path?: string;
  active?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

/**
 * Componente de navegación de migas de pan
 * 
 * Muestra la jerarquía de navegación y la ubicación actual
 */
const Breadcrumb: FC<BreadcrumbProps> = memo(({ items }) => {
  return (
    <nav className="mb-8" aria-label="Breadcrumb">
      <ol className="flex items-center text-sm">
        {items.map((item, index) => (
          <React.Fragment key={item.label}>
            <li className={item.active ? "text-gray-900 font-medium" : "text-gray-600"}>
              {item.path ? (
                <a href={item.path} className="hover:underline">
                  {item.label}
                </a>
              ) : (
                item.label
              )}
            </li>
            {index < items.length - 1 && <li className="mx-2">/</li>}
          </React.Fragment>
        ))}
      </ol>
    </nav>
  );
});

// Nombre para DevTools
Breadcrumb.displayName = 'Breadcrumb';

export default Breadcrumb;
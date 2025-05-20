import React from 'react';

interface CorsErrorMessageProps {
  onReload: () => void;
}

const CorsErrorMessage: React.FC<CorsErrorMessageProps> = ({ onReload }) => {
  return (
    <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mb-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm leading-5 font-medium text-orange-800">
            Problema de acceso al servidor
          </h3>
          <div className="mt-2 text-sm leading-5 text-orange-700">
            <p>
              La aplicación está funcionando en modo offline porque no puede conectarse con el servidor API en <strong>http://localhost:8080/api/via</strong>. 
              Los cambios que realices se guardarán localmente.
            </p>
            <p className="mt-2">
              Posibles soluciones:
            </p>
            <ul className="list-disc list-inside mt-1">
              <li>Verifica que el servidor API esté en ejecución en el puerto 8080</li>
              <li>Asegúrate que el servidor tenga CORS habilitado</li>
              <li>Confirma que la ruta /api/via está disponible en el servidor</li>
            </ul>
            <button
              className="mt-3 px-3 py-1 bg-orange-200 text-orange-800 rounded"
              onClick={onReload}
            >
              Intentar reconectar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CorsErrorMessage;
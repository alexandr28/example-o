// src/components/utils/FormErrorBoundary.tsx - ERROR BOUNDARY ESPECÍFICO PARA FORMULARIOS
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface FormErrorBoundaryProps {
  children: ReactNode;
  formName?: string;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface FormErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class FormErrorBoundary extends Component<FormErrorBoundaryProps, FormErrorBoundaryState> {
  constructor(props: FormErrorBoundaryProps) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<FormErrorBoundaryState> {
    return { 
      hasError: true, 
      error 
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error(`❌ [FormErrorBoundary] Error en formulario ${this.props.formName}:`, error);
    console.error('Error info:', errorInfo);
    
    this.setState({
      errorInfo
    });
    
    // Llamar callback personalizado si existe
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  private handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
  };

  private handleReload = () => {
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-red-800">
                Error en el formulario {this.props.formName || ''}
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>
                  Se produjo un error inesperado al cargar o procesar el formulario. 
                  Esto puede deberse a datos inconsistentes o problemas de conectividad.
                </p>
                
                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <details className="mt-3 bg-red-100 p-3 rounded border">
                    <summary className="cursor-pointer font-medium">
                      🔧 Detalles técnicos (desarrollo)
                    </summary>
                    <div className="mt-2 font-mono text-xs overflow-x-auto">
                      <div className="text-red-900 font-bold">Error:</div>
                      <div className="mb-2">{this.state.error.message}</div>
                      
                      {this.state.error.stack && (
                        <>
                          <div className="text-red-900 font-bold">Stack Trace:</div>
                          <pre className="whitespace-pre-wrap text-xs">
                            {this.state.error.stack}
                          </pre>
                        </>
                      )}
                      
                      {this.state.errorInfo && (
                        <>
                          <div className="text-red-900 font-bold mt-2">Component Stack:</div>
                          <pre className="whitespace-pre-wrap text-xs">
                            {this.state.errorInfo.componentStack}
                          </pre>
                        </>
                      )}
                    </div>
                  </details>
                )}
              </div>
              
              <div className="mt-4 flex space-x-3">
                <button
                  onClick={this.handleRetry}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <svg className="-ml-0.5 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reintentar
                </button>
                
                <button
                  onClick={this.handleReload}
                  className="inline-flex items-center px-3 py-2 border border-red-300 text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <svg className="-ml-0.5 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Recargar página
                </button>
              </div>
              
              <div className="mt-3 text-xs text-red-600">
                💡 <strong>Sugerencias:</strong>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Verifique su conexión a internet</li>
                  <li>Actualice la página y vuelva a intentar</li>
                  <li>Si el problema persiste, contacte al administrador del sistema</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default FormErrorBoundary;
// src/components/calles/CalleFormWrapper.tsx - WRAPPER SEGURO
import React, { useState, useEffect } from 'react';
import CalleForm from './CalleForm';
import FormErrorBoundary from '../utils/FormErrorBoundary';
import { Calle, Sector, Barrio, TipoViaOption } from '../../models/';

interface CalleFormWrapperProps {
  calleSeleccionada?: Calle | null;
  sectores: Sector[];
  barrios: Barrio[];
  barriosFiltrados: Barrio[];
  tiposVia: TipoViaOption[];
  onGuardar: (data: { sectorId: number; barrioId: number; tipoVia: string; nombre: string }) => void;
  onNuevo: () => void;
  onEditar: () => void;
  onSectorChange: (sectorId: number) => void;
  loading?: boolean;
  loadingSectores?: boolean;
  loadingBarrios?: boolean;
  loadingTiposVia?: boolean;
  isEditMode?: boolean;
  isOfflineMode?: boolean;
}

const CalleFormWrapper: React.FC<CalleFormWrapperProps> = (props) => {
  const [hasError, setHasError] = useState(false);
  const [errorKey, setErrorKey] = useState(0);

  // Reset error cuando cambian las props principales
  useEffect(() => {
    if (hasError) {
      console.log('🔄 [CalleFormWrapper] Props cambiaron, reseteando error');
      setHasError(false);
      setErrorKey(prev => prev + 1);
    }
  }, [props.calleSeleccionada, props.isEditMode, hasError]);

  // Validar que las props no tengan valores problemáticos
  const validateProps = () => {
    try {
      // Verificar sectores
      if (!Array.isArray(props.sectores)) {
        console.error('❌ [CalleFormWrapper] sectores no es un array:', props.sectores);
        return false;
      }

      // Verificar barrios
      if (!Array.isArray(props.barrios)) {
        console.error('❌ [CalleFormWrapper] barrios no es un array:', props.barrios);
        return false;
      }

      // Verificar barriosFiltrados
      if (!Array.isArray(props.barriosFiltrados)) {
        console.error('❌ [CalleFormWrapper] barriosFiltrados no es un array:', props.barriosFiltrados);
        return false;
      }

      // Verificar tiposVia
      if (!Array.isArray(props.tiposVia)) {
        console.error('❌ [CalleFormWrapper] tiposVia no es un array:', props.tiposVia);
        return false;
      }

      // Verificar calleSeleccionada si existe
      if (props.calleSeleccionada !== null && props.calleSeleccionada !== undefined) {
        if (typeof props.calleSeleccionada !== 'object') {
          console.error('❌ [CalleFormWrapper] calleSeleccionada no es un objeto:', props.calleSeleccionada);
          return false;
        }

        // Verificar campos críticos
        if (props.calleSeleccionada.sectorId !== null && props.calleSeleccionada.sectorId !== undefined) {
          if (typeof props.calleSeleccionada.sectorId !== 'number') {
            console.error('❌ [CalleFormWrapper] sectorId no es un número:', props.calleSeleccionada.sectorId);
            return false;
          }
        }

        if (props.calleSeleccionada.barrioId !== null && props.calleSeleccionada.barrioId !== undefined) {
          if (typeof props.calleSeleccionada.barrioId !== 'number') {
            console.error('❌ [CalleFormWrapper] barrioId no es un número:', props.calleSeleccionada.barrioId);
            return false;
          }
        }
      }

      return true;
    } catch (error) {
      console.error('❌ [CalleFormWrapper] Error al validar props:', error);
      return false;
    }
  };

  // Manejo de errores
  const handleError = (error: Error, errorInfo: any) => {
    console.error('🚨 [CalleFormWrapper] Error capturado:', error, errorInfo);
    setHasError(true);
  };

  // Wrapper seguro para las funciones
  const safeOnGuardar = (data: { sectorId: number; barrioId: number; tipoVia: string; nombre: string }) => {
    try {
      console.log('💾 [CalleFormWrapper] Guardando datos:', data);
      
      // Validación adicional
      if (!data || typeof data !== 'object') {
        throw new Error('Datos inválidos para guardar');
      }

      if (!data.sectorId || data.sectorId <= 0) {
        throw new Error('Sector ID inválido');
      }

      if (!data.barrioId || data.barrioId <= 0) {
        throw new Error('Barrio ID inválido');
      }

      if (!data.tipoVia || typeof data.tipoVia !== 'string' || data.tipoVia.trim() === '') {
        throw new Error('Tipo de vía inválido');
      }

      if (!data.nombre || typeof data.nombre !== 'string' || data.nombre.trim() === '') {
        throw new Error('Nombre inválido');
      }

      props.onGuardar(data);
    } catch (error) {
      console.error('❌ [CalleFormWrapper] Error en onGuardar:', error);
      setHasError(true);
      throw error;
    }
  };

  const safeOnNuevo = () => {
    try {
      console.log('🆕 [CalleFormWrapper] Ejecutando onNuevo');
      props.onNuevo();
    } catch (error) {
      console.error('❌ [CalleFormWrapper] Error en onNuevo:', error);
      setHasError(true);
    }
  };

  const safeOnEditar = () => {
    try {
      console.log('📝 [CalleFormWrapper] Ejecutando onEditar');
      props.onEditar();
    } catch (error) {
      console.error('❌ [CalleFormWrapper] Error en onEditar:', error);
      setHasError(true);
    }
  };

  const safeOnSectorChange = (sectorId: number) => {
    try {
      console.log('🔄 [CalleFormWrapper] Cambiando sector:', sectorId);
      
      if (typeof sectorId !== 'number') {
        console.warn('⚠️ [CalleFormWrapper] sectorId no es número, convirtiendo:', sectorId);
        sectorId = Number(sectorId) || 0;
      }
      
      props.onSectorChange(sectorId);
    } catch (error) {
      console.error('❌ [CalleFormWrapper] Error en onSectorChange:', error);
      setHasError(true);
    }
  };

  // Validar props antes de renderizar
  if (!validateProps()) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-md">
        <h3 className="text-lg font-medium text-red-800 mb-2">Error en la Configuración del Formulario</h3>
        <p className="text-sm text-red-600 mb-4">
          Los datos necesarios para el formulario no están disponibles o son inválidos.
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Recargar Página
        </button>
      </div>
    );
  }

  // Si hay error, mostrar interfaz de error
  if (hasError) {
    return (
      <div className="p-6 bg-orange-50 border border-orange-200 rounded-md">
        <h3 className="text-lg font-medium text-orange-800 mb-2">El Formulario Necesita Reiniciarse</h3>
        <p className="text-sm text-orange-600 mb-4">
          Se detectó un problema con el formulario. Haz clic en "Reiniciar" para intentar nuevamente.
        </p>
        <div className="flex space-x-2">
          <button 
            onClick={() => {
              setHasError(false);
              setErrorKey(prev => prev + 1);
              safeOnNuevo();
            }}
            className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
          >
            🔄 Reiniciar Formulario
          </button>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            🔃 Recargar Página
          </button>
        </div>
      </div>
    );
  }

  return (
    <FormErrorBoundary onError={handleError}>
      <CalleForm
        key={errorKey} // ✅ Forzar re-mount en caso de error
        calleSeleccionada={props.calleSeleccionada}
        sectores={props.sectores}
        barrios={props.barrios}
        barriosFiltrados={props.barriosFiltrados}
        tiposVia={props.tiposVia}
        onGuardar={safeOnGuardar}
        onNuevo={safeOnNuevo}
        onEditar={safeOnEditar}
        onSectorChange={safeOnSectorChange}
        loading={props.loading}
        loadingSectores={props.loadingSectores}
        loadingBarrios={props.loadingBarrios}
        loadingTiposVia={props.loadingTiposVia}
        isEditMode={props.isEditMode}
        isOfflineMode={props.isOfflineMode}
      />
    </FormErrorBoundary>
  );
};

export default CalleFormWrapper;
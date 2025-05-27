// src/components/calles/CalleForm.tsx - ACTUALIZADO CON SELECT TIPOVIA INTEGRADO
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input, Select, Button } from '../';
import { Calle, CalleFormData, TipoViaOption, isValidTipoVia } from '../../models/Calle';

// Schema de validación actualizado
const calleSchema = z.object({
  tipoVia: z.string()
    .min(1, 'Debe seleccionar un tipo de vía')
    .refine(isValidTipoVia, 'Tipo de vía no válido'),
  nombre: z.string()
    .min(2, 'El nombre de la calle debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder los 100 caracteres')
    .refine(val => val.trim().length >= 2, 'El nombre no puede estar vacío o contener solo espacios'),
});

type CalleFormDataValidated = z.infer<typeof calleSchema>;

interface CalleFormProps {
  calleSeleccionada?: Calle | null;
  tiposVia: TipoViaOption[]; // NUEVO: opciones de tipo de vía desde el hook
  loadingTiposVia?: boolean; // NUEVO: estado de carga de tipos de vía
  onGuardar: (data: CalleFormData) => void;
  onNuevo: () => void;
  onEditar: () => void;
  onCargarTiposVia?: () => void; // NUEVO: función para recargar tipos de vía
  loading?: boolean;
}

const CalleForm: React.FC<CalleFormProps> = ({
  calleSeleccionada,
  tiposVia,
  loadingTiposVia = false,
  onGuardar,
  onNuevo,
  onEditar,
  onCargarTiposVia,
  loading = false,
}) => {
  const { 
    register, 
    handleSubmit, 
    formState: { errors, isDirty, isValid }, 
    reset, 
    setValue,
    watch
  } = useForm<CalleFormDataValidated>({
    resolver: zodResolver(calleSchema),
    defaultValues: {
      tipoVia: '',
      nombre: '',
    },
    mode: 'onChange'
  });

  // Estados para controlar el modo de formulario
  const [modoFormulario, setModoFormulario] = useState<'nuevo' | 'editar' | 'ver'>('nuevo');
  const [showTipoViaDebug, setShowTipoViaDebug] = useState(false);

  // Watch para el tipo de vía seleccionado
  const tipoViaSeleccionado = watch('tipoVia');

  // Debug en desarrollo
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🎨 [CalleForm] Tipos de vía disponibles:', tiposVia);
      console.log('🎨 [CalleForm] Loading tipos:', loadingTiposVia);
      console.log('🎨 [CalleForm] Tipo seleccionado:', tipoViaSeleccionado);
    }
  }, [tiposVia, loadingTiposVia, tipoViaSeleccionado]);

  // Actualizar el formulario cuando se selecciona una calle para editar
  useEffect(() => {
    if (calleSeleccionada) {
      console.log('🎨 [CalleForm] Cargando calle para edición:', calleSeleccionada);
      
      setValue('tipoVia', calleSeleccionada.tipoVia);
      setValue('nombre', calleSeleccionada.nombre);
      setModoFormulario('ver');
    } else {
      console.log('🎨 [CalleForm] Limpiando formulario');
      reset();
      setModoFormulario('nuevo');
    }
  }, [calleSeleccionada, setValue, reset]);

  const onSubmit = (data: CalleFormDataValidated) => {
    console.log('🎨 [CalleForm] Enviando datos:', data);
    onGuardar(data);
    reset();
    setModoFormulario('nuevo');
  };

  const handleNuevo = () => {
    reset();
    onNuevo();
    setModoFormulario('nuevo');
  };

  const handleEditarClick = () => {
    setModoFormulario('editar');
    onEditar();
  };

  const handleCancelar = () => {
    if (calleSeleccionada) {
      // Si estábamos editando, volver al modo visualización
      setValue('tipoVia', calleSeleccionada.tipoVia);
      setValue('nombre', calleSeleccionada.nombre);
      setModoFormulario('ver');
    } else {
      // Si estábamos creando, limpiar el formulario
      reset();
      setModoFormulario('nuevo');
    }
  };

  // Función para manejar recarga de tipos de vía
  const handleRecargarTiposVia = () => {
    if (onCargarTiposVia) {
      console.log('🔄 [CalleForm] Recargando tipos de vía...');
      onCargarTiposVia();
    }
  };

  // Preparar opciones para el Select
  const tipoViaOptions = tiposVia.map(tipo => ({
    value: tipo.value,
    label: tipo.label
  }));

  return (
    <div className="bg-white rounded-md shadow-sm overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-medium text-gray-800">
            {modoFormulario === 'nuevo' ? 'Nueva calle' : 
             modoFormulario === 'editar' ? 'Editar calle' : 'Detalles de calle'}
          </h2>
          
          {/* Indicador de carga de tipos de vía */}
          {loadingTiposVia && (
            <div className="flex items-center text-sm text-blue-600">
              <svg className="animate-spin h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Cargando tipos de vía...
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Botón para recargar tipos de vía */}
          {onCargarTiposVia && (
            <button
              type="button"
              onClick={handleRecargarTiposVia}
              disabled={loadingTiposVia}
              className="text-blue-600 hover:text-blue-800 text-sm px-2 py-1 rounded border border-blue-200 hover:bg-blue-50 disabled:opacity-50"
            >
              🔄 Recargar tipos
            </button>
          )}
          
          {/* Debug en desarrollo */}
          {process.env.NODE_ENV === 'development' && (
            <button
              type="button"
              onClick={() => setShowTipoViaDebug(!showTipoViaDebug)}
              className="text-gray-600 hover:text-gray-800 text-sm px-2 py-1 rounded border border-gray-200 hover:bg-gray-50"
            >
              🔧 Debug
            </button>
          )}
          
          {/* ID de la calle en modo ver */}
          {modoFormulario === 'ver' && calleSeleccionada && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md">
              ID: {calleSeleccionada.id}
            </span>
          )}
        </div>
      </div>

      {/* Panel de debug */}
      {showTipoViaDebug && process.env.NODE_ENV === 'development' && (
        <div className="px-6 py-3 bg-gray-800 text-green-400 text-xs">
          <div className="space-y-1">
            <div>🔧 Debug - Tipos de Vía:</div>
            <div>📊 Total tipos: {tiposVia.length}</div>
            <div>🔄 Loading: {loadingTiposVia ? 'Sí' : 'No'}</div>
            <div>🎯 Seleccionado: {tipoViaSeleccionado || 'Ninguno'}</div>
            <div>📋 Opciones: {tipoViaOptions.map(opt => `${opt.value}:${opt.label}`).join(', ')}</div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Select de Tipo de Vía INTEGRADO */}
          <div className="relative">
            <Select
              label="Tipo de vía"
              options={tipoViaOptions}
              error={errors.tipoVia?.message}
              disabled={loading || modoFormulario === 'ver' || loadingTiposVia}
              placeholder={loadingTiposVia ? "Cargando tipos..." : "Seleccione tipo de vía"}
              {...register('tipoVia')}
            />
            
            {/* Indicador visual si hay pocos tipos disponibles */}
            {tiposVia.length < 3 && !loadingTiposVia && (
              <div className="mt-1 text-xs text-yellow-600">
                ⚠️ Pocos tipos disponibles ({tiposVia.length}). 
                {onCargarTiposVia && (
                  <button 
                    type="button" 
                    onClick={handleRecargarTiposVia}
                    className="ml-1 underline hover:no-underline"
                  >
                    Recargar
                  </button>
                )}
              </div>
            )}
            
            {/* Preview del tipo seleccionado */}
            {tipoViaSeleccionado && (
              <div className="mt-1 text-xs text-gray-500">
                Formato: {tiposVia.find(t => t.value === tipoViaSeleccionado)?.descripcion || tipoViaSeleccionado}
              </div>
            )}
          </div>
          
          <Input
            label="Nombre"
            error={errors.nombre?.message}
            disabled={loading || modoFormulario === 'ver'}
            placeholder="Ingrese nombre de la vía"
            {...register('nombre')}
          />
        </div>
        
        {/* Preview de la calle completa */}
        {tipoViaSeleccionado && watch('nombre') && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="text-sm text-blue-700">
              <span className="font-medium">Vista previa:</span>
              <span className="ml-2">
                {tiposVia.find(t => t.value === tipoViaSeleccionado)?.descripcion || tipoViaSeleccionado} {watch('nombre')}
              </span>
            </div>
          </div>
        )}
        
        {/* Información adicional en modo ver */}
        {modoFormulario === 'ver' && calleSeleccionada && (
          <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
            <div className="text-sm text-gray-600 space-y-1">
              <div><span className="font-medium">ID:</span> {calleSeleccionada.id}</div>
              {calleSeleccionada.codTipoVia && (
                <div><span className="font-medium">Código tipo vía:</span> {calleSeleccionada.codTipoVia}</div>
              )}
              {calleSeleccionada.descripTipoVia && (
                <div><span className="font-medium">Descripción API:</span> {calleSeleccionada.descripTipoVia}</div>
              )}
              {calleSeleccionada.nombreVia && (
                <div><span className="font-medium">Nombre API:</span> {calleSeleccionada.nombreVia}</div>
              )}
              {calleSeleccionada.fechaCreacion && (
                <div><span className="font-medium">Creado:</span> {new Date(calleSeleccionada.fechaCreacion).toLocaleString()}</div>
              )}
            </div>
          </div>
        )}
        
        <div className="flex justify-center space-x-4 mt-6">
          {modoFormulario === 'nuevo' && (
            <Button 
              type="submit" 
              variant="primary"
              disabled={loading || !isDirty || !isValid || loadingTiposVia}
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Guardando...</span>
                </div>
              ) : "Guardar"}
            </Button>
          )}
          
          {modoFormulario === 'editar' && (
            <>
              <Button 
                type="submit" 
                variant="primary"
                disabled={loading || !isDirty || !isValid || loadingTiposVia}
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Actualizando...</span>
                  </div>
                ) : "Actualizar"}
              </Button>
              
              <Button
                type="button"
                variant="secondary"
                onClick={handleCancelar}
                disabled={loading}
              >
                Cancelar
              </Button>
            </>
          )}
          
          {modoFormulario === 'ver' && (
            <Button
              type="button"
              variant="primary"
              onClick={handleEditarClick}
              disabled={loading || loadingTiposVia}
            >
              Editar
            </Button>
          )}
          
          <Button
            type="button"
            variant="secondary"
            onClick={handleNuevo}
            disabled={loading || loadingTiposVia}
          >
            {modoFormulario === 'ver' ? 'Nueva calle' : 'Limpiar formulario'}
          </Button>
        </div>

        {/* Información de ayuda */}
        {modoFormulario === 'nuevo' && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <div className="text-sm text-green-700">
              <div className="font-medium mb-1">💡 Consejos:</div>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Seleccione primero el tipo de vía (Avenida, Calle, Jirón, etc.)</li>
                <li>Ingrese solo el nombre sin incluir el tipo (ej: "Gran Chimú" no "Av. Gran Chimú")</li>
                <li>El sistema combinará automáticamente el tipo con el nombre</li>
                <li>Use la vista previa para verificar cómo se verá la calle completa</li>
              </ul>
            </div>
          </div>
        )}

        {/* Debug de validación en desarrollo */}
        {process.env.NODE_ENV === 'development' && showTipoViaDebug && (
          <div className="mt-4 p-3 bg-gray-800 text-green-400 text-xs rounded">
            <div className="space-y-1">
              <div>🔧 Estado del formulario:</div>
              <div>📊 isDirty: {isDirty ? 'Sí' : 'No'}</div>
              <div>✅ isValid: {isValid ? 'Sí' : 'No'}</div>
              <div>🎯 Tipo vía válido: {tipoViaSeleccionado ? isValidTipoVia(tipoViaSeleccionado) ? 'Sí' : 'No' : 'N/A'}</div>
              <div>📝 Nombre longitud: {watch('nombre')?.length || 0}</div>
              <div>❌ Errores: {Object.keys(errors).length > 0 ? JSON.stringify(errors, null, 2) : 'Ninguno'}</div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default CalleForm;
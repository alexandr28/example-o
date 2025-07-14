// src/components/calles/CalleForm.tsx
import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Input from '../ui/Input';
import Button from '../ui/Button';
import SearchableSelect from '../ui/SearchableSelect';
import { CalleFormData } from '../../models/Calle';
import { useBarrios } from '../../hooks/useBarrios';
import { buildApiUrl } from '../../config/api.unified.config';

// Esquema de validación
const schema = yup.object().shape({
  tipoVia: yup
    .number()
    .positive('Debe seleccionar un tipo de vía')
    .required('El tipo de vía es requerido')
    .typeError('Debe seleccionar un tipo de vía válido'),
  codSector: yup
    .number()
    .positive('Debe seleccionar un sector')
    .required('El sector es requerido')
    .typeError('Debe seleccionar un sector válido'),
  codBarrio: yup
    .number()
    .positive('Debe seleccionar un barrio')
    .required('El barrio es requerido')
    .typeError('Debe seleccionar un barrio válido'),
  nombreCalle: yup
    .string()
    .trim()
    .required('El nombre de la calle es requerido')
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
});

interface CalleFormProps {
  onSubmit: (data: CalleFormData) => void | Promise<void>;
  onCancel: () => void;
  initialData?: Partial<CalleFormData>;
  isSubmitting?: boolean;
}

interface TipoViaOption {
  codConstante: number;
  nombre: string;
  descripcion?: string;
}

const CalleForm: React.FC<CalleFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isSubmitting = false
}) => {
  // Estados
  const [tiposVia, setTiposVia] = useState<TipoViaOption[]>([]);
  const [loadingTiposVia, setLoadingTiposVia] = useState(false);
  const [sectores, setSectores] = useState<any[]>([]);
  const [barriosFiltrados, setBarriosFiltrados] = useState<any[]>([]);
  
  // Hook para barrios
  const { barrios } = useBarrios();
  
  // Configurar react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    watch,
    setValue
  } = useForm<CalleFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      tipoVia: initialData?.tipoVia || 0,
      codSector: initialData?.codSector || 0,
      codBarrio: initialData?.codBarrio || 0,
      nombreCalle: initialData?.nombreCalle || ''
    }
  });

  // Observar cambios en sector para filtrar barrios
  const selectedSector = watch('codSector');

  // Cargar tipos de vía desde la API
  useEffect(() => {
    const cargarTiposVia = async () => {
      setLoadingTiposVia(true);
      try {
        // Construir URL con parámetros
        const params = new URLSearchParams();
        params.append('codConstante', '38');
        
        const url = buildApiUrl('/api/constante/listarConstantePadre') + '?' + params.toString();
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error('Error al cargar tipos de vía');
        }
        
        const data = await response.json();
        console.log('Tipos de vía cargados:', data);
        
        // Adaptar la respuesta según la estructura de la API
        if (Array.isArray(data)) {
          setTiposVia(data);
        } else if (data.data && Array.isArray(data.data)) {
          setTiposVia(data.data);
        }
        
      } catch (error) {
        console.error('Error cargando tipos de vía:', error);
      } finally {
        setLoadingTiposVia(false);
      }
    };
    
    cargarTiposVia();
  }, []);

  // Cargar sectores únicos desde los barrios
  useEffect(() => {
    if (barrios && barrios.length > 0) {
      // Extraer sectores únicos de los barrios
      const sectoresUnicos = Array.from(
        new Map(
          barrios
            .filter(b => b.codSector)
            .map(b => [b.codSector, { id: b.codSector, nombre: `Sector ${b.codSector}` }])
        ).values()
      );
      setSectores(sectoresUnicos);
    }
  }, [barrios]);

  // Filtrar barrios cuando cambie el sector
  useEffect(() => {
    if (selectedSector && barrios) {
      const barriosDelSector = barrios.filter(b => b.codSector === selectedSector);
      setBarriosFiltrados(barriosDelSector);
      
      // Limpiar selección de barrio si no pertenece al sector
      const barrioActual = watch('codBarrio');
      if (barrioActual && !barriosDelSector.find(b => b.id === barrioActual)) {
        setValue('codBarrio', 0);
      }
    } else {
      setBarriosFiltrados([]);
    }
  }, [selectedSector, barrios, setValue, watch]);

  // Manejar envío del formulario
  const onFormSubmit = async (data: CalleFormData) => {
    try {
      console.log('📤 [CalleForm] Enviando datos:', data);
      await onSubmit(data);
    } catch (error) {
      console.error('❌ [CalleForm] Error al enviar:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-3">
      {/* Tipo de Vía */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Tipo de Vía <span className="text-red-500">*</span>
        </label>
        <Controller
          name="tipoVia"
          control={control}
          render={({ field }) => (
            <SearchableSelect
              value={field.value}
              onChange={(value) => field.onChange(Number(value))}
              onBlur={field.onBlur}
              options={tiposVia.map(tipo => ({
                value: tipo.codConstante,
                label: tipo.nombre
              }))}
              placeholder="Buscar tipo de vía..."
              error={errors.tipoVia?.message}
              disabled={isSubmitting || loadingTiposVia}
              required
              className="h-9 text-sm"
            />
          )}
        />
      </div>

      {/* Sector */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Sector <span className="text-red-500">*</span>
        </label>
        <Controller
          name="codSector"
          control={control}
          render={({ field }) => (
            <SearchableSelect
              value={field.value}
              onChange={(value) => field.onChange(Number(value))}
              onBlur={field.onBlur}
              options={sectores.map(sector => ({
                value: sector.id,
                label: sector.nombre
              }))}
              placeholder="Pueblo Libre"
              error={errors.codSector?.message}
              disabled={isSubmitting || sectores.length === 0}
              required
              className="h-9 text-sm"
            />
          )}
        />
      </div>

      {/* Barrio */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Barrio <span className="text-red-500">*</span>
        </label>
        <Controller
          name="codBarrio"
          control={control}
          render={({ field }) => (
            <SearchableSelect
              value={field.value}
              onChange={(value) => field.onChange(Number(value))}
              onBlur={field.onBlur}
              options={barriosFiltrados.map(barrio => ({
                value: barrio.id,
                label: barrio.nombre
              }))}
              placeholder="Buscar barrio..."
              error={errors.codBarrio?.message}
              disabled={isSubmitting || !selectedSector || barriosFiltrados.length === 0}
              required
              className="h-9 text-sm"
            />
          )}
        />
        {selectedSector && barriosFiltrados.length === 0 && (
          <p className="text-xs text-gray-500 mt-1">
            No hay barrios en este sector
          </p>
        )}
      </div>

      {/* Nombre de la Calle */}
      <div>
        <label htmlFor="nombreCalle" className="block text-xs font-medium text-gray-700 mb-1">
          Nombre de la Calle <span className="text-red-500">*</span>
        </label>
        <Input
          id="nombreCalle"
          type="text"
          placeholder="Ingrese el nombre de la calle"
          {...register('nombreCalle')}
          error={errors.nombreCalle?.message}
          disabled={isSubmitting}
          className="h-9 text-sm"
        />
      </div>

      {/* Botones */}
      <div className="flex justify-between pt-2">
        <Button
          type="button"
          variant="primary"
          onClick={() => {/* Lógica para nuevo */}}
          disabled={isSubmitting}
          className="h-8 px-3 text-sm flex items-center gap-1"
        >
          <span className="text-lg">+</span> Nuevo
        </Button>
        
        <div className="flex space-x-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isSubmitting}
            className="h-8 px-3 text-sm flex items-center gap-1"
          >
            <span>✏️</span> Editar
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            className="h-8 px-3 text-sm flex items-center gap-1"
          >
            <span>💾</span> Guardar
          </Button>
        </div>
      </div>
    </form>
  );
};

export default CalleForm;
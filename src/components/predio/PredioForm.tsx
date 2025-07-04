// src/components/predio/PredioForm.tsx - Ejemplo actualizado
import React, { useState, useCallback, memo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useFormWrapper } from '../../hooks/useFormWrapper';
import FormSection from '../utils/FormSecction';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import CalendarInput from '../utils/CalendarInput';
import SelectorDirecciones from '../modal/SelectorDirecciones';
import { NotificationService } from '../utils/Notification';
import { Direccion } from '../../types/formTypes';

// Tipos para el formulario
interface PredioFormData {
  // Datos del predio
  anioAdquisicion: string;
  fechaAdquisicion: Date | null;
  condicionPropiedad: string;
  direccion: Direccion | null;
  nFinca: string;
  otroNumero: string;
  arancel: number;
  
  // Otros datos
  tipoPredio: string;
  conductor: string;
  usoPredio: string;
  areaTerreno: number;
  numeroPisos: number;
  numeroCondominos: number;
  
  // Imágenes
  rutaFotografiaPredio?: string;
  rutaPlanoPredio?: string;
}

// Opciones para los selects
const CONDICION_PROPIEDAD_OPTIONS = [
  { value: 'PROPIETARIO', label: 'Propietario' },
  { value: 'POSEEDOR', label: 'Poseedor' },
  { value: 'ARRENDATARIO', label: 'Arrendatario' },
  { value: 'USUFRUCTUARIO', label: 'Usufructuario' },
  { value: 'OTRO', label: 'Otro' }
];

const TIPO_PREDIO_OPTIONS = [
  { value: 'CASA_HABITACION', label: 'Casa Habitación' },
  { value: 'COMERCIO', label: 'Comercio' },
  { value: 'INDUSTRIA', label: 'Industria' },
  { value: 'TERRENO_SIN_CONSTRUIR', label: 'Terreno sin construir' },
  { value: 'OTROS', label: 'Otros' }
];

const CONDUCTOR_OPTIONS = [
  { value: 'PROPIETARIO', label: 'Propietario' },
  { value: 'INQUILINO', label: 'Inquilino' },
  { value: 'FAMILIAR', label: 'Familiar' },
  { value: 'OTRO', label: 'Otro' }
];

const USO_PREDIO_OPTIONS = [
  { value: 'VIVIENDA', label: 'Vivienda' },
  { value: 'COMERCIAL', label: 'Comercial' },
  { value: 'INDUSTRIAL', label: 'Industrial' },
  { value: 'SERVICIOS', label: 'Servicios' },
  { value: 'MIXTO', label: 'Mixto' },
  { value: 'BALDIO', label: 'Baldío' },
  { value: 'OTROS', label: 'Otros' }
];

/**
 * Formulario principal de registro de predio
 */
const PredioForm: React.FC = memo(() => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Inicializar react-hook-form
  const baseForm = useForm<PredioFormData>({
    defaultValues: {
      anioAdquisicion: '',
      fechaAdquisicion: null,
      condicionPropiedad: '',
      direccion: null,
      nFinca: '',
      otroNumero: '',
      arancel: 0,
      tipoPredio: '',
      conductor: '',
      usoPredio: '',
      areaTerreno: 0,
      numeroPisos: 1,
      numeroCondominos: 0,
    }
  });

  // Usar el wrapper para integrar con FormContext
  const form = useFormWrapper({
    formId: 'predio-form',
    form: baseForm
  });

  const { control, handleSubmit, setValue, watch, markSaved } = form;

  // Manejar el envío del formulario
  const onSubmit = async (data: PredioFormData) => {
    setIsSubmitting(true);
    try {
      console.log('Datos del formulario:', data);
      
      // Aquí iría la llamada a la API para guardar
      // await api.savePredio(data);
      
      // Simular guardado
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      NotificationService.success('Predio registrado exitosamente');
      
      // Marcar el formulario como guardado
      markSaved();
      
      // Navegar a la lista después de guardar
      navigate('/predio/consulta');
    } catch (error) {
      console.error('Error al guardar:', error);
      NotificationService.error('Error al registrar el predio');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manejar la selección de dirección
  const handleDireccionSelect = useCallback((direccion: Direccion) => {
    setValue('direccion', direccion, { shouldDirty: true });
    setIsModalOpen(false);
  }, [setValue]);

  // Observar el valor de la dirección
  const direccionSeleccionada = watch('direccion');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Sección: Datos del Predio */}
      <FormSection title="Datos del Predio">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Controller
            name="anioAdquisicion"
            control={control}
            rules={{ required: 'El año de adquisición es requerido' }}
            render={({ field, fieldState: { error } }) => (
              <Input
                {...field}
                label="Año de Adquisición"
                type="number"
                placeholder="2024"
                error={error?.message}
              />
            )}
          />

          <Controller
            name="fechaAdquisicion"
            control={control}
            rules={{ required: 'La fecha de adquisición es requerida' }}
            render={({ field, fieldState: { error } }) => (
              <CalendarInput
                {...field}
                label="Fecha de Adquisición"
                placeholder="Seleccione fecha"
                error={error?.message}
              />
            )}
          />

          <Controller
            name="condicionPropiedad"
            control={control}
            rules={{ required: 'La condición de propiedad es requerida' }}
            render={({ field, fieldState: { error } }) => (
              <Select
                {...field}
                label="Condición de Propiedad"
                options={CONDICION_PROPIEDAD_OPTIONS}
                placeholder="Seleccione condición"
                error={error?.message}
              />
            )}
          />

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dirección del Predio
            </label>
            <div className="flex gap-2">
              <Input
                value={direccionSeleccionada ? 
                  `${direccionSeleccionada.nombreCalle} ${direccionSeleccionada.numeracion || ''}` : 
                  ''
                }
                placeholder="Seleccione una dirección"
                readOnly
              />
              <Button
                type="button"
                onClick={() => setIsModalOpen(true)}
                variant="secondary"
              >
                Buscar
              </Button>
            </div>
          </div>

          <Controller
            name="nFinca"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                label="N° Finca"
                placeholder="Número de finca"
              />
            )}
          />
        </div>
      </FormSection>

      {/* Sección: Otros Datos */}
      <FormSection title="Otros Datos">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Controller
            name="tipoPredio"
            control={control}
            rules={{ required: 'El tipo de predio es requerido' }}
            render={({ field, fieldState: { error } }) => (
              <Select
                {...field}
                label="Tipo de Predio"
                options={TIPO_PREDIO_OPTIONS}
                placeholder="Seleccione tipo"
                error={error?.message}
              />
            )}
          />

          <Controller
            name="conductor"
            control={control}
            rules={{ required: 'El conductor es requerido' }}
            render={({ field, fieldState: { error } }) => (
              <Select
                {...field}
                label="Conductor"
                options={CONDUCTOR_OPTIONS}
                placeholder="Seleccione conductor"
                error={error?.message}
              />
            )}
          />

          <Controller
            name="usoPredio"
            control={control}
            rules={{ required: 'El uso del predio es requerido' }}
            render={({ field, fieldState: { error } }) => (
              <Select
                {...field}
                label="Uso del Predio"
                options={USO_PREDIO_OPTIONS}
                placeholder="Seleccione uso"
                error={error?.message}
              />
            )}
          />

          <Controller
            name="areaTerreno"
            control={control}
            rules={{ 
              required: 'El área del terreno es requerida',
              min: { value: 1, message: 'El área debe ser mayor a 0' }
            }}
            render={({ field, fieldState: { error } }) => (
              <Input
                {...field}
                label="Área del Terreno (m²)"
                type="number"
                placeholder="0.00"
                error={error?.message}
              />
            )}
          />

          <Controller
            name="numeroPisos"
            control={control}
            rules={{ 
              required: 'El número de pisos es requerido',
              min: { value: 1, message: 'Debe haber al menos 1 piso' }
            }}
            render={({ field, fieldState: { error } }) => (
              <Input
                {...field}
                label="Número de Pisos"
                type="number"
                placeholder="1"
                error={error?.message}
              />
            )}
          />

          <Controller
            name="numeroCondominos"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                label="Número de Condóminos"
                type="number"
                placeholder="0"
              />
            )}
          />
        </div>
      </FormSection>

      {/* Botones de acción */}
      <div className="flex justify-end gap-4 pt-6">
        <Button
          type="button"
          variant="secondary"
          onClick={() => navigate('/predio/consulta')}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Guardando...' : 'Guardar Predio'}
        </Button>
      </div>

      {/* Modal de selección de dirección */}
      <SelectorDirecciones
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleDireccionSelect}
        title="Seleccionar Dirección del Predio"
      />
    </form>
  );
});

PredioForm.displayName = 'PredioForm';

export default PredioForm;
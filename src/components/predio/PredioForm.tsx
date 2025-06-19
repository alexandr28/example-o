// src/components/predio/PredioForm.tsx
import React, { useState, useCallback, memo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
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
  const [loading, setLoading] = useState(false);
  const [isDireccionModalOpen, setIsDireccionModalOpen] = useState(false);

  // Configuración del formulario
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm<PredioFormData>({
    defaultValues: {
      anioAdquisicion: new Date().getFullYear().toString(),
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
      numeroCondominos: 1,
      rutaFotografiaPredio: '',
      rutaPlanoPredio: ''
    }
  });

  // Observar valores
  const direccion = watch('direccion');
  const nFinca = watch('nFinca');
  const otroNumero = watch('otroNumero');

  // Generar años para el select
  const currentYear = new Date().getFullYear();
  const yearOptions = [];
  for (let year = currentYear; year >= 1900; year--) {
    yearOptions.push({ value: year.toString(), label: year.toString() });
  }

  // Manejar selección de dirección
  const handleSelectDireccion = useCallback((direccion: Direccion) => {
    setValue('direccion', direccion);
    setIsDireccionModalOpen(false);
  }, [setValue]);

  // Obtener texto completo de dirección
  const getDireccionTextoCompleto = useCallback((direccion: Direccion | null): string => {
    if (!direccion) return 'Dirección seleccionada';
    
    // Si tiene descripción directa, usarla
    if (direccion.descripcion) {
      return direccion.descripcion;
    }
    
    // Si no, construir la descripción
    const partes = [];
    if (direccion.nombreSector) partes.push(direccion.nombreSector);
    if (direccion.nombreBarrio) partes.push(direccion.nombreBarrio);
    if (direccion.nombreTipoVia) partes.push(direccion.nombreTipoVia);
    if (direccion.nombreVia) partes.push(direccion.nombreVia);
    if (direccion.cuadra) partes.push(`Cuadra ${direccion.cuadra}`);
    
    return partes.join(' ') || 'Dirección seleccionada';
  }, []);

  // Manejar subida de archivos
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>, fieldName: 'rutaFotografiaPredio' | 'rutaPlanoPredio') => {
    const file = event.target.files?.[0];
    if (file) {
      // Aquí normalmente subirías el archivo al servidor
      // Por ahora, solo guardamos el nombre del archivo
      setValue(fieldName, file.name);
      NotificationService.info(`Archivo ${file.name} seleccionado`);
    }
  }, [setValue]);

  // Manejar envío del formulario
  const onSubmit = useCallback(async (data: PredioFormData) => {
    try {
      setLoading(true);
      
      console.log('📋 Datos del predio a guardar:', data);
      
      // Simular guardado
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      NotificationService.success('Predio registrado correctamente');
      
      // Limpiar formulario
      reset();
      
      // Navegar a la lista de predios después de 2 segundos
      setTimeout(() => {
        navigate('/predio/consulta');
      }, 2000);
      
    } catch (error) {
      console.error('❌ Error al guardar predio:', error);
      NotificationService.error('Error al registrar el predio');
    } finally {
      setLoading(false);
    }
  }, [reset, navigate]);

  // Limpiar formulario
  const handleNuevo = useCallback(() => {
    reset();
    NotificationService.info('Formulario limpiado');
  }, [reset]);

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
        {/* Sección: Datos del predio */}
        <FormSection title="Datos del predio">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Año de adquisición */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Año
              </label>
              <Controller
                name="anioAdquisicion"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={yearOptions}
                    placeholder="Seleccione"
                  />
                )}
              />
            </div>

            {/* Fecha de adquisición */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de adquisición
              </label>
              <Controller
                name="fechaAdquisicion"
                control={control}
                render={({ field }) => (
                  <CalendarInput
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="dd / mm / aaaa"
                  />
                )}
              />
            </div>

            {/* Condición propiedad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Condición propiedad
              </label>
              <Controller
                name="condicionPropiedad"
                control={control}
                rules={{ required: 'La condición de propiedad es requerida' }}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={CONDICION_PROPIEDAD_OPTIONS}
                    placeholder="Seleccione"
                    error={errors.condicionPropiedad?.message}
                  />
                )}
              />
            </div>
          </div>

          {/* Dirección */}
          <div className="mt-4">
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección
                </label>
                <Input
                  type="text"
                  value={getDireccionTextoCompleto(direccion)}
                  readOnly
                  placeholder="Dirección seleccionada"
                  className="bg-gray-50"
                />
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsDireccionModalOpen(true)}
              >
                Seleccionar dirección
              </Button>
            </div>
            
            {/* Texto adicional de dirección */}
            <div className="mt-2 text-sm text-gray-500 bg-gray-50 p-2 rounded">
              DIRECCIÓN SELECCIONADA + LOTE + OTRO NUMERO
            </div>
          </div>

          {/* N° Finca, Otro número y Arancel */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                N° finca
              </label>
              <Input
                {...register('nFinca')}
                type="text"
                placeholder="N° finca"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Otro número
              </label>
              <Input
                {...register('otroNumero')}
                type="text"
                placeholder="Otro número"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Arancel
              </label>
              <Input
                {...register('arancel', { 
                  valueAsNumber: true,
                  min: { value: 0, message: 'El arancel debe ser mayor a 0' }
                })}
                type="number"
                step="0.01"
                placeholder="0.00"
                error={errors.arancel?.message}
              />
            </div>
          </div>

          {/* Tipo predio, Conductor y Usos de predio */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo predio
              </label>
              <Controller
                name="tipoPredio"
                control={control}
                rules={{ required: 'El tipo de predio es requerido' }}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={TIPO_PREDIO_OPTIONS}
                    placeholder="Seleccione"
                    error={errors.tipoPredio?.message}
                  />
                )}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Conductor
              </label>
              <Controller
                name="conductor"
                control={control}
                rules={{ required: 'El conductor es requerido' }}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={CONDUCTOR_OPTIONS}
                    placeholder="Seleccione"
                    error={errors.conductor?.message}
                  />
                )}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Usos de predio
              </label>
              <Controller
                name="usoPredio"
                control={control}
                rules={{ required: 'El uso del predio es requerido' }}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={USO_PREDIO_OPTIONS}
                    placeholder="Seleccione"
                    error={errors.usoPredio?.message}
                  />
                )}
              />
            </div>
          </div>

          {/* Área de terreno, Número de pisos y N° Condóminos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Área de terreno
              </label>
              <Input
                {...register('areaTerreno', { 
                  valueAsNumber: true,
                  required: 'El área de terreno es requerida',
                  min: { value: 0, message: 'El área debe ser mayor a 0' }
                })}
                type="number"
                step="0.01"
                placeholder="Ingrese área en m2"
                error={errors.areaTerreno?.message}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de pisos
              </label>
              <Input
                {...register('numeroPisos', { 
                  valueAsNumber: true,
                  required: 'El número de pisos es requerido',
                  min: { value: 0, message: 'Debe ser mayor o igual a 0' }
                })}
                type="number"
                placeholder="Ingrese cantidad de pisos"
                error={errors.numeroPisos?.message}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                N° Condóminos
              </label>
              <Input
                {...register('numeroCondominos', { 
                  valueAsNumber: true,
                  required: 'El número de condóminos es requerido',
                  min: { value: 1, message: 'Debe ser mayor o igual a 1' }
                })}
                type="number"
                placeholder="Ingrese cantidad"
                error={errors.numeroCondominos?.message}
              />
            </div>
          </div>
        </FormSection>

        {/* Sección: Imágenes */}
        <FormSection title="Imágenes">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ruta de fotografía del predio
              </label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={watch('rutaFotografiaPredio') || ''}
                  readOnly
                  placeholder="Ruta de fotografía del predio"
                  className="flex-1 bg-gray-50"
                />
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'rutaFotografiaPredio')}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    as="span"
                  >
                    Seleccionar archivo
                  </Button>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ruta de plano del predio
              </label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={watch('rutaPlanoPredio') || ''}
                  readOnly
                  placeholder="Ruta de plano del predio"
                  className="flex-1 bg-gray-50"
                />
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'rutaPlanoPredio')}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    as="span"
                  >
                    Seleccionar archivo
                  </Button>
                </label>
              </div>
            </div>
          </div>
        </FormSection>

        {/* Botón de registro */}
        <div className="flex justify-center pt-6">
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            disabled={loading}
            className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white"
          >
            Registrar / editar
          </Button>
        </div>
      </form>

      {/* Modal de selección de dirección */}
      <SelectorDirecciones
        isOpen={isDireccionModalOpen}
        onClose={() => setIsDireccionModalOpen(false)}
        onSelectDireccion={handleSelectDireccion}
      />
    </>
  );
});

PredioForm.displayName = 'PredioForm';

export default PredioForm;
// src/components/contribuyentes/PersonaForm.tsx
import React from 'react';
import { UseFormReturn, Controller } from 'react-hook-form';
import { Select, Input, Button } from '../';
import CalendarInput from '../utils/CalendarInput';
import { Direccion, TipoDocumento, Sexo, EstadoCivil } from '../../types/formTypes';

interface PersonaFormProps {
  form: UseFormReturn<any>;
  isJuridica?: boolean;
  isRepresentante?: boolean;
  onOpenDireccionModal: () => void;
  direccion: Direccion | null;
  getDireccionTextoCompleto: (direccion: Direccion | null, nFinca: string, otroNumero?: string) => string;
  disablePersonaFields?: boolean;
  showDeleteButton?: boolean; // Nueva prop para controlar el botón eliminar
  onDelete?: () => void; // Callback para eliminar
}

const PersonaForm: React.FC<PersonaFormProps> = ({
  form,
  isJuridica = false,
  isRepresentante = false,
  onOpenDireccionModal,
  direccion,
  getDireccionTextoCompleto,
  disablePersonaFields = false,
  showDeleteButton = false,
  onDelete,
}) => {
  const { register, control, formState: { errors }, watch, setValue } = form;
  
  const nFinca = watch('nFinca') || '';
  const otroNumero = watch('otroNumero') || '';
  
  const tipoDocumentoOptions = [
    { value: TipoDocumento.DNI, label: 'DNI' },
    { value: TipoDocumento.RUC, label: 'RUC' },
    { value: TipoDocumento.PASAPORTE, label: 'Pasaporte' },
    { value: TipoDocumento.CARNET_EXTRANJERIA, label: 'Carnet de Extranjería' },
  ];
  
  const sexoOptions = [
    { value: Sexo.MASCULINO, label: 'Masculino' },
    { value: Sexo.FEMENINO, label: 'Femenino' },
  ];
  
  const estadoCivilOptions = [
    { value: EstadoCivil.SOLTERO, label: 'Soltero/a' },
    { value: EstadoCivil.CASADO, label: 'Casado/a' },
    { value: EstadoCivil.VIUDO, label: 'Viudo/a' },
    { value: EstadoCivil.DIVORCIADO, label: 'Divorciado/a' },
    { value: EstadoCivil.CONVIVIENTE, label: 'Conviviente' },
  ];

  const handleFechaNacimientoChange = (date: Date | null) => {
    setValue('fechaNacimiento', date);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Tipo documento con Controller */}
        <Controller
          name="tipoDocumento"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              label="Tipo documento"
              options={tipoDocumentoOptions}
              error={errors.tipoDocumento?.message as string}
              disabled={disablePersonaFields}
            />
          )}
        />
        
        {/* Número documento */}
        <Input
          label="Número documento"
          error={errors.numeroDocumento?.message as string}
          disabled={disablePersonaFields}
          {...register('numeroDocumento')}
        />
        
        {/* Nombre/Razón social */}
        <div className="col-span-1 md:col-span-2">
          <Input
            label={isJuridica ? "Razón social" : isRepresentante ? "Apellidos y nombres" : "Apellidos y nombres"}
            error={isRepresentante ? errors.apellidosNombres?.message as string : errors.nombreRazonSocial?.message as string}
            disabled={disablePersonaFields}
            {...register(isRepresentante ? 'apellidosNombres' : 'nombreRazonSocial')}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Teléfono */}
        <Input
          label="Teléfono"
          error={errors.telefono?.message as string}
          disabled={disablePersonaFields}
          {...register('telefono')}
        />
        
        {/* Sexo con Controller */}
        <Controller
          name="sexo"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              label="Sexo"
              options={sexoOptions}
              disabled={disablePersonaFields || isJuridica}
              error={errors.sexo?.message as string}
            />
          )}
        />
        
        {/* Estado civil con Controller */}
        <Controller
          name="estadoCivil"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              label="Estado civil"
              options={estadoCivilOptions}
              disabled={disablePersonaFields || isJuridica}
              error={errors.estadoCivil?.message as string}
            />
          )}
        />
        
        {/* Fecha de nacimiento */}
        <Controller
          name="fechaNacimiento"
          control={control}
          render={({ field }) => (
            <CalendarInput
              label="Fecha de nacimiento"
              value={field.value}
              onChange={field.onChange}
              disabled={disablePersonaFields || isJuridica}
              error={errors.fechaNacimiento?.message as string}
            />
          )}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        {/* Botón seleccionar dirección */}
        <div>
          <Button
            type="button"
            className="w-full bg-gray-300 text-gray-700 hover:bg-gray-400"
            onClick={onOpenDireccionModal}
            disabled={disablePersonaFields}
          >
            Seleccionar dirección
          </Button>
        </div>

        {/* N° finca */}
        <Input
          label="N° finca"
          disabled={disablePersonaFields}
          {...register('nFinca')}
        />

        {/* Otro número (solo para contribuyente principal) */}
        {!isRepresentante && (
          <Input
            label="Otro número"
            disabled={disablePersonaFields}
            {...register('otroNumero')}
          />
        )}

        {/* Espacio o botón eliminar */}
        {showDeleteButton && onDelete ? (
          <div className="flex justify-end">
            <Button
              type="button"
              variant="danger"
              onClick={onDelete}
              disabled={disablePersonaFields}
            >
              Eliminar
            </Button>
          </div>
        ) : (
          <div />
        )}
      </div>

      {/* Campo de dirección concatenada */}
      <div className="mt-2">
        <Input
          label="Dirección completa"
          value={direccion ? getDireccionTextoCompleto(direccion, nFinca, otroNumero) : ''}
          disabled
          className="bg-gray-100"
        />
      </div>
    </div>
  );
};

export default PersonaForm;
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import {Select,Input,Button } from '../';
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
}

const PersonaForm: React.FC<PersonaFormProps> = ({
  form,
  isJuridica = false,
  isRepresentante = false,
  onOpenDireccionModal,
  direccion,
  getDireccionTextoCompleto,
  disablePersonaFields = false,
}) => {
  const { register, formState: { errors }, watch, setValue } = form;
  
  const nFinca = watch('nFinca');
  const otroNumero = watch('otroNumero');
  
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
  ];

  const handleFechaNacimientoChange = (value: string) => {
    setValue('fechaNacimiento', value);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      
        <Select
          label="Tipo documento"
          options={tipoDocumentoOptions}
          error={errors.tipoDocumento?.message as string}
          {...register('tipoDocumento')}
        />
        
        <Input
          label="Número documento"
          error={errors.numeroDocumento?.message as string}
          {...register('numeroDocumento')}
        />
        <div className="col-span-1 md:col-span-2">
          <Input
            label={isJuridica ? "Razón social" : isRepresentante ? "Apellidos y nombres" : "Apellidos y nombre"}
            error={isRepresentante ? errors.apellidosNombres?.message as string : errors.nombreRazonSocial?.message as string}
            {...register(isRepresentante ? 'apellidosNombres' : 'nombreRazonSocial')}
          />
        </div>
        
      </div>
      
      
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Input
          label="Teléfono"
          error={errors.telefono?.message as string}
          {...register('telefono')}
        />
        
        <Select
          label="Sexo"
          options={sexoOptions}
          disabled={disablePersonaFields}
          error={errors.sexo?.message as string}
          {...register('sexo')}
        />
        <Select
          label="Estado civil"
          options={estadoCivilOptions}
          disabled={disablePersonaFields}
          error={errors.estadoCivil?.message as string}
          {...register('estadoCivil')}
        />
        
        <CalendarInput
          label="Fecha de nacimiento"
          value={watch('fechaNacimiento')}
          onChange={handleFechaNacimientoChange}
          disabled={disablePersonaFields}
          error={errors.fechaNacimiento?.message as string}
        />
      </div>
      
      
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <Button
            type="button"
            className="w-full bg-gray-300 text-gray-700 hover:bg-gray-400"
            onClick={onOpenDireccionModal}
           >
             Seleccionar dirección
          </Button>
        </div>

        <Input
          label="N° finca"
          {...register('nFinca')}
        />

        {!isRepresentante && (
          <Input
            label="Otro número"
            {...register('otroNumero')}
          />
        )}

        {/* Este espacio se puede usar para mantener la cuadrícula alineada si falta una celda */}
        {!isRepresentante ? null : <div />}
      </div>

      <div className="mt-2">
        <Input
          value={direccion ? getDireccionTextoCompleto(direccion, nFinca, otroNumero) : ''}
          disabled
          className="bg-gray-100"
        />
      </div>
    </div>
  );
};

export default PersonaForm;
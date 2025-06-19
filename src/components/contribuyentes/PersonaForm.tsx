// src/components/contribuyentes/PersonaForm.tsx
import React from 'react';
import { UseFormReturn, Controller } from 'react-hook-form';
import { Input, Button } from '../';
import CalendarInput from '../utils/CalendarInput';
import { Direccion } from '../../types/formTypes';

interface PersonaFormProps {
  form: UseFormReturn<any>;
  isJuridica?: boolean;
  isRepresentante?: boolean;
  onOpenDireccionModal: () => void;
  direccion: Direccion | null;
  getDireccionTextoCompleto: (direccion: Direccion | null, nFinca: string, otroNumero?: string) => string;
  disablePersonaFields?: boolean;
  showDeleteButton?: boolean;
  onDelete?: () => void;
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
  onDelete
}) => {
  const { register, control, watch, formState: { errors }, setValue } = form;
  const tipoDocumento = watch('tipoDocumento');
  const nFinca = watch('nFinca');
  const otroNumero = watch('otroNumero');

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tipo de documento */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo documento <span className="text-gray-500 text-xs">({isJuridica ? '1' : '4'} opciones)</span>
          </label>
          <select
            {...register('tipoDocumento')}
            disabled={disablePersonaFields}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {isJuridica ? (
              <option value="RUC">RUC</option>
            ) : (
              <>
                <option value="DNI">DNI</option>
                <option value="PASAPORTE">PASAPORTE</option>
                <option value="CARNET_EXTRANJERIA">CARNET EXTRANJERIA</option>
                <option value="OTROS">OTROS</option>
              </>
            )}
          </select>
          <div className="text-xs text-gray-500 mt-1">
            Valor: "{tipoDocumento}" | Válido: ✓
          </div>
        </div>

        {/* Número de documento */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Número documento
          </label>
          <Input
            {...register('numeroDocumento')}
            type="text"
            disabled={disablePersonaFields}
            placeholder={tipoDocumento === 'RUC' ? '20000000000' : '00000000'}
            maxLength={tipoDocumento === 'RUC' ? 11 : tipoDocumento === 'DNI' ? 8 : 20}
          />
        </div>

        {/* Apellidos y nombres / Razón social */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {isJuridica ? 'Razón social' : 'Apellidos y nombres'}
          </label>
          {isJuridica ? (
            <Input
              {...register('razonSocial')}
              type="text"
              disabled={disablePersonaFields}
              placeholder="Razón social de la empresa"
            />
          ) : (
            <Input
              {...register('apellidosNombres')}
              type="text"
              disabled={disablePersonaFields}
              placeholder="Apellidos y nombres completos"
              onChange={(e) => {
                const valor = e.target.value;
                setValue('apellidosNombres', valor);
                
                // Separar apellidos y nombres automáticamente
                const partes = valor.trim().split(' ').filter(p => p);
                if (partes.length >= 3) {
                  setValue('apellidoPaterno', partes[0]);
                  setValue('apellidoMaterno', partes[1]);
                  setValue('nombres', partes.slice(2).join(' '));
                } else if (partes.length === 2) {
                  setValue('apellidoPaterno', partes[0]);
                  setValue('apellidoMaterno', '');
                  setValue('nombres', partes[1]);
                } else if (partes.length === 1) {
                  setValue('apellidoPaterno', '');
                  setValue('apellidoMaterno', '');
                  setValue('nombres', partes[0]);
                }
              }}
            />
          )}
        </div>
      </div>

      {/* Segunda fila */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Teléfono */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Teléfono
          </label>
          <Input
            {...register('telefono')}
            type="tel"
            disabled={disablePersonaFields}
            placeholder="999999999"
          />
        </div>

        {/* Sexo - Solo para persona natural */}
        {!isJuridica && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sexo <span className="text-gray-500 text-xs">(2 opciones)</span>
            </label>
            <select
              {...register('sexo')}
              disabled={disablePersonaFields}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="Masculino">Masculino</option>
              <option value="Femenino">Femenino</option>
            </select>
            <div className="text-xs text-gray-500 mt-1">
              Valor: "{watch('sexo')}" | Válido: ✓
            </div>
          </div>
        )}

        {/* Estado civil - Solo para persona natural */}
        {!isJuridica && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado civil <span className="text-gray-500 text-xs">(5 opciones)</span>
            </label>
            <select
              {...register('estadoCivil')}
              disabled={disablePersonaFields}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="Soltero/a">Soltero/a</option>
              <option value="Casado/a">Casado/a</option>
              <option value="Divorciado/a">Divorciado/a</option>
              <option value="Viudo/a">Viudo/a</option>
              <option value="Conviviente">Conviviente</option>
            </select>
            <div className="text-xs text-gray-500 mt-1">
              Valor: "{watch('estadoCivil')}" | Válido: ✓
            </div>
          </div>
        )}

        {/* Fecha de nacimiento - Solo para persona natural */}
        {!isJuridica && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de nacimiento
            </label>
            <Controller
              name="fechaNacimiento"
              control={control}
              render={({ field }) => (
                <CalendarInput
                  {...field}
                  disabled={disablePersonaFields}
                  placeholder="DD/MM/AAAA"
                />
              )}
            />
          </div>
        )}
      </div>

      {/* Dirección */}
      <div className="space-y-4">
        <Button
          type="button"
          onClick={onOpenDireccionModal}
          disabled={disablePersonaFields}
          variant="secondary"
          className="w-full md:w-auto"
        >
          Seleccionar dirección
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              N° finca
            </label>
            <Input
              {...register('nFinca')}
              type="text"
              disabled={disablePersonaFields}
              placeholder="Número de finca"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Otro número
            </label>
            <Input
              {...register('otroNumero')}
              type="text"
              disabled={disablePersonaFields}
              placeholder="Otro número"
            />
          </div>
        </div>

        {/* Dirección completa */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Dirección completa
          </label>
          <Input
            value={direccion ? getDireccionTextoCompleto(direccion, nFinca, otroNumero) : ''}
            disabled
            className="bg-gray-100"
          />
        </div>
      </div>

      {/* Botón eliminar si es necesario */}
      {showDeleteButton && (
        <div className="flex justify-end pt-4">
          <Button
            type="button"
            variant="danger"
            onClick={onDelete}
            disabled={disablePersonaFields}
          >
            Eliminar
          </Button>
        </div>
      )}

      {/* Campos ocultos para mantener los valores separados */}
      <input type="hidden" {...register('apellidoPaterno')} />
      <input type="hidden" {...register('apellidoMaterno')} />
      <input type="hidden" {...register('nombres')} />
    </div>
  );
};

export default PersonaForm;
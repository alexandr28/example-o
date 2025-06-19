// src/components/contribuyentes/PersonaForm.tsx
import React, { useEffect } from 'react';
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
  getDireccionTextoCompleto: (direccion: Direccion | null) => string;
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

  // Debug: Log cuando cambia la dirección
  useEffect(() => {
    console.log('📍 [PersonaForm] Dirección actualizada:', direccion);
    if (direccion) {
      console.log('📋 [PersonaForm] Campos de dirección:', {
        id: direccion.id,
        descripcion: direccion.descripcion,
        nombreSector: direccion.nombreSector,
        nombreBarrio: direccion.nombreBarrio,
        nombreTipoVia: direccion.nombreTipoVia,
        nombreVia: direccion.nombreVia,
        cuadra: direccion.cuadra
      });
    }
  }, [direccion]);

  // Construir texto de dirección completo incluyendo N° Finca y Otro Número
  const direccionCompleta = React.useMemo(() => {
    let texto = getDireccionTextoCompleto(direccion);
    
    if (direccion && (nFinca || otroNumero)) {
      const extras = [];
      if (nFinca) extras.push(`N° Finca: ${nFinca}`);
      if (otroNumero) extras.push(`Otro N°: ${otroNumero}`);
      
      if (extras.length > 0) {
        texto += ` (${extras.join(', ')})`;
      }
    }
    
    return texto;
  }, [direccion, nFinca, otroNumero, getDireccionTextoCompleto]);

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
            {isJuridica ? 'Razón social' : 'Nombres'}
          </label>
          <Input
            {...register(isJuridica ? 'razonSocial' : 'nombres')}
            type="text"
            disabled={disablePersonaFields}
            placeholder={isJuridica ? 'EMPRESA S.A.C.' : 'Juan Carlos'}
          />
        </div>

        {/* Apellidos para persona natural */}
        {!isJuridica && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Apellido paterno
              </label>
              <Input
                {...register('apellidoPaterno')}
                type="text"
                disabled={disablePersonaFields}
                placeholder="García"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Apellido materno
              </label>
              <Input
                {...register('apellidoMaterno')}
                type="text"
                disabled={disablePersonaFields}
                placeholder="López"
              />
            </div>
          </>
        )}

        {/* Fecha de nacimiento para persona natural */}
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
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Seleccionar fecha"
                  disabled={disablePersonaFields}
                />
              )}
            />
          </div>
        )}

        {/* Estado civil y sexo para persona natural */}
        {!isJuridica && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado civil
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
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sexo
              </label>
              <select
                {...register('sexo')}
                disabled={disablePersonaFields}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
              </select>
            </div>
          </>
        )}

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
            maxLength={12}
          />
        </div>

        {/* Dirección completa */}
        <div className="md:col-span-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Dirección completa
          </label>
          <div className="flex gap-2">
            <Input
              type="text"
              value={direccionCompleta}
              readOnly
              disabled={disablePersonaFields}
              placeholder="Seleccionar dirección"
              className="flex-1 bg-gray-50"
            />
            <Button
              type="button"
              variant="secondary"
              onClick={onOpenDireccionModal}
              disabled={disablePersonaFields}
            >
              Buscar
            </Button>
          </div>
          {direccion && (
            <div className="text-xs text-gray-500 mt-1">
              ID Dirección: {direccion.id || direccion.codDireccion} | 
              Sector: {direccion.nombreSector || '-'} | 
              Barrio: {direccion.nombreBarrio || '-'}
            </div>
          )}
        </div>

        {/* N° Finca */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            N° Finca
          </label>
          <Input
            {...register('nFinca')}
            type="text"
            disabled={disablePersonaFields}
            placeholder="123"
          />
        </div>

        {/* Otro número */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Otro número
          </label>
          <Input
            {...register('otroNumero')}
            type="text"
            disabled={disablePersonaFields}
            placeholder="Dpto 201"
          />
        </div>
      </div>

      {/* Botón de eliminar si es necesario */}
      {showDeleteButton && onDelete && (
        <div className="flex justify-end mt-4">
          <Button
            type="button"
            variant="danger"
            onClick={onDelete}
            disabled={disablePersonaFields}
          >
            Eliminar {isRepresentante ? 'representante' : 'cónyuge'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default PersonaForm;
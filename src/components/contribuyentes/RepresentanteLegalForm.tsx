// src/components/contribuyentes/RepresentanteLegalForm.tsx
import React from 'react';
import { Input, Select, CalendarInput } from '../../components';

interface RepresentanteLegalFormProps {
  data: any;
  onChange: (data: any) => void;
}

export const RepresentanteLegalForm: React.FC<RepresentanteLegalFormProps> = ({ data, onChange }) => {
  const handleChange = (field: string, value: any) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  return (
    <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
      <h4 className="text-md font-medium text-gray-700 mb-4">
        Información del Representante Legal
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Documento <span className="text-red-500">*</span>
          </label>
          <Select
            value={data.tipoDocumento || 'DNI'}
            onChange={(value) => handleChange('tipoDocumento', value)}
            required
          >
            <option value="DNI">DNI</option>
            <option value="RUC">RUC</option>
            <option value="PASAPORTE">Pasaporte</option>
            <option value="CARNET_EXTRANJERIA">Carnet de Extranjería</option>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Número de Documento <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            value={data.numeroDocumento || ''}
            onChange={(e) => handleChange('numeroDocumento', e.target.value)}
            placeholder="Ingrese número de documento"
            maxLength={
              data.tipoDocumento === 'DNI' ? 8 : 
              data.tipoDocumento === 'RUC' ? 11 : 15
            }
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombres <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            value={data.nombres || ''}
            onChange={(e) => handleChange('nombres', e.target.value)}
            placeholder="Nombres completos"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Apellido Paterno
          </label>
          <Input
            type="text"
            value={data.apellidoPaterno || ''}
            onChange={(e) => handleChange('apellidoPaterno', e.target.value)}
            placeholder="Apellido paterno"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Apellido Materno
          </label>
          <Input
            type="text"
            value={data.apellidoMaterno || ''}
            onChange={(e) => handleChange('apellidoMaterno', e.target.value)}
            placeholder="Apellido materno"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha de Nacimiento
          </label>
          <CalendarInput
            value={data.fechaNacimiento || null}
            onChange={(date) => handleChange('fechaNacimiento', date)}
            placeholder="Seleccione fecha"
            maxDate={new Date()}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sexo
          </label>
          <Select
            value={data.sexo || ''}
            onChange={(value) => handleChange('sexo', value)}
          >
            <option value="">Seleccione...</option>
            <option value="MASCULINO">Masculino</option>
            <option value="FEMENINO">Femenino</option>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Teléfono
          </label>
          <Input
            type="tel"
            value={data.telefono || ''}
            onChange={(e) => handleChange('telefono', e.target.value)}
            placeholder="Número de teléfono"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cargo
          </label>
          <Input
            type="text"
            value={data.cargo || ''}
            onChange={(e) => handleChange('cargo', e.target.value)}
            placeholder="Cargo del representante (Ej: Gerente General)"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Dirección
          </label>
          <Input
            type="text"
            value={data.direccion || ''}
            onChange={(e) => handleChange('direccion', e.target.value)}
            placeholder="Dirección del representante"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Observaciones
          </label>
          <textarea
            value={data.observaciones || ''}
            onChange={(e) => handleChange('observaciones', e.target.value)}
            placeholder="Observaciones adicionales"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            rows={3}
          />
        </div>
      </div>

      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
        <p className="text-sm text-yellow-800">
          <strong>Importante:</strong> El representante legal debe contar con poderes vigentes inscritos en registros públicos.
        </p>
      </div>
    </div>
  );
};
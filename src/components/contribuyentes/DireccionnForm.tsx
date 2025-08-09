// src/components/contribuyentes/DireccionForm.tsx
import React, { useState, useEffect } from 'react';
import { Input, Button, Modal } from '..';
import { useDirecciones } from '../../hooks/useDirecciones';
import { Direccion } from '../../models/Direcciones';

interface DireccionFormProps {
  data: any;
  onChange: (data: any) => void;
}

export const DireccionForm: React.FC<DireccionFormProps> = ({ data, onChange }) => {
  const [showModal, setShowModal] = useState(false);
  const [direccionSeleccionada, setDireccionSeleccionada] = useState<Direccion | null>(null);
  const { direcciones, loading, cargarDirecciones } = useDirecciones();

  useEffect(() => {
    if (showModal) {
      cargarDirecciones();
    }
  }, [showModal, cargarDirecciones]);

  const handleSelectDireccion = (direccion: Direccion) => {
    setDireccionSeleccionada(direccion);
    
    // Construir la descripción completa de la dirección
    const descripcionCompleta = `${direccion.nombreTipoVia || ''} ${direccion.nombreVia || ''} ${direccion.cuadra || ''} ${direccion.lado || ''}`.trim();
    
    onChange({
      ...data,
      codDireccion: direccion.id,
      direccion: descripcionCompleta,
      sector: direccion.nombreSector || '',
      barrio: direccion.nombreBarrio || '',
      loteInicial: direccion.loteInicial,
      loteFinal: direccion.loteFinal
    });
    
    setShowModal(false);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Dirección <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            <Input
              type="text"
              value={data.direccion || ''}
              placeholder="Seleccione una dirección"
              readOnly
              className="flex-1"
              required
            />
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowModal(true)}
            >
              Buscar
            </Button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sector
          </label>
          <Input
            type="text"
            value={data.sector || ''}
            readOnly
            placeholder="Se llenará automáticamente"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Barrio
          </label>
          <Input
            type="text"
            value={data.barrio || ''}
            readOnly
            placeholder="Se llenará automáticamente"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Lote
          </label>
          <Input
            type="text"
            value={data.lote || ''}
            onChange={(e) => onChange({ ...data, lote: e.target.value })}
            placeholder="Número de lote"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Otros (Referencias)
          </label>
          <Input
            type="text"
            value={data.otros || ''}
            onChange={(e) => onChange({ ...data, otros: e.target.value })}
            placeholder="Referencias adicionales"
          />
        </div>
      </div>

      {/* Modal de selección de dirección */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Seleccionar Dirección"
        size="lg"
      >
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Dirección
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Sector
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Barrio
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Acción
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {direcciones.map((direccion) => (
                    <tr key={direccion.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {`${direccion.nombreTipoVia || ''} ${direccion.nombreVia || ''} ${direccion.cuadra || ''} ${direccion.lado || ''}`}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {direccion.nombreSector || '-'}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {direccion.nombreBarrio || '-'}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleSelectDireccion(direccion)}
                        >
                          Seleccionar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
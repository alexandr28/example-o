// src/components/contribuyentes/BuscarPersona.tsx
import React, { useState } from 'react';
import { Input, Select, Button, Modal } from '../../components';
import { personaService, PersonaData, TIPO_PERSONA_CODES } from '../../services/personaService';

interface BuscarPersonaProps {
  onSelectPersona: (persona: PersonaData) => void;
  tipoPersonaInicial?: 'PERSONA_NATURAL' | 'PERSONA_JURIDICA';
}

export const BuscarPersona: React.FC<BuscarPersonaProps> = ({ 
  onSelectPersona, 
  tipoPersonaInicial = 'PERSONA_NATURAL' 
}) => {
  const [showModal, setShowModal] = useState(false);
  const [tipoPersona, setTipoPersona] = useState(tipoPersonaInicial);
  const [busqueda, setBusqueda] = useState('');
  const [personas, setPersonas] = useState<PersonaData[]>([]);
  const [loading, setLoading] = useState(false);

  const handleBuscar = async () => {
    if (busqueda.trim().length < 3) {
      alert('Ingrese al menos 3 caracteres para buscar');
      return;
    }

    try {
      setLoading(true);
      const codTipoPersona = tipoPersona === 'PERSONA_JURIDICA' 
        ? TIPO_PERSONA_CODES.JURIDICA 
        : TIPO_PERSONA_CODES.NATURAL;

      const resultado = await personaService.buscarPorTipoYNombre({
        codTipoPersona,
        parametroBusqueda: busqueda.toUpperCase()
      });

      setPersonas(resultado);
      
      if (resultado.length === 0) {
        alert('No se encontraron personas con ese criterio de búsqueda');
      }
    } catch (error) {
      console.error('Error al buscar personas:', error);
      alert('Error al buscar personas');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPersona = (persona: PersonaData) => {
    onSelectPersona(persona);
    setShowModal(false);
    setBusqueda('');
    setPersonas([]);
  };

  const formatearNombreCompleto = (persona: PersonaData): string => {
    if (persona.nombrePersona) {
      return persona.nombrePersona;
    }
    
    const partes = [
      persona.apellidopaterno,
      persona.apellidomaterno,
      persona.nombres
    ].filter(Boolean);
    
    return partes.join(' ') || 'Sin nombre';
  };

  return (
    <>
      <Button
        type="button"
        variant="secondary"
        onClick={() => setShowModal(true)}
      >
        Buscar Persona Existente
      </Button>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Buscar Persona Existente"
        size="lg"
      >
        <div className="space-y-4">
          {/* Tipo de persona */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Persona
            </label>
            <Select
              value={tipoPersona}
              onChange={(value) => setTipoPersona(value as any)}
            >
              <option value="PERSONA_NATURAL">Persona Natural</option>
              <option value="PERSONA_JURIDICA">Persona Jurídica</option>
            </Select>
          </div>

          {/* Campo de búsqueda */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar por Nombre/Razón Social o Documento
            </label>
            <div className="flex gap-2">
              <Input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder={tipoPersona === 'PERSONA_JURIDICA' 
                  ? "Razón social o RUC" 
                  : "Nombres, apellidos o DNI"}
                onKeyPress={(e) => e.key === 'Enter' && handleBuscar()}
              />
              <Button
                onClick={handleBuscar}
                disabled={loading}
                loading={loading}
              >
                Buscar
              </Button>
            </div>
          </div>

          {/* Resultados */}
          {personas.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Resultados ({personas.length})
              </h4>
              <div className="max-h-64 overflow-y-auto border rounded">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Documento
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Nombre
                      </th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                        Acción
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {personas.map((persona) => (
                      <tr key={persona.codPersona} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {persona.numerodocumento || '-'}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {formatearNombreCompleto(persona)}
                        </td>
                        <td className="px-4 py-2 text-sm text-center">
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleSelectPersona(persona)}
                          >
                            Seleccionar
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Sin resultados */}
          {personas.length === 0 && !loading && busqueda && (
            <div className="text-center py-4 text-gray-500">
              <p>No se encontraron resultados</p>
              <p className="text-sm mt-1">Intente con otros términos de búsqueda</p>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};
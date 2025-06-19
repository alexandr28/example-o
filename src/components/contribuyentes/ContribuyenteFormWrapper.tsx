// src/components/contribuyentes/ContribuyenteFormWrapper.tsx
import React, { useCallback } from 'react';
import ContribuyenteForm from './ContribuyenteForm';

interface ContribuyenteFormWrapperProps {
  onGuardar?: (data: any) => void | Promise<void>;
  onEditar?: () => void;
  onNuevo?: () => void;
}

/**
 * Wrapper para el ContribuyenteForm existente que adapta los datos
 * para trabajar con las nuevas APIs
 */
const ContribuyenteFormWrapper: React.FC<ContribuyenteFormWrapperProps> = ({
  onGuardar,
  onEditar,
  onNuevo
}) => {
  
  /**
   * Intercepta el submit del formulario y adapta los datos
   */
  const handleFormSubmit = useCallback(async (data: any) => {
    console.log('🔄 [FormWrapper] Datos originales del formulario:', data);
    
    // Adaptar la estructura de datos al formato esperado por el servicio
    const datosAdaptados = {
      // Tipo de contribuyente
      tipoContribuyente: data.esPersonaJuridica ? 'PERSONA_JURIDICA' : 'PERSONA_NATURAL',
      
      // Datos principales
      tipoDocumento: data.tipoDocumento,
      numeroDocumento: data.numeroDocumento,
      nombres: data.nombres || data.razonSocial || '',
      apellidoPaterno: data.apellidoPaterno,
      apellidoMaterno: data.apellidoMaterno,
      fechaNacimiento: data.fechaNacimiento,
      estadoCivil: data.estadoCivil,
      sexo: data.sexo,
      telefono: data.telefono,
      
      // Dirección
      direccion: data.direccion,
      nFinca: data.nFinca,
      otroNumero: data.otroNumero,
      
      // Control de secciones
      tieneConyugeRepresentante: data.tieneConyugeRepresentante || false,
      
      // Datos del cónyuge/representante (si existe)
      conyugeRepresentante: data.tieneConyugeRepresentante ? {
        tipoDocumento: data.conyugeRepresentante?.tipoDocumento,
        numeroDocumento: data.conyugeRepresentante?.numeroDocumento,
        nombres: data.conyugeRepresentante?.nombres,
        apellidoPaterno: data.conyugeRepresentante?.apellidoPaterno,
        apellidoMaterno: data.conyugeRepresentante?.apellidoMaterno,
        fechaNacimiento: data.conyugeRepresentante?.fechaNacimiento,
        estadoCivil: data.conyugeRepresentante?.estadoCivil,
        sexo: data.conyugeRepresentante?.sexo,
        telefono: data.conyugeRepresentante?.telefono,
        direccion: data.conyugeRepresentante?.direccion,
        nFinca: data.conyugeRepresentante?.nFinca,
        otroNumero: data.conyugeRepresentante?.otroNumero
      } : undefined
    };
    
    console.log('✅ [FormWrapper] Datos adaptados:', datosAdaptados);
    
    // Llamar a la función onGuardar con los datos adaptados
    if (onGuardar) {
      await onGuardar(datosAdaptados);
    }
  }, [onGuardar]);
  
  // Renderizar el formulario original pasándole los callbacks
  return (
    <ContribuyenteForm 
      onSubmit={handleFormSubmit}
      onEdit={onEditar}
      onNew={onNuevo}
    />
  );
};

export default ContribuyenteFormWrapper;
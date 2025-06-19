// src/components/contribuyentes/ContribuyenteForm.tsx
import React, { useState, useCallback, memo } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import PersonaForm from './PersonaForm';
import FormSection from '../utils/FormSecction';
import Button from '../ui/Button';
import SelectorDirecciones from '../modal/SelectorDirecciones';
import { Direccion, TipoDocumento } from '../../types/formTypes';
import { NotificationService } from '../utils/Notification';
//import { useContribuyenteAPI } from '../../hooks/useContribuyenteApi';

/**
 * Formulario principal de contribuyentes
 * Versión sin Yup - usa validación manual
 */
const ContribuyenteForm: React.FC = memo(() => {
  const navigate = useNavigate();
  // Comentar el hook problemático
  // const { guardarContribuyente } = useContribuyenteAPI();
  
  const [loading, setLoading] = useState(false);
  const [showConyugeRepresentante, setShowConyugeRepresentante] = useState(false);
  const [isDireccionModalOpen, setIsDireccionModalOpen] = useState(false);
  const [isConyugeDireccionModalOpen, setIsConyugeDireccionModalOpen] = useState(false);
  const [tipoContribuyente, setTipoContribuyente] = useState<'natural' | 'juridica'>('natural');

  // Formulario principal con validación manual
  const principalForm = useForm({
    defaultValues: {
      esPersonaJuridica: false,
      tipoDocumento: 'DNI',
      numeroDocumento: '',
      nombres: '',
      razonSocial: '',
      apellidoPaterno: '',
      apellidoMaterno: '',
      direccion: null,
      nFinca: '',
      otroNumero: '',
      telefono: '',
      sexo: 'Masculino',
      estadoCivil: 'Soltero/a',
      fechaNacimiento: null
    },
    mode: 'onBlur'
  });

  // Formulario para cónyuge/representante
  const conyugeRepresentanteForm = useForm({
    defaultValues: {
      tipoDocumento: 'DNI',
      numeroDocumento: '',
      nombres: '',
      apellidoPaterno: '',
      apellidoMaterno: '',
      direccion: null,
      nFinca: '',
      otroNumero: '',
      telefono: '',
      sexo: 'Masculino',
      estadoCivil: 'Soltero/a',
      fechaNacimiento: null
    }
  });

  // Observar cambios en el tipo de contribuyente
  const esPersonaJuridica = principalForm.watch('esPersonaJuridica');

  // Manejar cambio de tipo de contribuyente
  const handleTipoContribuyenteChange = useCallback((value: string) => {
    const esJuridica = value === 'Persona Jurídica';
    setTipoContribuyente(esJuridica ? 'juridica' : 'natural');
    principalForm.setValue('esPersonaJuridica', esJuridica);
    
    // Cambiar tipo de documento según el tipo de contribuyente
    if (esJuridica) {
      principalForm.setValue('tipoDocumento', 'RUC');
    } else {
      principalForm.setValue('tipoDocumento', 'DNI');
    }
  }, [principalForm]);

  // Manejar selección de dirección principal
  const handleSelectDireccion = useCallback((direccion: Direccion) => {
    principalForm.setValue('direccion', direccion);
    setIsDireccionModalOpen(false);
  }, [principalForm]);

  // Manejar selección de dirección cónyuge/representante
  const handleSelectConyugeDireccion = useCallback((direccion: Direccion) => {
    conyugeRepresentanteForm.setValue('direccion', direccion);
    setIsConyugeDireccionModalOpen(false);
  }, [conyugeRepresentanteForm]);

  // Toggle cónyuge/representante
  const toggleConyugeForm = useCallback(() => {
    setShowConyugeRepresentante(!showConyugeRepresentante);
    if (!showConyugeRepresentante) {
      conyugeRepresentanteForm.reset();
    }
  }, [showConyugeRepresentante, conyugeRepresentanteForm]);

  // Obtener texto completo de dirección
  const getDireccionTextoCompleto = useCallback((direccion: Direccion | null, nFinca: string, otroNumero?: string) => {
    if (!direccion) return '';
    
    let texto = direccion.descripcion || '';
    if (nFinca) texto += ` - N° FINCA: ${nFinca}`;
    if (otroNumero) texto += ` - ${otroNumero}`;
    
    return texto;
  }, []);

  /**
   * Validación manual de los datos del formulario
   */
  const validarFormulario = (data: any): boolean => {
    const errores = [];
    
    // Validar campos requeridos
    if (!data.tipoDocumento) {
      errores.push('Tipo de documento es requerido');
    }
    
    if (!data.numeroDocumento) {
      errores.push('Número de documento es requerido');
    }
    
    if (data.esPersonaJuridica) {
      if (!data.razonSocial) {
        errores.push('Razón social es requerida');
      }
    } else {
      // Para persona natural, validar el campo combinado o los campos separados
      if (!data.apellidosNombres && (!data.nombres || !data.apellidoPaterno || !data.apellidoMaterno)) {
        errores.push('Nombres es requerido, Apellido paterno es requerido, Apellido materno es requerido');
      }
    }
    
    if (!data.direccion) {
      errores.push('Debe seleccionar una dirección');
    }
    
    // Si hay errores, mostrarlos
    if (errores.length > 0) {
      NotificationService.error(errores.join(', '));
      return false;
    }
    
    return true;
  };

  /**
   * Manejar el submit del formulario
   * Versión simplificada sin dependencias externas
   */
  const handleSubmit = useCallback(async (data: any) => {
    try {
      // Validar formulario
      if (!validarFormulario(data)) {
        return;
      }
      
      setLoading(true);
      console.log('📋 [ContribuyenteForm] Datos a enviar:', data);

      // Preparar los datos completos incluyendo cónyuge/representante si existe
      const datosCompletos = {
        ...data,
        tieneConyugeRepresentante: showConyugeRepresentante,
        conyugeRepresentante: showConyugeRepresentante ? conyugeRepresentanteForm.getValues() : null
      };

      // Por ahora, simular el guardado
      console.log('💾 Datos preparados para guardar:', datosCompletos);
      
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mostrar mensaje de éxito
      NotificationService.success('Contribuyente registrado correctamente (simulado)');
      
      // Limpiar formulario
      handleNuevo();
      
      // NOTA: Cuando los servicios estén configurados, descomentar:
      // await guardarContribuyente(datosCompletos);
      
    } catch (error) {
      console.error('❌ [ContribuyenteForm] Error al guardar:', error);
      NotificationService.error('Error al guardar el contribuyente');
    } finally {
      setLoading(false);
    }
  }, [showConyugeRepresentante, conyugeRepresentanteForm]);

  // Manejar nuevo registro
  const handleNuevo = useCallback(() => {
    principalForm.reset();
    conyugeRepresentanteForm.reset();
    setShowConyugeRepresentante(false);
    setTipoContribuyente('natural');
  }, [principalForm, conyugeRepresentanteForm]);

  // Manejar edición (placeholder)
  const handleEditar = useCallback(() => {
    NotificationService.info('Función de edición no implementada aún');
  }, []);

  // Modal handlers
  const handleOpenDireccionModal = useCallback(() => setIsDireccionModalOpen(true), []);
  const handleCloseDireccionModal = useCallback(() => setIsDireccionModalOpen(false), []);
  const handleOpenConyugeDireccionModal = useCallback(() => setIsConyugeDireccionModalOpen(true), []);
  const handleCloseConyugeDireccionModal = useCallback(() => setIsConyugeDireccionModalOpen(false), []);

  return (
    <>
      <form onSubmit={principalForm.handleSubmit(handleSubmit)} className="p-6 space-y-6">
        {/* Selector de tipo de contribuyente */}
        <div className="flex items-center space-x-4 mb-6">
          <label className="text-sm font-medium text-gray-700">
            Tipo contribuyente (2 opciones)
          </label>
          <select
            value={tipoContribuyente === 'juridica' ? 'Persona Jurídica' : 'Persona Natural'}
            onChange={(e) => handleTipoContribuyenteChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="Persona Natural">Persona Natural</option>
            <option value="Persona Jurídica">Persona Jurídica</option>
          </select>
          <span className="text-sm text-gray-500">
            Valor: "{tipoContribuyente === 'juridica' ? 'PERSONA_JURIDICA' : 'PERSONA_NATURAL'}" | Válido: ✓
          </span>
        </div>

        {/* Datos principales */}
        <FormSection title="Datos del Contribuyente">
          <PersonaForm
            form={principalForm}
            isJuridica={esPersonaJuridica}
            onOpenDireccionModal={handleOpenDireccionModal}
            direccion={principalForm.watch('direccion')}
            getDireccionTextoCompleto={getDireccionTextoCompleto}
            disablePersonaFields={loading}
          />
        </FormSection>

        {/* Botón para agregar cónyuge/representante */}
        <div className="flex justify-start">
          <Button
            type="button"
            variant={showConyugeRepresentante ? 'secondary' : 'primary'}
            onClick={toggleConyugeForm}
            disabled={loading}
          >
            {showConyugeRepresentante 
              ? 'Ocultar' 
              : esPersonaJuridica 
                ? 'Agregar datos del representante legal' 
                : 'Agregar datos del cónyuge'}
          </Button>
        </div>

        {/* Formulario de cónyuge/representante */}
        {showConyugeRepresentante && (
          <FormSection 
            title={esPersonaJuridica ? 'Datos del representante legal' : 'Datos del cónyuge'}
          >
            <PersonaForm
              form={conyugeRepresentanteForm}
              isRepresentante={true}
              onOpenDireccionModal={handleOpenConyugeDireccionModal}
              direccion={conyugeRepresentanteForm.watch('direccion')}
              getDireccionTextoCompleto={getDireccionTextoCompleto}
              disablePersonaFields={loading}
              showDeleteButton={true}
              onDelete={() => {
                conyugeRepresentanteForm.reset();
                toggleConyugeForm();
              }}
            />
          </FormSection>
        )}

        {/* Botones de acción */}
        <div className="flex justify-end space-x-3 pt-6 border-t">
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            disabled={loading}
          >
            Guardar
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={handleEditar}
            disabled={loading}
          >
            Editar
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={handleNuevo}
            disabled={loading}
          >
            Nuevo
          </Button>
        </div>
      </form>

      {/* Modals - Fuera del formulario */}
      <SelectorDirecciones
        isOpen={isDireccionModalOpen}
        onClose={handleCloseDireccionModal}
        onSelectDireccion={handleSelectDireccion}
      />
      
      <SelectorDirecciones
        isOpen={isConyugeDireccionModalOpen}
        onClose={handleCloseConyugeDireccionModal}
        onSelectDireccion={handleSelectConyugeDireccion}
      />
    </>
  );
});

ContribuyenteForm.displayName = 'ContribuyenteForm';

export default ContribuyenteForm;
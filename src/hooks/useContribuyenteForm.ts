// src/hooks/useContribuyenteForm.ts
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { contribuyenteService, ContribuyenteFormCompleto } from '../services/contribuyenteService';
import { ContribuyenteFormData } from '../schemas/contribuyenteSchemas';
import { NotificationService } from '../components/utils/Notification';

/**
 * Hook personalizado para manejar el formulario de contribuyente
 */
export const useContribuyenteForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para los pasos del formulario
  const [currentStep, setCurrentStep] = useState(1);
  const [tipoContribuyente, setTipoContribuyente] = useState<'PERSONA_NATURAL' | 'PERSONA_JURIDICA'>('PERSONA_NATURAL');
  
  // Estado para almacenar todos los datos del formulario
  const [formData, setFormData] = useState<Partial<ContribuyenteFormData>>({});
  
  /**
   * Guarda los datos de un paso específico
   */
  const saveStepData = useCallback((stepData: Partial<ContribuyenteFormData>) => {
    setFormData(prev => ({
      ...prev,
      ...stepData
    }));
  }, []);
  
  /**
   * Navega al siguiente paso
   */
  const nextStep = useCallback(() => {
    setCurrentStep(prev => Math.min(prev + 1, 4));
  }, []);
  
  /**
   * Navega al paso anterior
   */
  const previousStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  }, []);
  
  /**
   * Guarda el contribuyente completo
   */
  const guardarContribuyente = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📤 [useContribuyenteForm] Preparando datos para enviar:', formData);
      
      // Mapear los datos del formulario al formato esperado por el servicio
      const datosCompletos: ContribuyenteFormCompleto = {
        // Datos principales
        tipoPersona: tipoContribuyente,
        tipoDocumento: formData.tipoDocumento || 'DNI',
        numeroDocumento: formData.numeroDocumento || '',
        nombres: formData.nombres || '',
        apellidoPaterno: formData.apellidoPaterno,
        apellidoMaterno: formData.apellidoMaterno,
        fechaNacimiento: formData.fechaNacimiento,
        estadoCivil: formData.estadoCivil,
        sexo: formData.sexo,
        telefono: formData.telefono,
        direccion: formData.direccion,
        codDireccion: formData.codDireccion,
        lote: formData.lote,
        
        // Datos del cónyuge (si aplica)
        conyuge: formData.tieneConyuge && formData.conyuge ? {
          tipoDocumento: formData.conyuge.tipoDocumento || 'DNI',
          numeroDocumento: formData.conyuge.numeroDocumento || '',
          nombres: formData.conyuge.nombres || '',
          apellidoPaterno: formData.conyuge.apellidoPaterno,
          apellidoMaterno: formData.conyuge.apellidoMaterno,
          fechaNacimiento: formData.conyuge.fechaNacimiento,
          sexo: formData.conyuge.sexo,
          telefono: formData.conyuge.telefono
        } : undefined,
        
        // Datos del representante legal (si aplica)
        representanteLegal: formData.tieneRepresentanteLegal && formData.representanteLegal ? {
          tipoDocumento: formData.representanteLegal.tipoDocumento || 'DNI',
          numeroDocumento: formData.representanteLegal.numeroDocumento || '',
          nombres: formData.representanteLegal.nombres || '',
          apellidoPaterno: formData.representanteLegal.apellidoPaterno,
          apellidoMaterno: formData.representanteLegal.apellidoMaterno,
          fechaNacimiento: formData.representanteLegal.fechaNacimiento,
          sexo: formData.representanteLegal.sexo,
          telefono: formData.representanteLegal.telefono
        } : undefined
      };
      
      // Llamar al servicio para crear el contribuyente
      const resultado = await contribuyenteService.crear(datosCompletos);
      
      console.log('✅ [useContribuyenteForm] Contribuyente creado:', resultado);
      
      // Mostrar mensaje de éxito
      NotificationService.success('Contribuyente registrado exitosamente');
      
      // Redireccionar a la lista de contribuyentes después de 2 segundos
      setTimeout(() => {
        navigate('/contribuyente/consulta');
      }, 2000);
      
    } catch (error: any) {
      console.error('❌ [useContribuyenteForm] Error al guardar:', error);
      setError(error.message || 'Error al guardar el contribuyente');
      NotificationService.error(error.message || 'Error al guardar el contribuyente');
    } finally {
      setLoading(false);
    }
  }, [formData, tipoContribuyente, navigate]);
  
  /**
   * Reinicia el formulario
   */
  const resetForm = useCallback(() => {
    setFormData({});
    setCurrentStep(1);
    setTipoContribuyente('PERSONA_NATURAL');
    setError(null);
  }, []);
  
  /**
   * Valida si se puede avanzar al siguiente paso
   */
  const canProceed = useCallback((step: number): boolean => {
    switch (step) {
      case 1:
        // Validar datos básicos
        return !!(
          formData.tipoDocumento &&
          formData.numeroDocumento &&
          formData.nombres &&
          (tipoContribuyente === 'PERSONA_JURIDICA' || 
           (formData.apellidoPaterno && formData.apellidoMaterno))
        );
      
      case 2:
        // Validar dirección
        return !!(formData.codDireccion && formData.direccion);
      
      case 3:
        // Validar cónyuge si aplica
        if (formData.tieneConyuge && formData.conyuge) {
          return !!(
            formData.conyuge.tipoDocumento &&
            formData.conyuge.numeroDocumento &&
            formData.conyuge.nombres
          );
        }
        return true;
      
      case 4:
        // Validar representante legal si aplica
        if (formData.tieneRepresentanteLegal && formData.representanteLegal) {
          return !!(
            formData.representanteLegal.tipoDocumento &&
            formData.representanteLegal.numeroDocumento &&
            formData.representanteLegal.nombres
          );
        }
        return true;
      
      default:
        return true;
    }
  }, [formData, tipoContribuyente]);
  
  return {
    // Estados
    loading,
    error,
    currentStep,
    tipoContribuyente,
    formData,
    
    // Métodos
    setTipoContribuyente,
    saveStepData,
    nextStep,
    previousStep,
    guardarContribuyente,
    resetForm,
    canProceed
  };
};
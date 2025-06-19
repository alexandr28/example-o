// src/hooks/usePredioAPI.ts
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { predioService, PredioData } from '../services/predioService';
import { NotificationService } from '../components/utils/Notification';

/**
 * Formatea la fecha al formato esperado por la API
 */
const formatearFecha = (fecha: any): string => {
  if (!fecha) return '';
  
  if (fecha instanceof Date) {
    return fecha.toISOString().split('T')[0];
  }
  
  if (typeof fecha === 'string') {
    const date = new Date(fecha);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
  }
  
  return '';
};

/**
 * Hook para integrar el PredioForm con la API
 */
export const usePredioAPI = (codPersona?: number) => {
  const navigate = useNavigate();
  
  /**
   * Guarda un predio usando la API
   */
  const guardarPredio = useCallback(async (formData: any) => {
    try {
      console.log('🚀 [usePredioAPI] Procesando datos del formulario:', formData);
      
      // Validar que tengamos un contribuyente seleccionado
      if (!codPersona) {
        NotificationService.error('Debe seleccionar un contribuyente primero');
        return;
      }
      
      // Validar datos mínimos
      if (!formData.direccion?.id && !formData.direccion?.codDireccion) {
        throw new Error('Debe seleccionar una dirección');
      }
      
      // Preparar datos para la API
      const predioData: PredioData = {
        codPersona: codPersona,
        anioAdquisicion: formData.anioAdquisicion,
        fechaAdquisicion: formatearFecha(formData.fechaAdquisicion),
        condicionPropiedad: formData.condicionPropiedad,
        codDireccion: formData.direccion.id || formData.direccion.codDireccion,
        nFinca: formData.nFinca || null,
        otroNumero: formData.otroNumero || null,
        arancel: parseFloat(formData.arancel) || 0,
        tipoPredio: formData.tipoPredio,
        conductor: formData.conductor,
        usoPredio: formData.usoPredio,
        areaTerreno: parseFloat(formData.areaTerreno) || 0,
        numeroPisos: parseInt(formData.numeroPisos) || 0,
        numeroCondominos: parseInt(formData.numeroCondominos) || 1,
        rutaFotografiaPredio: formData.rutaFotografiaPredio || null,
        rutaPlanoPredio: formData.rutaPlanoPredio || null,
        estado: true,
        codUsuario: 1
      };
      
      console.log('📤 [usePredioAPI] Enviando a API:', predioData);
      
      const predioCreado = await predioService.crear(predioData);
      
      console.log('✅ [usePredioAPI] Predio creado:', predioCreado);
      
      NotificationService.success('Predio registrado correctamente');
      
      // Navegar a la lista después de 2 segundos
      setTimeout(() => {
        navigate('/predio/consulta');
      }, 2000);
      
      return predioCreado;
      
    } catch (error: any) {
      console.error('❌ [usePredioAPI] Error al guardar:', error);
      NotificationService.error(error.message || 'Error al registrar predio');
      throw error;
    }
  }, [codPersona, navigate]);
  
  /**
   * Busca predios de un contribuyente
   */
  const buscarPredios = useCallback(async (codPersona: number) => {
    try {
      const predios = await predioService.buscarPorContribuyente(codPersona);
      return predios;
    } catch (error) {
      console.error('❌ [usePredioAPI] Error al buscar predios:', error);
      return [];
    }
  }, []);
  
  return {
    guardarPredio,
    buscarPredios
  };
};
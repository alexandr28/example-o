// src/hooks/useAlcabala.ts
import { useState, useEffect, useCallback } from 'react';
import { alcabalaService } from '../services/alcabalaService';
import { NotificationService } from '../components/utils/Notification';

// Tipos
interface Alcabala {
  id: number;
  anio: number;
  tasa: number;
  estado: string;
  fechaRegistro?: string;
  fechaModificacion?: string;
}

interface PaginacionData {
  paginaActual: number;
  totalPaginas: number;
  totalRegistros: number;
  registrosPorPagina: number;
}

/**
 * Hook personalizado para gestión de Alcabala
 */
export const useAlcabala = () => {
  // Estados
  const [alcabalas, setAlcabalas] = useState<Alcabala[]>([]);
  const [anioSeleccionado, setAnioSeleccionado] = useState<number | null>(null);
  const [tasaAlcabala, setTasaAlcabala] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paginacion, setPaginacion] = useState<PaginacionData>({
    paginaActual: 1,
    totalPaginas: 1,
    totalRegistros: 0,
    registrosPorPagina: 10
  });

  // Generar años disponibles (últimos 10 años)
  const currentYear = new Date().getFullYear();
  const aniosDisponibles = Array.from({ length: 10 }, (_, i) => ({
    value: currentYear - i,
    label: (currentYear - i).toString()
  }));

  // Cargar alcabalas
  const cargarAlcabalas = useCallback(async (pagina = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await alcabalaService.obtenerAlcabalas();
      
      // Paginar localmente
      const inicio = (pagina - 1) * paginacion.registrosPorPagina;
      const fin = inicio + paginacion.registrosPorPagina;
      const paginados = data.slice(inicio, fin);
      
      setAlcabalas(paginados);
      setPaginacion({
        paginaActual: pagina,
        totalPaginas: Math.ceil(data.length / paginacion.registrosPorPagina),
        totalRegistros: data.length,
        registrosPorPagina: paginacion.registrosPorPagina
      });
      
    } catch (err: any) {
      const mensaje = err.message || 'Error al cargar alcabalas';
      setError(mensaje);
      NotificationService.error(mensaje);
    } finally {
      setLoading(false);
    }
  }, [paginacion.registrosPorPagina]);

  // Cargar al montar
  useEffect(() => {
    cargarAlcabalas();
  }, [cargarAlcabalas]);

  // Handlers
  const handleAnioChange = useCallback((anio: number | null) => {
    setAnioSeleccionado(anio);
    // Buscar si ya existe una tasa para ese año
    const alcabalaExistente = alcabalas.find(a => a.anio === anio);
    if (alcabalaExistente) {
      setTasaAlcabala(alcabalaExistente.tasa);
      NotificationService.warning(`Ya existe una alcabala para el año ${anio} con tasa ${alcabalaExistente.tasa}%`);
    } else {
      setTasaAlcabala(0);
    }
  }, [alcabalas]);

  const handleTasaChange = useCallback((tasa: number) => {
    setTasaAlcabala(tasa);
  }, []);

  const registrarAlcabala = useCallback(async () => {
    if (!anioSeleccionado || tasaAlcabala <= 0) {
      NotificationService.error('Debe seleccionar un año y especificar una tasa válida');
      return;
    }

    try {
      setLoading(true);
      
      await alcabalaService.crearAlcabala({
        anio: anioSeleccionado,
        tasa: tasaAlcabala
      });
      
      // Recargar lista
      await cargarAlcabalas(paginacion.paginaActual);
      
      // Limpiar formulario
      setAnioSeleccionado(null);
      setTasaAlcabala(0);
      
      NotificationService.success('Alcabala registrada exitosamente');
      
    } catch (err: any) {
      const mensaje = err.message || 'Error al registrar alcabala';
      setError(mensaje);
      NotificationService.error(mensaje);
    } finally {
      setLoading(false);
    }
  }, [anioSeleccionado, tasaAlcabala, cargarAlcabalas, paginacion.paginaActual]);

  const cambiarPagina = useCallback((nuevaPagina: number) => {
    cargarAlcabalas(nuevaPagina);
  }, [cargarAlcabalas]);

  return {
    // Estados
    alcabalas,
    aniosDisponibles,
    anioSeleccionado,
    tasaAlcabala,
    paginacion,
    loading,
    error,
    
    // Handlers
    handleAnioChange,
    handleTasaChange,
    registrarAlcabala,
    cambiarPagina,
    cargarAlcabalas
  };
};
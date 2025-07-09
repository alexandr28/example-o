// src/hooks/useAranceles.ts
import { useState, useCallback, useEffect } from 'react';
import { arancelService } from '../services/arancelService';
import { NotificationService } from '../components/utils/Notification';

// Tipos
export interface Arancel {
  id: number;
  anio: number;
  direccionId: number;
  monto: number;
  estado?: boolean;
}

export interface ArancelFormData {
  anio: number;
  direccionId: number;
  monto: number;
}

export interface ArancelDireccion {
  id: number;
  anio: number;
  direccion: string;
  sector: string;
  barrio: string;
  tipoVia: string;
  nombreVia: string;
  cuadra: number;
  lado: string;
  loteInicial: number;
  loteFinal: number;
  monto: number;
  estado: boolean;
}

export const useAranceles = () => {
  const [aranceles, setAranceles] = useState<Arancel[]>([]);
  const [arancelesPorDireccion, setArancelesPorDireccion] = useState<ArancelDireccion[]>([]);
  const [arancelSeleccionado, setArancelSeleccionado] = useState<Arancel | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar todos los aranceles
  const cargarAranceles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await arancelService.obtenerTodos();
      
      // Mapear los datos de la API al formato esperado
      const arancelesMapeados = response.data.map(item => ({
        id: item.codArancel || 0,
        anio: item.anio,
        direccionId: item.codDireccion,
        monto: item.costo || item.costoArancel || 0,
        estado: true
      }));
      
      setAranceles(arancelesMapeados);
      console.log(`✅ ${arancelesMapeados.length} aranceles cargados`);
      
    } catch (err: any) {
      console.error('Error al cargar aranceles:', err);
      setError(err.message || 'Error al cargar aranceles');
      NotificationService.error('Error al cargar aranceles');
    } finally {
      setLoading(false);
    }
  }, []);

  // Buscar aranceles por año (para la lista)
  const buscarArancelesPorDireccion = useCallback(async (anio: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await arancelService.buscarPorAnio(anio);
      
      // Mapear los datos para la tabla (simulando datos de dirección)
      const arancelesConDireccion: ArancelDireccion[] = data.map(arancel => ({
        id: arancel.codArancel || 0,
        anio: arancel.anio,
        direccion: `Dirección ${arancel.codDireccion}`,
        sector: 'Centro', // Estos datos deberían venir de la API
        barrio: 'San Juan',
        tipoVia: 'Calle',
        nombreVia: 'Principal',
        cuadra: 1,
        lado: 'Derecho',
        loteInicial: 1,
        loteFinal: 10,
        monto: arancel.costo || arancel.costoArancel || 0,
        estado: true
      }));
      
      setArancelesPorDireccion(arancelesConDireccion);
      
      if (arancelesConDireccion.length === 0) {
        NotificationService.info(`No se encontraron aranceles para el año ${anio}`);
      }
      
    } catch (err: any) {
      console.error('Error al buscar aranceles:', err);
      setError(err.message || 'Error al buscar aranceles');
      setArancelesPorDireccion([]);
      NotificationService.error('Error al buscar aranceles');
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear nuevo arancel
  const crearArancel = useCallback(async (datos: ArancelFormData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Preparar datos para la API
      const datosAPI = {
        anio: datos.anio,
        codDireccion: datos.direccionId,
        codUsuario: 1 // Usuario por defecto
      };
      
      const nuevoArancel = await arancelService.crear(datosAPI);
      
      // Mapear y agregar a la lista
      const arancelMapeado: Arancel = {
        id: nuevoArancel.codArancel || 0,
        anio: nuevoArancel.anio,
        direccionId: nuevoArancel.codDireccion,
        monto: nuevoArancel.costo || nuevoArancel.costoArancel || 0,
        estado: true
      };
      
      setAranceles(prev => [...prev, arancelMapeado]);
      
      NotificationService.success('Arancel creado exitosamente');
      
      // Recargar datos
      await cargarAranceles();
      
      return arancelMapeado;
      
    } catch (err: any) {
      console.error('Error al crear arancel:', err);
      const mensaje = err.message || 'Error al crear arancel';
      setError(mensaje);
      NotificationService.error(mensaje);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [cargarAranceles]);

  // Actualizar arancel
  const actualizarArancel = useCallback(async (id: number, datos: Partial<ArancelFormData>) => {
    try {
      setLoading(true);
      setError(null);
      
      const datosAPI: any = {};
      if (datos.anio) datosAPI.anio = datos.anio;
      if (datos.monto !== undefined) datosAPI.costo = datos.monto;
      
      const arancelActualizado = await arancelService.actualizar(id, datosAPI);
      
      // Mapear y actualizar en la lista
      const arancelMapeado: Arancel = {
        id: arancelActualizado.codArancel || id,
        anio: arancelActualizado.anio,
        direccionId: arancelActualizado.codDireccion,
        monto: arancelActualizado.costo || arancelActualizado.costoArancel || 0,
        estado: true
      };
      
      setAranceles(prev => 
        prev.map(a => a.id === id ? arancelMapeado : a)
      );
      
      NotificationService.success('Arancel actualizado exitosamente');
      
      // Recargar datos
      await cargarAranceles();
      
      return arancelMapeado;
      
    } catch (err: any) {
      console.error('Error al actualizar arancel:', err);
      const mensaje = err.message || 'Error al actualizar arancel';
      setError(mensaje);
      NotificationService.error(mensaje);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [cargarAranceles]);

  // Eliminar arancel
  const eliminarArancel = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      
      await arancelService.eliminar(id);
      
      // Actualizar lista
      setAranceles(prev => prev.filter(a => a.id !== id));
      setArancelesPorDireccion(prev => prev.filter(a => a.id !== id));
      
      NotificationService.success('Arancel eliminado exitosamente');
      
    } catch (err: any) {
      console.error('Error al eliminar arancel:', err);
      const mensaje = err.message || 'Error al eliminar arancel';
      setError(mensaje);
      NotificationService.error(mensaje);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Seleccionar arancel
  const seleccionarArancel = useCallback((arancel: Arancel | null) => {
    setArancelSeleccionado(arancel);
  }, []);

  // Limpiar selección
  const limpiarSeleccion = useCallback(() => {
    setArancelSeleccionado(null);
  }, []);

  // Cargar datos iniciales
  useEffect(() => {
    cargarAranceles();
  }, [cargarAranceles]);

  return {
    // Estados
    aranceles,
    arancelesPorDireccion,
    arancelSeleccionado,
    loading,
    error,
    
    // Funciones principales
    cargarAranceles,
    buscarArancelesPorDireccion,
    
    // CRUD
    crearArancel,
    actualizarArancel,
    eliminarArancel,
    
    // Selección
    seleccionarArancel,
    limpiarSeleccion,
    
    // Utils
    refrescar: cargarAranceles
  };
};
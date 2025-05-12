import { useState, useCallback, useEffect } from 'react';
import { Direccion, DireccionFormData, Sector, Barrio, Calle, LadoDireccion } from '../models';

// Datos de ejemplo para pruebas
const direccionesIniciales: Direccion[] = [
  { id: 1, sectorId: 1, barrioId: 1, calleId: 1, cuadra: '1', lado: LadoDireccion.NINGUNO, loteInicial: 0, loteFinal: 0, descripcion: 'Sector + Barrio + Calle / Mz + Cuadra' },
  { id: 2, sectorId: 1, barrioId: 1, calleId: 1, cuadra: '1', lado: LadoDireccion.IZQUIERDO, loteInicial: 1, loteFinal: 60, descripcion: 'Sector + Barrio + Calle / Mz + Cuadra' },
  { id: 3, sectorId: 1, barrioId: 1, calleId: 1, cuadra: '1', lado: LadoDireccion.PAR, loteInicial: 1, loteFinal: 100, descripcion: 'Sector + Barrio + Calle / Mz + Cuadra' },
];

// Sectores para el selector
const sectoresIniciales: Sector[] = [
  { id: 1, nombre: 'SECTOR CENTRAL' },
  { id: 2, nombre: 'SECTOR JERUSALÉN' },
  { id: 3, nombre: 'URB. MANUEL ARÉVALO II' },
  { id: 4, nombre: 'PARQUE INDUSTRIAL' },
];

// Barrios para el selector (filtrados por sector)
const barriosIniciales: Barrio[] = [
  { id: 1, nombre: 'BARRIO 1', sectorId: 1 },
  { id: 2, nombre: 'BARRIO 2', sectorId: 1 },
  { id: 3, nombre: 'BARRIO 3', sectorId: 1 },
  { id: 4, nombre: 'BARRIO 4', sectorId: 2 },
  { id: 5, nombre: 'BARRIO 5', sectorId: 2 },
  { id: 6, nombre: 'BARRIO 6', sectorId: 3 },
];

// Calles para el selector
const callesIniciales: Calle[] = [
  { id: 1, tipoVia: 'avenida', nombre: 'Gran Chimú' },
  { id: 2, tipoVia: 'calle', nombre: 'Los Álamos' },
  { id: 3, tipoVia: 'jiron', nombre: 'Carabobo' },
];

// Opciones para el selector de lado
const ladosOpciones = [
  { value: LadoDireccion.NINGUNO, label: 'Ninguno' },
  { value: LadoDireccion.IZQUIERDO, label: 'Izquierdo' },
  { value: LadoDireccion.DERECHO, label: 'Derecho' },
  { value: LadoDireccion.PAR, label: 'Par' },
  { value: LadoDireccion.IMPAR, label: 'Impar' },
];

/**
 * Hook personalizado para la gestión de direcciones
 * 
 * Proporciona funcionalidades para listar, crear, actualizar y eliminar direcciones
 * Incluye la gestión de dependencias como sectores, barrios y calles
 */
export const useDirecciones = () => {
  // Estados
  const [direcciones, setDirecciones] = useState<Direccion[]>(direccionesIniciales);
  const [sectores, setSectores] = useState<Sector[]>(sectoresIniciales);
  const [barrios, setBarrios] = useState<Barrio[]>(barriosIniciales);
  const [barriosFiltrados, setBarriosFiltrados] = useState<Barrio[]>([]);
  const [calles, setCalles] = useState<Calle[]>(callesIniciales);
  const [lados] = useState(ladosOpciones);
  
  const [direccionSeleccionada, setDireccionSeleccionada] = useState<Direccion | null>(null);
  const [sectorSeleccionado, setSectorSeleccionado] = useState<number | null>(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filtrar barrios cuando cambia el sector seleccionado
  useEffect(() => {
    if (sectorSeleccionado) {
      const filtrados = barrios.filter(barrio => barrio.sectorId === sectorSeleccionado);
      setBarriosFiltrados(filtrados);
    } else {
      setBarriosFiltrados([]);
    }
  }, [sectorSeleccionado, barrios]);

  // Cargar direcciones (simula una petición a API)
  const cargarDirecciones = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Aquí iría la petición a la API
      // const response = await fetch('/api/direcciones');
      // const data = await response.json();
      // setDirecciones(data);
      
      // Simulamos un retardo
      await new Promise(resolve => setTimeout(resolve, 500));
      setDirecciones(direccionesIniciales);
    } catch (err) {
      setError('Error al cargar las direcciones');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar dependencias (sectores, barrios, calles)
  const cargarDependencias = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Aquí irían las peticiones a la API
      // const [sectoresRes, barriosRes, callesRes] = await Promise.all([
      //   fetch('/api/sectores'),
      //   fetch('/api/barrios'),
      //   fetch('/api/calles')
      // ]);
      // 
      // const sectoresData = await sectoresRes.json();
      // const barriosData = await barriosRes.json();
      // const callesData = await callesRes.json();
      // 
      // setSectores(sectoresData);
      // setBarrios(barriosData);
      // setCalles(callesData);
      
      // Simulamos un retardo
      await new Promise(resolve => setTimeout(resolve, 500));
      setSectores(sectoresIniciales);
      setBarrios(barriosIniciales);
      setCalles(callesIniciales);
    } catch (err) {
      setError('Error al cargar las dependencias');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Seleccionar una dirección para editar
  const seleccionarDireccion = useCallback((direccion: Direccion) => {
    setDireccionSeleccionada(direccion);
    setSectorSeleccionado(direccion.sectorId);
    setModoEdicion(true);
  }, []);

  // Manejar cambio de sector
  const handleSectorChange = useCallback((sectorId: number) => {
    setSectorSeleccionado(sectorId);
  }, []);

  // Limpiar selección
  const limpiarSeleccion = useCallback(() => {
    setDireccionSeleccionada(null);
    setSectorSeleccionado(null);
    setModoEdicion(false);
  }, []);

  // Generar descripción de la dirección
  const generarDescripcion = useCallback((data: DireccionFormData): string => {
    const sector = sectores.find(s => s.id === data.sectorId);
    const barrio = barrios.find(b => b.id === data.barrioId);
    const calle = calles.find(c => c.id === data.calleId);
    
    return `${sector?.nombre || ''} + ${barrio?.nombre || ''} + ${calle?.nombre || ''} / Mz + ${data.cuadra}`;
  }, [sectores, barrios, calles]);

  // Guardar una dirección (crear o actualizar)
  const guardarDireccion = useCallback(async (data: DireccionFormData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Generar descripción
      const descripcion = generarDescripcion(data);
      
      // Validaciones básicas
      if (data.loteInicial > data.loteFinal) {
        throw new Error('El lote inicial no puede ser mayor que el lote final');
      }
      
      if (modoEdicion && direccionSeleccionada) {
        // Actualizar dirección existente
        // Aquí iría la petición a la API para actualizar
        // await fetch(`/api/direcciones/${direccionSeleccionada.id}`, {
        //   method: 'PUT',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({...data, descripcion}),
        // });
        
        // Asegurarse de que lado sea del tipo correcto (LadoDireccion)
        // Podemos verificar que el valor esté en el enum antes de asignarlo
        let ladoValue: LadoDireccion;
        
        // Verificar si el lado proporcionado es válido para LadoDireccion
        if (Object.values(LadoDireccion).includes(data.lado as LadoDireccion)) {
          ladoValue = data.lado as LadoDireccion;
        } else {
          // Si no es válido, usar un valor por defecto
          ladoValue = LadoDireccion.NINGUNO;
        }
        
        // Crear un objeto que cumpla con el tipo Direccion
        const direccionActualizada: Direccion = {
          ...direccionSeleccionada,
          sectorId: data.sectorId,
          barrioId: data.barrioId,
          calleId: data.calleId,
          cuadra: data.cuadra,
          lado: ladoValue,
          loteInicial: data.loteInicial,
          loteFinal: data.loteFinal,
          descripcion,
          sector: sectores.find(s => s.id === data.sectorId),
          barrio: barrios.find(b => b.id === data.barrioId),
          calle: calles.find(c => c.id === data.calleId)
        };
        
        // Actualizar estado local con tipado correcto
        setDirecciones(prev => 
          prev.map(dir => 
            dir.id === direccionSeleccionada.id ? direccionActualizada : dir
          )
        );
      } else {
        // Asegurarse de que lado sea del tipo correcto (LadoDireccion)
        let ladoValue: LadoDireccion;
        
        // Verificar si el lado proporcionado es válido para LadoDireccion
        if (Object.values(LadoDireccion).includes(data.lado as LadoDireccion)) {
          ladoValue = data.lado as LadoDireccion;
        } else {
          // Si no es válido, usar un valor por defecto
          ladoValue = LadoDireccion.NINGUNO;
        }
        
        // Crear nueva dirección
        // Aquí iría la petición a la API para crear
        // const response = await fetch('/api/direcciones', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({...data, descripcion}),
        // });
        // const nuevaDireccion = await response.json();
        
        // Simulamos la creación con un ID nuevo - con tipado correcto
        const nuevaDireccion: Direccion = {
          id: Math.max(0, ...direcciones.map(d => d.id)) + 1,
          sectorId: data.sectorId,
          barrioId: data.barrioId,
          calleId: data.calleId,
          cuadra: data.cuadra,
          lado: ladoValue,
          loteInicial: data.loteInicial,
          loteFinal: data.loteFinal,
          descripcion,
          sector: sectores.find(s => s.id === data.sectorId),
          barrio: barrios.find(b => b.id === data.barrioId),
          calle: calles.find(c => c.id === data.calleId)
        };
        
        // Actualizar estado local
        setDirecciones(prev => [...prev, nuevaDireccion]);
      }
      
      // Resetear estados
      limpiarSeleccion();
    } catch (err: any) {
      setError(err.message || 'Error al guardar la dirección');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [direcciones, direccionSeleccionada, modoEdicion, sectores, barrios, calles, limpiarSeleccion, generarDescripcion]);

  // Eliminar una dirección
  const eliminarDireccion = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      
      // Aquí iría la petición a la API para eliminar
      // await fetch(`/api/direcciones/${id}`, {
      //   method: 'DELETE',
      // });
      
      // Actualizar estado local
      setDirecciones(prev => prev.filter(dir => dir.id !== id));
      
      // Si la dirección eliminada estaba seleccionada, limpiar selección
      if (direccionSeleccionada?.id === id) {
        limpiarSeleccion();
      }
    } catch (err) {
      setError('Error al eliminar la dirección');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [direccionSeleccionada, limpiarSeleccion]);

  return {
    direcciones,
    sectores,
    barrios,
    barriosFiltrados,
    calles,
    lados,
    direccionSeleccionada,
    sectorSeleccionado,
    modoEdicion,
    loading,
    error,
    cargarDirecciones,
    cargarDependencias,
    seleccionarDireccion,
    handleSectorChange,
    limpiarSeleccion,
    guardarDireccion,
    eliminarDireccion,
    setModoEdicion,
  };
};
import { useState, useCallback, useEffect } from 'react';
import { Arancel, ArancelFormData, Direccion, EstadoArancel, LadoDireccion } from '../models';

// Años disponibles para el selector
const añosDisponibles = [
  { value: '2025', label: '2025' },
  { value: '2024', label: '2024' },
  { value: '2023', label: '2023' },
  { value: '2022', label: '2022' },
];

// Datos de ejemplo para pruebas
const arancelesIniciales: Arancel[] = [
  { 
    id: 1, 
    año: 2025, 
    direccionId: 1, 
    direccion: { 
      id: 1, 
      sectorId: 1, 
      barrioId: 1, 
      calleId: 1, 
      cuadra: '1', 
      lado: LadoDireccion.IZQUIERDO, 
      loteInicial: 0, 
      loteFinal: 0, 
      descripcion: 'SECTOR + BARRIO + CALLE + MZ + CUADRA + LADO + LT INICIAL + LT FINAL' 
    }, 
    lado: LadoDireccion.IZQUIERDO,
    loteInicial: 1,
    loteFinal: 10,
    monto: 0.00,
    estado: EstadoArancel.ACTIVO
  },
  { 
    id: 2, 
    año: 2025, 
    direccionId: 2, 
    direccion: { 
      id: 2, 
      sectorId: 1, 
      barrioId: 1, 
      calleId: 2, 
      cuadra: '2', 
      lado: LadoDireccion.DERECHO, 
      loteInicial: 0, 
      loteFinal: 0, 
      descripcion: 'Calle Los Álamos' 
    }, 
    lado: LadoDireccion.DERECHO,
    loteInicial: 1,
    loteFinal: 20,
    monto: 0.00,
    estado: EstadoArancel.ACTIVO
  },
  { 
    id: 3, 
    año: 2024, 
    direccionId: 3, 
    direccion: { 
      id: 3, 
      sectorId: 1, 
      barrioId: 1, 
      calleId: 3, 
      cuadra: '3', 
      lado: LadoDireccion.PAR, 
      loteInicial: 0, 
      loteFinal: 0, 
      descripcion: 'Pje Carabobo' 
    }, 
    lado: LadoDireccion.PAR,
    loteInicial: 1,
    loteFinal: 15,
    monto: 0.00,
    estado: EstadoArancel.ACTIVO
  },
];

// Direcciones para el selector
const direccionesIniciales: Direccion[] = [
  { 
    id: 1, 
    sectorId: 1, 
    barrioId: 1, 
    calleId: 1, 
    cuadra: '1', 
    lado: LadoDireccion.IZQUIERDO, 
    loteInicial: 0, 
    loteFinal: 0, 
    descripcion: 'SECTOR + BARRIO + CALLE + MZ + CUADRA' 
  },
  { 
    id: 2, 
    sectorId: 1, 
    barrioId: 1, 
    calleId: 2, 
    cuadra: '2', 
    lado: LadoDireccion.DERECHO, 
    loteInicial: 0, 
    loteFinal: 0, 
    descripcion: 'Calle Los Álamos' 
  },
  { 
    id: 3, 
    sectorId: 1, 
    barrioId: 1, 
    calleId: 3, 
    cuadra: '3', 
    lado: LadoDireccion.PAR, 
    loteInicial: 0, 
    loteFinal: 0, 
    descripcion: 'Pje Carabobo' 
  },
];

/**
 * Hook personalizado para la gestión de aranceles
 * 
 * Proporciona funcionalidades para listar, crear, actualizar y eliminar aranceles
 */
export const useAranceles = () => {
  // Estados
  const [aranceles, setAranceles] = useState<Arancel[]>(arancelesIniciales);
  const [direcciones, setDirecciones] = useState<Direccion[]>(direccionesIniciales);
  const [años] = useState(añosDisponibles);
  
  const [arancelSeleccionado, setArancelSeleccionado] = useState<Arancel | null>(null);
  const [direccionSeleccionada, setDireccionSeleccionada] = useState<Direccion | null>(null);
  const [añoSeleccionado, setAñoSeleccionado] = useState<number | null>(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar aranceles (simula una petición a API)
  const cargarAranceles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Aquí iría la petición a la API
      // const response = await fetch('/api/aranceles');
      // const data = await response.json();
      // setAranceles(data);
      
      // Simulamos un retardo
      await new Promise(resolve => setTimeout(resolve, 500));
      setAranceles(arancelesIniciales);
    } catch (err) {
      setError('Error al cargar los aranceles');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

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

  // Cargar datos iniciales
  useEffect(() => {
    cargarAranceles();
    cargarDirecciones();
  }, [cargarAranceles, cargarDirecciones]);

  // Seleccionar un arancel para editar
  const seleccionarArancel = useCallback((arancel: Arancel) => {
    setArancelSeleccionado(arancel);
    setDireccionSeleccionada(direcciones.find(d => d.id === arancel.direccionId) || null);
    setAñoSeleccionado(arancel.año);
    setModoEdicion(true);
  }, [direcciones]);

  // Seleccionar una dirección
  const seleccionarDireccion = useCallback((direccion: Direccion) => {
    setDireccionSeleccionada(direccion);
  }, []);

  // Manejar cambio de año
  const handleAñoChange = useCallback((año: number) => {
    setAñoSeleccionado(año);
  }, []);

  // Limpiar selección
  const limpiarSeleccion = useCallback(() => {
    setArancelSeleccionado(null);
    setDireccionSeleccionada(null);
    setAñoSeleccionado(null);
    setModoEdicion(false);
  }, []);

  // Función auxiliar para convertir string a LadoDireccion
  const convertirALadoDireccion = (lado: string): LadoDireccion => {
    switch (lado) {
      case 'I':
        return LadoDireccion.IZQUIERDO;
      case 'D':
        return LadoDireccion.DERECHO;
      case 'P':
        return LadoDireccion.PAR;
      case 'IM':
        return LadoDireccion.IMPAR;
      default:
        return LadoDireccion.NINGUNO;
    }
  };

  // Guardar un arancel (crear o actualizar)
  const guardarArancel = useCallback(async (data: ArancelFormData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Validaciones básicas
      if (!data.direccionId) {
        throw new Error('Debe seleccionar una dirección');
      }
      
      if (!data.año) {
        throw new Error('Debe seleccionar un año');
      }
      
      if (data.loteInicial > data.loteFinal) {
        throw new Error('El lote inicial debe ser menor o igual al lote final');
      }
      
      // Buscar la dirección seleccionada
      const direccion = direcciones.find(d => d.id === data.direccionId);
      if (!direccion) {
        throw new Error('Dirección no encontrada');
      }
      
      // Convertir lado a LadoDireccion
      const ladoEnum = convertirALadoDireccion(data.lado);
      
      if (modoEdicion && arancelSeleccionado) {
        // Actualizar arancel existente
        // Aquí iría la petición a la API para actualizar
        // await fetch(`/api/aranceles/${arancelSeleccionado.id}`, {
        //   method: 'PUT',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(data),
        // });
        
        // Actualizar estado local
        const arancelActualizado: Arancel = {
          ...arancelSeleccionado,
          ...data,
          lado: ladoEnum,
          direccion,
          estado: EstadoArancel.ACTIVO
        };
        
        setAranceles(prev => 
          prev.map(a => 
            a.id === arancelSeleccionado.id ? arancelActualizado : a
          )
        );
      } else {
        // Crear nuevo arancel
        // Aquí iría la petición a la API para crear
        // const response = await fetch('/api/aranceles', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(data),
        // });
        // const nuevoArancel = await response.json();
        
        // Simulamos la creación con un ID nuevo
        const nuevoArancel: Arancel = {
          id: Math.max(0, ...aranceles.map(a => a.id)) + 1,
          ...data,
          lado: ladoEnum,
          direccion,
          estado: EstadoArancel.ACTIVO
        };
        
        // Actualizar estado local
        setAranceles(prev => [...prev, nuevoArancel]);
      }
      
      // Resetear estados
      limpiarSeleccion();
    } catch (err: any) {
      setError(err.message || 'Error al guardar el arancel');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [aranceles, arancelSeleccionado, modoEdicion, direcciones, limpiarSeleccion]);

  // Eliminar un arancel
  const eliminarArancel = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      
      // Aquí iría la petición a la API para eliminar
      // await fetch(`/api/aranceles/${id}`, {
      //   method: 'DELETE',
      // });
      
      // Actualizar estado local
      setAranceles(prev => prev.filter(a => a.id !== id));
      
      // Si el arancel eliminado estaba seleccionado, limpiar selección
      if (arancelSeleccionado?.id === id) {
        limpiarSeleccion();
      }
    } catch (err) {
      setError('Error al eliminar el arancel');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [arancelSeleccionado, limpiarSeleccion]);

  // Filtrar aranceles por año y/o término de búsqueda
  const filtrarAranceles = useCallback((año?: number, terminoBusqueda?: string) => {
    let arancelesFiltrados = aranceles;
    
    // Filtrar por año
    if (año) {
      arancelesFiltrados = arancelesFiltrados.filter(a => a.año === año);
    }
    
    // Filtrar por término de búsqueda
    if (terminoBusqueda && terminoBusqueda.trim()) {
      const termino = terminoBusqueda.toLowerCase().trim();
      arancelesFiltrados = arancelesFiltrados.filter(a => 
        a.direccion?.descripcion?.toLowerCase().includes(termino) ||
        `${a.monto}`.includes(termino) ||
        a.estado.toLowerCase().includes(termino)
      );
    }
    
    return arancelesFiltrados;
  }, [aranceles]);

  return {
    aranceles,
    direcciones,
    años,
    arancelSeleccionado,
    direccionSeleccionada,
    añoSeleccionado,
    modoEdicion,
    loading,
    error,
    cargarAranceles,
    cargarDirecciones,
    seleccionarArancel,
    seleccionarDireccion,
    handleAñoChange,
    limpiarSeleccion,
    guardarArancel,
    eliminarArancel,
    filtrarAranceles,
    setModoEdicion,
  };
};
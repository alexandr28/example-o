import { useState, useCallback, useEffect } from 'react';
import { Contribuyente, FiltroContribuyente } from '../models/Contribuyente';

/**
 * Hook personalizado para la gestión de contribuyentes
 * 
 * Proporciona funcionalidades para listar, buscar, crear, actualizar y eliminar contribuyentes
 */
export const useContribuyentes = () => {
  // Estados
  const [contribuyentes, setContribuyentes] = useState<Contribuyente[]>([]);
  const [filtro, setFiltro] = useState<FiltroContribuyente>({
    tipoContribuyente: '',
    busqueda: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagina, setPagina] = useState(1);
  const [porPagina] = useState(10);
  const [total, setTotal] = useState(0);

  // Cargar contribuyentes iniciales
  useEffect(() => {
    cargarContribuyentes();
  }, []);

  // Cargar contribuyentes con filtros
  const cargarContribuyentes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // En un caso real, esto sería una petición a la API
      // const response = await fetch(`/api/contribuyentes?tipoContribuyente=${filtro.tipoContribuyente}&busqueda=${filtro.busqueda}&pagina=${pagina}&porPagina=${porPagina}`);
      // const data = await response.json();
      // setContribuyentes(data.contribuyentes);
      // setTotal(data.total);
      
      // Simulamos una carga con timeout
      setTimeout(() => {
        // Datos de ejemplo
        const contribuyentesMock: Contribuyente[] = [
          { 
            codigo: '0000001', 
            nombre: 'Nombre del contribuyente 1', 
            documento: '12345678', 
            direccion: 'Dirección fiscal del contribuyente 1',
            tipo: 'natural',
            estado: 'activo'
          },
          { 
            codigo: '0000002', 
            nombre: 'Nombre del contribuyente 2', 
            documento: '20705557433', 
            direccion: 'Dirección fiscal del contribuyente 2',
            tipo: 'juridica',
            estado: 'activo'
          },
        ];
        
        // Filtrar si hay criterios de búsqueda
        let filtrados = contribuyentesMock;
        
        if (filtro.tipoContribuyente) {
          filtrados = filtrados.filter(c => c.tipo === filtro.tipoContribuyente);
        }
        
        if (filtro.busqueda) {
          const busqueda = filtro.busqueda.toLowerCase();
          filtrados = filtrados.filter(c => 
            c.nombre.toLowerCase().includes(busqueda) || 
            c.documento.toLowerCase().includes(busqueda) || 
            c.direccion.toLowerCase().includes(busqueda)
          );
        }
        
        setContribuyentes(filtrados);
        setTotal(filtrados.length);
        setLoading(false);
      }, 500);
      
    } catch (err: any) {
      setError(err.message || 'Error al cargar contribuyentes');
      setLoading(false);
    }
  }, [filtro, pagina, porPagina]);

  // Actualizar filtros y recargar
  const buscarContribuyentes = useCallback((nuevoFiltro: FiltroContribuyente) => {
    setFiltro(nuevoFiltro);
    setPagina(1); // Resetear a primera página
    
    // Disparar la carga con los nuevos filtros
    cargarContribuyentes();
  }, [cargarContribuyentes]);

  // Obtener un contribuyente por su código
  const obtenerContribuyente = useCallback(async (codigo: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // En un caso real, esto sería una petición a la API
      // const response = await fetch(`/api/contribuyentes/${codigo}`);
      // const data = await response.json();
      // return data;
      
      // Simulamos una carga con timeout
      return new Promise<Contribuyente>((resolve) => {
        setTimeout(() => {
          const contribuyente = contribuyentes.find(c => c.codigo === codigo);
          
          if (contribuyente) {
            resolve(contribuyente);
          } else {
            setError('Contribuyente no encontrado');
          }
          
          setLoading(false);
        }, 300);
      });
      
    } catch (err: any) {
      setError(err.message || 'Error al obtener contribuyente');
      setLoading(false);
      throw err;
    }
  }, [contribuyentes]);

  // Cambiar de página
  const cambiarPagina = useCallback((nuevaPagina: number) => {
    setPagina(nuevaPagina);
    cargarContribuyentes();
  }, [cargarContribuyentes]);

  return {
    contribuyentes,
    filtro,
    loading,
    error,
    pagina,
    porPagina,
    total,
    buscarContribuyentes,
    cargarContribuyentes,
    obtenerContribuyente,
    cambiarPagina
  };
};

export default useContribuyentes;
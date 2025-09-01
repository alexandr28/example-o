// src/hooks/useConstantesOptions.ts
import { useState, useEffect } from 'react';
import { constanteService, type ConstanteData, type GrupoUsoData, type UbicacionAreaVerdeData, type UsoPredioData } from '../services';

/**
 * Interface para las opciones formateadas
 */
export interface OptionFormat {
  value: string | number;
  label: string;
  id?: string | number;
  icon?: React.ReactNode;
  description?: string;
  [key: string]: any;
}

/**
 * Hook personalizado para cargar opciones desde el constanteService
 * @param fetchFunction - Función que obtiene los datos del constanteService
 * @param formatter - Función opcional para formatear los datos
 * @param defaultOptions - Opciones por defecto en caso de error
 * @returns {options, loading, error}
 */
export const useConstantesOptions = (
  fetchFunction: () => Promise<ConstanteData[]>,
  formatter?: (data: ConstanteData) => OptionFormat,
  defaultOptions: OptionFormat[] = []
) => {
  const [options, setOptions] = useState<OptionFormat[]>(defaultOptions);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadOptions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await fetchFunction();
        
        if (!mounted) return;
        
        const formattedOptions = data.map(item => 
          formatter ? formatter(item) : {
            value: item.codConstante,
            label: item.nombreCategoria,
            id: item.codConstante
          }
        );
        
        setOptions(formattedOptions);
        
      } catch (err) {
        if (!mounted) return;
        
        const errorMessage = err instanceof Error ? err.message : 'Error al cargar las opciones';
        console.error('Error cargando opciones:', err);
        setError(errorMessage);
        
        // Si hay error, mantener las opciones por defecto
        if (defaultOptions.length > 0) {
          setOptions(defaultOptions);
          console.warn('Usando opciones por defecto debido al error');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadOptions();

    // Cleanup function
    return () => {
      mounted = false;
    };
  }, []); // Sin dependencias para que solo se ejecute una vez

  return { options, loading, error };
};

/**
 * Hook específico para tipos de documento
 */
export const useTipoDocumentoOptions = (isJuridica: boolean = false) => {
  const defaultOptions: OptionFormat[] = isJuridica
    ? [{ value: '4102', label: 'RUC', id: '4102' }]
    : [
        { value: '4101', label: 'DNI', id: '4101' },
        { value: '4103', label: 'Carnet de Extranjería', id: '4103' },
        { value: '4104', label: 'Pasaporte', id: '4104' }
      ];

  return useConstantesOptions(
    () => constanteService.obtenerTiposDocumento(),
    (data) => ({
      value: data.codConstante,
      label: data.nombreCategoria,
      id: data.codConstante
    }),
    defaultOptions
  );
};

/**
 * Hook específico para estados civiles
 */
export const useEstadoCivilOptions = () => {

  return useConstantesOptions(
    () => constanteService.obtenerTiposEstadoCivil(),
    undefined, // Usar formatter por defecto

  );
};

/**
 * Hook específico para sexos
 */
export const useSexoOptions = () => {
  const defaultOptions: OptionFormat[] = [
    { value: '2001', label: 'Masculino', id: '2001' },
    { value: '2002', label: 'Femenino', id: '2002' }
  ];

  return useConstantesOptions(
    () => constanteService.obtenerTiposSexo(),
    undefined,
    defaultOptions
  );
};

/**
 * Hook específico para tipos de vía
 */
export const useTipoViaOptions = () => {
  const defaultOptions: OptionFormat[] = [
    { value: '3801', label: 'Avenida', id: '3801' },
    { value: '3802', label: 'Calle', id: '3802' },
    { value: '3803', label: 'Jirón', id: '3803' },
    { value: '3804', label: 'Pasaje', id: '3804' },
    { value: '3805', label: 'Carretera', id: '3805' }
  ];

  return useConstantesOptions(
    () => constanteService.obtenerTiposTipoVia(), // Sin la 's' final
    undefined,
    defaultOptions
  );
};

/**
 * Hook específico para Modo Declaracion
 */
export const useModoDeclaracionOptions = () => {
  return useConstantesOptions(
    () => constanteService.obtenerTiposModoDeclaracion(),
    undefined,
  );
};
/**
 * Hook específico  Material Predominante
 */
export const useTiposMaterialPredominante = () => {
  return useConstantesOptions(
    () => constanteService.obtenerTiposMaterialEstructuralPredominante(),
    undefined,
  )
}

/**
 * Hook específico para condición de propiedad
 */
export const useCondicionPropiedadOptions = () => {
  const defaultOptions: OptionFormat[] = [
    { value: '2701', label: 'Propietario Único', id: '2701' },
    { value: '2702', label: 'Propietario', id: '2702' },
    { value: '2703', label: 'Poseedor', id: '2703' },
    { value: '2704', label: 'Arrendatario', id: '2704' },
    { value: '2705', label: 'Usufructuario', id: '2705' },
    { value: '2706', label: 'Otro', id: '2706' }
  ];

  return useConstantesOptions(
    () => constanteService.obtenerTiposCondicionPropiedad(),
    undefined,
    defaultOptions
  );
};

/**
 * Hook específico para tipo de predio
 */
export const useTipoPredioOptions = () => {
  const defaultOptions: OptionFormat[] = [
    { value: '2601', label: 'Predio Independiente', id: '2601' },
    { value: '2602', label: 'Departamento en Edificio', id: '2602' },
    { value: '2603', label: 'Predio en Quinta', id: '2603' },
    { value: '2604', label: 'Cuarto en Casa Vecindad', id: '2604' },
    { value: '2605', label: 'Otros', id: '2605' }
  ];

  return useConstantesOptions(
    () => constanteService.obtenerTiposTipoPredio(),
    undefined,
    defaultOptions
  );
};

/**
 * Hook específico para estados de conservación
 */
export const useEstadoConservacionOptions = () => {
  const defaultOptions: OptionFormat[] = [
    { value: '9401', label: 'Muy Bueno', id: '9401' },
    { value: '9402', label: 'Bueno', id: '9402' },
    { value: '9403', label: 'Regular', id: '9403' },
    { value: '9404', label: 'Malo', id: '9404' }
  ];

  return useConstantesOptions(
    () => constanteService.obtenerTiposEstadosConservacion(),
    undefined,
    defaultOptions
  );
};

/**
 * Hook específico para años
 * No usa el servicio porque los códigos del API no corresponden a años reales
 */
export const useAnioOptions = (startYear: number = 2020, endYear?: number) => {
  const currentYear = endYear || new Date().getFullYear();
  const options: OptionFormat[] = [];
  
  // Generar años desde el año actual hacia atrás hasta startYear
  for (let year = currentYear; year >= startYear; year--) {
    options.push({
      value: year, // Usar el número del año directamente
      label: year.toString(),
      id: year.toString(),
      description: year === currentYear ? 'Año actual' : undefined
    });
  }

  // Retornar directamente las opciones generadas, sin usar el servicio
  return {
    options,
    loading: false,
    error: null
  };
};

/**
 * Hook específico para categorías de valores unitarios (padre)
 * Ahora retorna las categorías PADRE reales: 1001, 1002, 1003
 */
export const useCategoriasValoresUnitariosOptions = () => {
  const [options, setOptions] = useState<OptionFormat[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadOptions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔍 [useCategoriasValoresUnitariosOptions] Obteniendo categorías PADRE reales...');
        
        // Usar el método que ahora retorna las categorías padre reales (1001, 1002, 1003)
        const data = await constanteService.obtenerCategoriasValoresUnitariosHijos();
        
        if (!mounted) return;
        
        console.log('📡 [useCategoriasValoresUnitariosOptions] Categorías padre obtenidas:', data);
        
        if (data && data.length > 0) {
          const formattedOptions = data.map(item => ({
            value: item.codConstante,
            label: item.nombreCategoria,
            id: item.codConstante
          }));
          
          console.log('✅ [useCategoriasValoresUnitariosOptions] Opciones PADRE formateadas:', formattedOptions);
          setOptions(formattedOptions);
        } else {
          console.log('⚠️ [useCategoriasValoresUnitariosOptions] No se obtuvieron categorías padre');
          // Fallback con las categorías conocidas
          const fallbackOptions: OptionFormat[] = [
            { value: '1001', label: 'Estructuras', id: '1001' },
            { value: '1002', label: 'Acabados', id: '1002' },
            { value: '1003', label: 'Instalaciones Eléctricas y Sanitarias', id: '1003' }
          ];
          setOptions(fallbackOptions);
        }
        
      } catch (err) {
        if (!mounted) return;
        
        const errorMessage = err instanceof Error ? err.message : 'Error al cargar las opciones padre';
        console.error('❌ [useCategoriasValoresUnitariosOptions] Error:', err);
        setError(errorMessage);
        
        // Usar opciones por defecto en caso de error
        console.log('🔄 [useCategoriasValoresUnitariosOptions] Usando opciones por defecto debido al error');
        const fallbackOptions: OptionFormat[] = [
          { value: '1001', label: 'Estructuras', id: '1001' },
          { value: '1002', label: 'Acabados', id: '1002' },
          { value: '1003', label: 'Instalaciones Eléctricas y Sanitarias', id: '1003' }
        ];
        setOptions(fallbackOptions);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadOptions();

    return () => {
      mounted = false;
    };
  }, []);

  return { options, loading, error };
};

/**
 * Hook específico para categorías hijas de valores unitarios
 * Ahora carga los HIJOS REALES según el padre seleccionado:
 * - 1001 (Estructuras) → 100101, 100102
 * - 1002 (Acabados) → 100201, 100202, 100203, 100204  
 * - 1003 (Instalaciones) → 100301
 */
export const useCategoriasValoresUnitariosHijosOptions = (codigoPadreSeleccionado?: string) => {
  const [options, setOptions] = useState<OptionFormat[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    
    const loadOptions = async () => {
      console.log(`🎯 [useCategoriasValoresUnitariosHijosOptions] Hook ejecutado con padre: "${codigoPadreSeleccionado}"`);
      
      // Si no hay padre seleccionado, limpiar opciones
      if (!codigoPadreSeleccionado) {
        console.log('⚠️ [useCategoriasValoresUnitariosHijosOptions] No hay padre, limpiando hijos');
        setOptions([]);
        setLoading(false);
        setError(null);
        return;
      }

      // Normalizar el código del padre
      const codigoPadre = String(codigoPadreSeleccionado).trim();
      console.log(`🔍 [useCategoriasValoresUnitariosHijosOptions] Código normalizado: "${codigoPadre}"`);
      
      // Verificar que el código padre es válido (1001, 1002, 1003)
      const padresValidos = ['1001', '1002', '1003'];
      if (!padresValidos.includes(codigoPadre)) {
        console.log(`⚠️ [useCategoriasValoresUnitariosHijosOptions] Código padre no válido: ${codigoPadre}`);
        setOptions([]);
        setLoading(false);
        setError(null);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        console.log(`📡 [useCategoriasValoresUnitariosHijosOptions] Obteniendo hijos REALES para padre ${codigoPadre}...`);
        
        // Llamar al nuevo método que obtiene hijos reales
        const hijosReales = await constanteService.obtenerHijosRealesPorPadre(codigoPadre);
        
        if (!mounted) return;
        
        console.log(`📡 [useCategoriasValoresUnitariosHijosOptions] Respuesta hijos reales:`, hijosReales);
        
        if (hijosReales && hijosReales.length > 0) {
          const formattedOptions = hijosReales.map(item => ({
            value: item.codConstante,
            label: item.nombreCategoria,
            id: item.codConstante
          }));
          
          console.log(`✅ [useCategoriasValoresUnitariosHijosOptions] ${hijosReales.length} hijos reales formateados:`, formattedOptions);
          setOptions(formattedOptions);
        } else {
          console.log('⚠️ [useCategoriasValoresUnitariosHijosOptions] No se obtuvieron hijos reales');
          setOptions([]);
        }
        
      } catch (err) {
        if (!mounted) return;
        
        console.error('❌ [useCategoriasValoresUnitariosHijosOptions] Error al cargar hijos reales:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar hijos');
        setOptions([]);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    
    loadOptions();
    
    return () => {
      mounted = false;
    };
  }, [codigoPadreSeleccionado]); // Solo reaccionar cuando cambie el padre

  console.log(`📊 [useCategoriasValoresUnitariosHijosOptions] Estado actual - opciones: ${options.length}`);
  
  return { options, loading, error };
};

/**
 * Hook para obtener un único valor unitario específico
 */
export const useValorUnitarioEspecifico = (tipo: 'estructuras' | 'acabados' | 'instalaciones') => {
  const [data, setData] = useState<ConstanteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let result: ConstanteData | null = null;
        
        switch(tipo) {
          case 'estructuras':
            result = await constanteService.obtenerValoresUnitariosMurosColumnas();
            break;
          case 'acabados':
            result = await constanteService.obtenerValoresUnitariosTechos();
            break;
          case 'instalaciones':
            result = await constanteService.obtenerValoresUnitariosPisos();
            break;
        }
        
        if (!mounted) return;
        
        setData(result);
        
      } catch (err) {
        if (!mounted) return;
        
        const errorMessage = err instanceof Error ? err.message : 'Error al cargar el valor unitario';
        console.error('Error cargando valor unitario:', err);
        setError(errorMessage);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [tipo]);

  return { data, loading, error };
};

/**
 * Hook específico para lista de conductores
 */
export const useListaConductorOptions = () => {
  const defaultOptions: OptionFormat[] = [
    { value: '1401', label: 'Privado', id: '1401' },
    { value: '1402', label: 'Estatal', id: '1402' },
 
  ];

  return useConstantesOptions(
    () => constanteService.obtenerTiposListaConductor(),
    undefined,
    defaultOptions
  );
};

/**
 * Hook específico para lista de usos
 */
export const useListaUsosOptions = () => {
  const defaultOptions: OptionFormat[] = [
    { value: '1501', label: 'Casa Habitación', id: '1501' },
    { value: '1502', label: 'Comercio', id: '1502' },
    { value: '1503', label: 'Industria', id: '1503' },
    { value: '1504', label: 'Servicio', id: '1504' }
  ];

  return useConstantesOptions(
    () => constanteService.obtenerTiposListaUso(),
    undefined,
    defaultOptions
  );
};

/**
 * Hook específico para estados de predio
 */
export const useEstadoPredioOptions = () => {
  const defaultOptions: OptionFormat[] = [
    { value: '2501', label: 'Terminado', id: '2501' },
    { value: '2502', label: 'En Construcción', id: '2502' },
    { value: '2503', label: 'En Ruinas', id: '2503' },
    { value: '2504', label: 'Paralizado', id: '2504' }
  ];

  return useConstantesOptions(
    () => constanteService.obtenerTiposEstadoPredio(),
    undefined,
    defaultOptions
  );
};

/**
 * Hook específico para clasificación
 */
export const useClasificacionOptions = () => {
  const defaultOptions: OptionFormat[] = [
    { value: '3201', label: 'Urbano', id: '3201' },
    { value: '3202', label: 'Rural', id: '3202' }
  ];

  return useConstantesOptions(
    () => constanteService.obtenerTiposClasificacion(),
    undefined,
    defaultOptions
  );
};

export const useClasificacionPredio =()=> {
  const defaultOptions : OptionFormat[] = [
    {value: '0501', label:'CASAS HABITACION Y DEPARTAMENTO PARA CASAS' , id:'0501'},
    {value: '0502', label:'TIENDAS,DEPOSITOS,CENTROS DE RECREACION O ESPARCIMIENTO,CLUBS SOCIALES O INSTITUCIONES' , id:'0502'},
    {value: '0503', label:'EDIFICIOS - OFICINAS' , id:'0503'},
    {value: '0504', label:'CLINICAS,HOSPITALES,CINES,INDUSTRIAS,COLEGIOS,TALLERES' , id:'0504'},
    {value: '0505', label:'COMERCIO' , id:'0505'},
  ]
  return useConstantesOptions(
    () => constanteService.obtenerTiposCasa(),
    undefined,
    defaultOptions

  );
}

export const useTipoNivelAntiguedad = () =>{
  return useConstantesOptions(
    () => constanteService.obtenerTiposNivelAntiguedad(),
    undefined,
  );
}

export const useMaterialPredominante = () => {
  return useConstantesOptions(
    () => constanteService.obtenerTiposMaterialEstructuralPredominante(),
    undefined,
  );
}
export const useTiposLadosDireccion = () => {
  const defaultOptions: OptionFormat[] = [
    { value: 'NINGUNO', label: 'NINGUNO', id: '8103' },
    { value: 'PAR', label: 'PAR', id: '8101' },
    { value: 'IMPAR', label: 'IMPAR', id: '8102' }
  ];

  const formatter = (item: any): OptionFormat => {
    console.log('🔍 [useTiposLadosDireccion] Formatting item:', item);
    return {
      value: item.nombreCategoria?.trim() || item.nombre?.trim() || '',
      label: item.nombreCategoria?.trim() || item.nombre?.trim() || '',
      id: item.codConstante?.trim() || item.codigo?.toString() || ''
    };
  };

  const fetchFunction = async () => {
    console.log('🔍 [useTiposLadosDireccion] Calling constanteService.obtenerTiposLadosDirecciones()');
    try {
      const result = await constanteService.obtenerTiposLadosDirecciones();
      console.log('🔍 [useTiposLadosDireccion] Raw API result:', result);
      return result;
    } catch (error) {
      console.error('❌ [useTiposLadosDireccion] Error fetching:', error);
      throw error;
    }
  };

  return useConstantesOptions(
    fetchFunction,
    formatter,
    defaultOptions
  );
}

/**
 * Hook específico para estados generales (Activo/Inactivo)
 */
export const useEstadoOptions = () => {
  const defaultOptions: OptionFormat[] = [
    { value: 'Activo', label: 'Activo', id: 'activo' },
    { value: 'Inactivo', label: 'Inactivo', id: 'inactivo' }
  ];

  return useConstantesOptions(
    () => constanteService.obtenerTiposEstado(),
    undefined,
    defaultOptions
  );
};

export const useLetraValoresUnitariosOptions = () => {
  return useConstantesOptions(
    () => constanteService.obtenerTiposLetrasValoresUnitarios(),
    (data) => ({
      value: data.nombreCategoria, // Usar la letra como valor
      label: data.nombreCategoria, // Y también como label
      id: data.codConstante
    })
  );
}

/**
 * Hook específico para rutas
 */
export const useRutasOptions = () => {
  const [options, setOptions] = useState<OptionFormat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadOptions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔍 [useRutasOptions] Obteniendo rutas...');
        
        const data = await constanteService.obtenerRutas();
        
        if (!mounted) return;
        
        const formattedOptions = data.map(item => ({
          value: item.codigo,
          label: `${item.abreviatura} - ${item.descripcion}`,
          id: item.codigo,
          abreviatura: item.abreviatura,
          descripcion: item.descripcion
        }));
        
        console.log(`✅ [useRutasOptions] ${formattedOptions.length} rutas cargadas`);
        setOptions(formattedOptions);
        
      } catch (err) {
        if (!mounted) return;
        
        const errorMessage = err instanceof Error ? err.message : 'Error al cargar las rutas';
        console.error('❌ [useRutasOptions] Error:', err);
        setError(errorMessage);
        
        // Fallback options
        const fallbackOptions: OptionFormat[] = [
          { value: 1, label: 'R1 - RUTA 1', id: 1, abreviatura: 'R1', descripcion: 'RUTA 1' }
        ];
        setOptions(fallbackOptions);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadOptions();

    return () => {
      mounted = false;
    };
  }, []);

  return { options, loading, error };
};

/**
 * Hook específico para grupos de uso
 * API GET: http://26.161.18.122:8085/api/constante/listarGrupoUso
 */
export const useGrupoUsoOptions = () => {
  const [options, setOptions] = useState<OptionFormat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadOptions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔍 [useGrupoUsoOptions] Obteniendo grupos de uso...');
        
        const data = await constanteService.listarGrupoUso();
        
        if (!mounted) return;
        
        const formattedOptions = data.map(item => ({
          value: item.codigo,
          label: item.descripcion,
          id: item.codigo
        }));
        
        console.log(`✅ [useGrupoUsoOptions] ${formattedOptions.length} grupos de uso cargados`);
        setOptions(formattedOptions);
        
      } catch (err) {
        if (!mounted) return;
        
        const errorMessage = err instanceof Error ? err.message : 'Error al cargar grupos de uso';
        console.error('❌ [useGrupoUsoOptions] Error:', err);
        setError(errorMessage);
        
        // Fallback options
        const fallbackOptions: OptionFormat[] = [
          { value: 1, label: 'Casa Habitación', id: 1 }
        ];
        setOptions(fallbackOptions);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadOptions();

    return () => {
      mounted = false;
    };
  }, []);

  return { options, loading, error };
};

/**
 * Hook específico para ubicaciones de área verde
 * API GET: http://26.161.18.122:8085/api/constante/listarUbicacionAreaVerd
 */
export const useUbicacionAreaVerdeOptions = () => {
  const [options, setOptions] = useState<OptionFormat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadOptions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔍 [useUbicacionAreaVerdeOptions] Obteniendo ubicaciones de área verde...');
        
        const data = await constanteService.listarUbicacionAreaVerde();
        
        if (!mounted) return;
        
        const formattedOptions = data.map(item => ({
          value: item.codigo,
          label: `${item.abreviatura} - ${item.descripcion}`,
          id: item.codigo,
          abreviatura: item.abreviatura,
          descripcion: item.descripcion
        }));
        
        console.log(`✅ [useUbicacionAreaVerdeOptions] ${formattedOptions.length} ubicaciones cargadas`);
        setOptions(formattedOptions);
        
      } catch (err) {
        if (!mounted) return;
        
        const errorMessage = err instanceof Error ? err.message : 'Error al cargar ubicaciones de área verde';
        console.error('❌ [useUbicacionAreaVerdeOptions] Error:', err);
        setError(errorMessage);
        
        // Fallback options
        const fallbackOptions: OptionFormat[] = [
          { value: 3, label: 'C - Cerca de área verde', id: 3, abreviatura: 'C', descripcion: 'Cerca de área verde' }
        ];
        setOptions(fallbackOptions);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadOptions();

    return () => {
      mounted = false;
    };
  }, []);

  return { options, loading, error };
};

/**
 * Hook específico para usos de predio
 * API GET: http://26.161.18.122:8085/api/constante/listarUsoPredio
 */
export const useUsoPredioOptions = () => {
  const [options, setOptions] = useState<OptionFormat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadOptions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔍 [useUsoPredioOptions] Obteniendo usos de predio...');
        
        const data = await constanteService.listarUsoPredio();
        
        if (!mounted) return;
        
        const formattedOptions = data.map(item => ({
          value: item.codUso,
          label: item.descripcion,
          id: item.codUso,
          codCriterio: item.codCriterio,
          anio: item.anio,
          codGrupoUso: item.codGrupoUso
        }));
        
        console.log(`✅ [useUsoPredioOptions] ${formattedOptions.length} usos de predio cargados`);
        setOptions(formattedOptions);
        
      } catch (err) {
        if (!mounted) return;
        
        const errorMessage = err instanceof Error ? err.message : 'Error al cargar usos de predio';
        console.error('❌ [useUsoPredioOptions] Error:', err);
        setError(errorMessage);
        
        // Fallback options
        const fallbackOptions: OptionFormat[] = [
          { value: 1, label: 'Bodega', id: 1 }
        ];
        setOptions(fallbackOptions);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadOptions();

    return () => {
      mounted = false;
    };
  }, []);

  return { options, loading, error };
};

/**
 * Hook específico para zonas
 */
export const useZonasOptions = () => {
  const [options, setOptions] = useState<OptionFormat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadOptions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔍 [useZonasOptions] Obteniendo zonas...');
        
        const data = await constanteService.obtenerZonas();
        
        if (!mounted) return;
        
        const formattedOptions = data.map(item => ({
          value: item.codigo,
          label: `${item.abreviatura} - ${item.descripcion}`,
          id: item.codigo,
          abreviatura: item.abreviatura,
          descripcion: item.descripcion
        }));
        
        console.log(`✅ [useZonasOptions] ${formattedOptions.length} zonas cargadas`);
        setOptions(formattedOptions);
        
      } catch (err) {
        if (!mounted) return;
        
        const errorMessage = err instanceof Error ? err.message : 'Error al cargar las zonas';
        console.error('❌ [useZonasOptions] Error:', err);
        setError(errorMessage);
        
        // Fallback options
        const fallbackOptions: OptionFormat[] = [
          { value: 1, label: 'ZN01 - Zona 1', id: 1, abreviatura: 'ZN01', descripcion: 'Zona 1' }
        ];
        setOptions(fallbackOptions);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadOptions();

    return () => {
      mounted = false;
    };
  }, []);

  return { options, loading, error };
};
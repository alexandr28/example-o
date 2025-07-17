// src/hooks/useConstantesOptions.ts
import { useState, useEffect } from 'react';
import constanteService, { ConstanteData } from '../services/constanteService';

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
  const defaultOptions: OptionFormat[] = [
    { value: '1801', label: 'Soltero/a', id: '1801' },
    { value: '1802', label: 'Casado/a', id: '1802' },
    { value: '1803', label: 'Divorciado/a', id: '1803' },
    { value: '1804', label: 'Viudo/a', id: '1804' },
    { value: '1805', label: 'Unión Libre', id: '1805' }
  ];

  return useConstantesOptions(
    () => constanteService.obtenerTiposEstadoCivil(),
    undefined, // Usar formatter por defecto
    defaultOptions
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
 */
export const useAnioOptions = (startYear: number = 2020, endYear?: number) => {
  const currentYear = endYear || new Date().getFullYear();
  const defaultOptions: OptionFormat[] = [];
  
  for (let year = currentYear; year >= startYear; year--) {
    defaultOptions.push({
      value: year.toString(),
      label: year.toString(),
      id: year.toString()
    });
  }

  return useConstantesOptions(
    () => constanteService.obtenerTiposAnio(), // Sin la 's' final
    (data) => ({
      value: data.codConstante,
      label: data.nombreCategoria,
      id: data.codConstante,
      description: data.codConstante === currentYear.toString() ? 'Año actual' : undefined
    }),
    defaultOptions
  );
};


// Reexportamos todos los hooks desde este archivo

export { useCalles } from './useCalles';
export { useSectores } from './useSectores';
export { useBarrios } from './useBarrios';
export { useDirecciones } from './useDirecciones';
export { useAranceles } from './useAranceles';
export { useValoresUnitarios } from './useValoresUnitarios';
export { useContribuyentes } from './useContribuyentes';
export { useUIT } from './useUIT';
export { useAlcabala } from './useAlcabala';
export { useDepreciacion } from './useDepreciacion';
export { useAuth } from './useAuth';
export { usePredios } from './usePredioAPI';

// Hooks de conectividad
export { 
  useConnectivity, 
  useApiConnectivity, 
  useConnectivityNotifications 
} from './useConnectivity';
// src/components/predio/pisos/RegistrosPisos.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Controller, UseFormReturn } from 'react-hook-form';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  InputAdornment,
  FormHelperText,
  FormControl,
  Radio,
  RadioGroup,
  FormControlLabel,
  useTheme,
  alpha,
  Alert,
  Tooltip,
  Autocomplete
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import {
  CalendarMonth as CalendarIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Home as HomeIcon,
  LocationOn as LocationIcon,
  Domain as DomainIcon,
  Save as SaveIcon,
  Engineering as EngineeringIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Category as CategoryIcon
} from '@mui/icons-material';
import { usePisos } from '../../../hooks/usePisos';
import SelectorPredios from './SelectorPredios';
import { NotificationService } from '../../utils/Notification';
// import SearchableSelect from '../../ui/SearchableSelect'; // Replaced with Autocomplete
import {
  useCategoriasValoresUnitariosOptions,
  useCategoriasValoresUnitariosHijosOptions,
  useLetraValoresUnitariosOptions,
  useEstadoConservacionOptions,
  useAnioOptions,
  OptionFormat
} from '../../../hooks/useConstantesOptions';
import { constanteService } from '../../../services';
import { valorUnitarioService, ValorUnitarioData } from '../../../services/valorUnitarioService';
import { useValoresUnitarios } from '../../../hooks/useValoresUnitarios';

// Enums
enum Material {
  CONCRETO = 'Concreto',
  LADRILLO = 'Ladrillo',
  ADOBE = 'Adobe'
}

enum EstadoConservacion {
  MUY_BUENO = 'Muy bueno',
  BUENO = 'Bueno',
  REGULAR = 'Regular',
  MALO = 'Malo'
}

enum FormaRegistro {
  INDIVIDUAL = 'INDIVIDUAL',
  MASIVO = 'MASIVO'
}

// Interfaces
interface PisoFormData {
  descripcion: string;
  fechaConstruccion: Date | null;
  antiguedad: string;
  estadoConservacion: string;
  areaConstruida: string;
  materialPredominante: string;
  formaRegistro: string;
  otrasInstalaciones: string;
  anio?: number;
}

interface Predio {
  id: number | string;
  codigoPredio: string;
  direccion?: string;
  tipoPredio?: string;
  contribuyente?: string;
  areaTerreno?: number;
  anio?: number;
  estadoPredio?: string;
  condicionPropiedad?: string;
}

interface CategoriaSeleccionada {
  id: string;
  padre: OptionFormat;
  hijo: OptionFormat;
  letra: OptionFormat;
  fechaCreacion: Date;
  valor: number;
}

const RegistrosPisos: React.FC = () => {
  const theme = useTheme();
  const { crearPiso, guardarPiso, loading } = usePisos();
  
  // Hook para valores unitarios (no necesitamos desestructurar métodos no utilizados)
  
  // Estados - DECLARAR PRIMERO antes de usarlos
  const [predio, setPredio] = useState<Predio | null>(null);
  const [showSelectorPredios, setShowSelectorPredios] = useState(false);
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState<CategoriaSeleccionada[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [valoresUnitarios, setValoresUnitarios] = useState<ValorUnitarioData[]>([]);
  
  // Estados para los selectores - DECLARAR ANTES de los hooks que los usan
  const [categoriaPadre, setCategoriaPadre] = useState<OptionFormat | null>(null);
  const [categoriaHija, setCategoriaHija] = useState<OptionFormat | null>(null);
  const [letraSeleccionada, setLetraSeleccionada] = useState<OptionFormat | null>(null);
  
  // Hooks para opciones - AHORA pueden usar categoriaPadre
  const { options: opcionesPadre, loading: loadingPadre, error: errorPadre } = useCategoriasValoresUnitariosOptions();
  const { options: opcionesHijas, loading: loadingHijas, error: errorHijas } = useCategoriasValoresUnitariosHijosOptions(
    categoriaPadre?.value?.toString() // Ahora sí está definido
  );
  const { options: opcionesLetras, loading: loadingLetras, error: errorLetras } = useLetraValoresUnitariosOptions();
  const { options: opcionesEstadoConservacion, loading: loadingEstado, error: errorEstado } = useEstadoConservacionOptions();
  const { options: opcionesAnios, loading: loadingAnios, error: errorAnios } = useAnioOptions();
  
  // Debug: Log inmediato de las opciones hijas
  useEffect(() => {
    console.log('🎯 [RegistrosPisos] CAMBIO EN OPCIONES HIJAS:');
    console.log('- Padre actual:', categoriaPadre);
    console.log('- Opciones hijas recibidas:', opcionesHijas);
    console.log('- Cantidad de hijas:', opcionesHijas.length);
    if (opcionesHijas.length > 0) {
      console.log('- Primera opción hija:', opcionesHijas[0]);
    }
  }, [opcionesHijas, categoriaPadre]);
  
  // Estado del formulario
  const [formData, setFormData] = useState<PisoFormData>({
    descripcion: '',
    fechaConstruccion: null,
    antiguedad: '30 años',
    estadoConservacion: '',
    areaConstruida: '',
    materialPredominante: '',
    formaRegistro: FormaRegistro.INDIVIDUAL,
    otrasInstalaciones: '0.00',
    anio: new Date().getFullYear()
  });

  // Opciones para selectores
  const materiales = [
    { value: 'Concreto', label: 'Concreto', id: 'concreto' },
    { value: 'Ladrillo', label: 'Ladrillo', id: 'ladrillo' },
    { value: 'Adobe', label: 'Adobe', id: 'adobe' },
    { value: 'Madera', label: 'Madera', id: 'madera' },
    { value: 'Metal', label: 'Metal', id: 'metal' }
  ];
  
  const formasRegistro = [
    { value: FormaRegistro.INDIVIDUAL, label: 'Individual', id: 'individual' },
    { value: FormaRegistro.MASIVO, label: 'Masivo', id: 'masivo' }
  ];
  
  const descripciones = [
    { value: 'Primer piso', label: 'Primer piso', id: 'primer' },
    { value: 'Segundo piso', label: 'Segundo piso', id: 'segundo' },
    { value: 'Tercer piso', label: 'Tercer piso', id: 'tercer' },
    { value: 'Sótano', label: 'Sótano', id: 'sotano' },
    { value: 'Azotea', label: 'Azotea', id: 'azotea' }
  ];

  // Calcular antigüedad cuando cambia la fecha
  useEffect(() => {
    if (formData.fechaConstruccion) {
      const fecha = new Date(formData.fechaConstruccion);
      const hoy = new Date();
      const antiguedad = hoy.getFullYear() - fecha.getFullYear();
      setFormData(prev => ({ ...prev, antiguedad: `${antiguedad} años` }));
    }
  }, [formData.fechaConstruccion]);

  // Cargar valores unitarios cuando cambia el año - usando el servicio directamente
  useEffect(() => {
    const cargarValoresUnitarios = async () => {
      if (formData.anio) {
        try {
          console.log('🔍 [RegistrosPisos] Cargando valores unitarios para año:', formData.anio);
          
          // Usar el servicio directamente para obtener los valores con el formato correcto
          const valores = await valorUnitarioService.consultarValoresUnitarios({ 
            año: formData.anio 
          });
          
          setValoresUnitarios(valores);
          console.log('✅ [RegistrosPisos] Valores unitarios cargados:', valores.length);
          
          // Mostrar algunos valores de ejemplo para debugging
          if (valores.length > 0) {
            console.log('📊 [RegistrosPisos] Ejemplos de valores cargados:', 
              valores.slice(0, 5).map(v => ({
                id: v.id,
                categoria: v.categoria,
                subcategoria: v.subcategoria,
                letra: v.letra,
                costo: v.costo,
                año: v.año
              }))
            );
          }
        } catch (error) {
          console.error('❌ [RegistrosPisos] Error cargando valores unitarios:', error);
          setValoresUnitarios([]);
        }
      }
    };

    cargarValoresUnitarios();
  }, [formData.anio]);

  // Debug: Mostrar datos cargados y formato de opciones
  useEffect(() => {
    console.log('🔍 [RegistrosPisos] Estado de carga de datos:');
    console.log('Padre:', { opciones: opcionesPadre.length, loading: loadingPadre, error: errorPadre });
    console.log('Hijas:', { opciones: opcionesHijas.length, loading: loadingHijas, error: errorHijas });
    console.log('Letras:', { opciones: opcionesLetras.length, loading: loadingLetras, error: errorLetras });
    console.log('Estado Conservación:', { opciones: opcionesEstadoConservacion.length, loading: loadingEstado, error: errorEstado });
    console.log('Valores Unitarios:', { cantidad: valoresUnitarios.length });
    
    // Mostrar formato exacto de las opciones para debugging
    if (opcionesPadre.length > 0) {
      console.log('📋 [RegistrosPisos] Formato Opciones Padre (primeras 2):', 
        opcionesPadre.slice(0, 2).map(op => ({ value: op.value, label: op.label, id: op.id }))
      );
    }
    if (opcionesHijas.length > 0) {
      console.log('📋 [RegistrosPisos] Formato Opciones Hijas (primeras 2):', 
        opcionesHijas.slice(0, 2).map(op => ({ value: op.value, label: op.label, id: op.id }))
      );
    }
    if (opcionesLetras.length > 0) {
      console.log('📋 [RegistrosPisos] Formato Opciones Letras (primeras 3):', 
        opcionesLetras.slice(0, 3).map(op => ({ value: op.value, label: op.label, id: op.id }))
      );
    }
    if (valoresUnitarios.length > 0) {
      console.log('📋 [RegistrosPisos] Formato Valores Unitarios (primeros 3):', 
        valoresUnitarios.slice(0, 3).map(v => ({
          categoria: v.categoria,
          subcategoria: v.subcategoria, 
          letra: v.letra,
          costo: v.costo
        }))
      );
    }
  }, [opcionesPadre, opcionesHijas, opcionesLetras, opcionesEstadoConservacion, valoresUnitarios, loadingPadre, loadingHijas, loadingLetras, loadingEstado, errorPadre, errorHijas, errorLetras, errorEstado]);

  // Limpiar selecciones dependientes cuando cambia el padre
  useEffect(() => {
    console.log('🔍 [RegistrosPisos] categoriaPadre cambió:', categoriaPadre);
    
    // Limpiar hijo y letra cuando cambia el padre
    if (categoriaPadre !== null) {
      console.log(`🔄 [RegistrosPisos] Padre cambió a: ${categoriaPadre?.value} (${categoriaPadre?.label}), limpiando selecciones dependientes`);
      setCategoriaHija(null);
      setLetraSeleccionada(null);
    }
  }, [categoriaPadre]);

  // Limpiar letra cuando cambia el hijo
  useEffect(() => {
    if (categoriaHija !== null) {
      console.log(`🔄 [RegistrosPisos] Hijo cambió a: ${categoriaHija?.value} (${categoriaHija?.label}), limpiando letra`);
      setLetraSeleccionada(null);
    }
  }, [categoriaHija]);

  // Función para buscar valor unitario por categoria, subcategoria y letra
  const buscarValorUnitario = (categoria: OptionFormat, subcategoria: OptionFormat, letra: OptionFormat): number => {
    console.log('🔍 [RegistrosPisos] Buscando valor unitario para:', {
      categoriaValue: categoria.value,
      categoriaLabel: categoria.label,
      subcategoriaValue: subcategoria.value,
      subcategoriaLabel: subcategoria.label,
      letraValue: letra.value,
      letraLabel: letra.label,
      año: formData.anio
    });

    if (valoresUnitarios.length === 0) {
      console.log('⚠️ [RegistrosPisos] No hay valores unitarios cargados');
      return 0;
    }

    // Mostrar algunos valores unitarios para debugging
    if (valoresUnitarios.length > 0) {
      console.log('📊 [RegistrosPisos] Primeros 3 valores unitarios disponibles:', 
        valoresUnitarios.slice(0, 3).map(v => ({
          categoria: v.categoria,
          subcategoria: v.subcategoria,
          letra: v.letra,
          costo: v.costo,
          año: v.año
        }))
      );
    }

    // ===== MAPEO CORRECTO BASADO EN EL JSON REAL DEL API =====
    
    // El API devuelve TEXTO para categorías y subcategorías, NO códigos numéricos
    // Ejemplo del API: codCategoria: "ESTRUCTURAS", codSubcategoria: "MUROS Y COLUMNAS", codLetra: "A"
    
    // 1. Categoría: mapear códigos del hook a texto del API
    const categoriaToTextMap: Record<string, string> = {
      '1001': 'ESTRUCTURAS',
      '1002': 'ACABADOS', 
      '1003': 'INSTALACIONES ELECTRICAS Y SANITARIAS'
    };
    
    // 2. Subcategoría: mapear códigos del hook a texto del API
    const subcategoriaToTextMap: Record<string, string> = {
      '100101': 'MUROS Y COLUMNAS',
      '100102': 'TECHOS',
      '100201': 'PISOS',
      '100202': 'PUERTAS Y VENTANAS',
      '100203': 'REVESTIMIENTOS', 
      '100204': 'BAÑOS',
      '100301': 'INSTALACIONES ELECTRICAS Y SANITARIAS'
    };
    
    // 3. Letra: usar directamente (viene como 'A', 'B', 'C' en ambos lados)
    const categoriaTexto = categoriaToTextMap[String(categoria.value)] || String(categoria.value);
    const subcategoriaTexto = subcategoriaToTextMap[String(subcategoria.value)] || String(subcategoria.value);
    const letraTexto = String(letra.value); // Directo: 'A', 'B', 'C'

    console.log('🔄 [RegistrosPisos] Mapeo para búsqueda (basado en API real):', {
      categoriaOriginal: categoria.value,
      categoriaTextoAPI: categoriaTexto,
      subcategoriaOriginal: subcategoria.value, 
      subcategoriaTextoAPI: subcategoriaTexto,
      letraOriginal: letra.value,
      letraTextoAPI: letraTexto,
      año: formData.anio
    });

    // ===== BÚSQUEDA EXACTA CON TEXTOS DEL API =====
    const valorEncontrado = valoresUnitarios.find(valor => {
      const categoriaMatch = String(valor.categoria) === categoriaTexto;
      const subcategoriaMatch = String(valor.subcategoria) === subcategoriaTexto;
      const letraMatch = String(valor.letra) === letraTexto;
      const añoMatch = valor.año === formData.anio;

      const esMatch = categoriaMatch && subcategoriaMatch && letraMatch && añoMatch;
      
      // Log detallado solo para los primeros 5 valores para debugging
      if (valoresUnitarios.indexOf(valor) < 5) {
        console.log(`🔎 [RegistrosPisos] Comparando valor ${valoresUnitarios.indexOf(valor) + 1}:`, {
          valorAPI: { 
            cat: valor.categoria, 
            sub: valor.subcategoria, 
            letra: valor.letra, 
            año: valor.año,
            costo: valor.costo 
          },
          buscando: { 
            cat: categoriaTexto, 
            sub: subcategoriaTexto, 
            letra: letraTexto, 
            año: formData.anio 
          },
          matches: { 
            cat: categoriaMatch, 
            sub: subcategoriaMatch, 
            letra: letraMatch, 
            año: añoMatch,
            final: esMatch
          }
        });
      }

      return esMatch;
    });

    if (valorEncontrado) {
      console.log('✅ [RegistrosPisos] ¡VALOR ENCONTRADO!', {
        costo: valorEncontrado.costo,
        categoria: valorEncontrado.categoria,
        subcategoria: valorEncontrado.subcategoria,
        letra: valorEncontrado.letra,
        año: valorEncontrado.año
      });
      return valorEncontrado.costo;
    } else {
      console.log('❌ [RegistrosPisos] NO SE ENCONTRÓ VALOR para:', {
        categoriaTexto,
        subcategoriaTexto,
        letraTexto,
        año: formData.anio
      });
      
      // Debug: mostrar valores que tienen categoría y subcategoría correctas
      const valoresConCatSub = valoresUnitarios.filter(v => 
        String(v.categoria) === categoriaTexto && 
        String(v.subcategoria) === subcategoriaTexto &&
        v.año === formData.anio
      );
      
      if (valoresConCatSub.length > 0) {
        console.log('🔍 [RegistrosPisos] Valores con categoría/subcategoría correctas:', 
          valoresConCatSub.map(v => ({ letra: v.letra, costo: v.costo }))
        );
      } else {
        console.log('🔍 [RegistrosPisos] No hay valores con esa categoría/subcategoría/año');
        
        // Mostrar todas las combinaciones disponibles para ayudar con el debugging
        const combinacionesDisponibles = valoresUnitarios
          .filter(v => v.año === formData.anio)
          .slice(0, 10) // Solo las primeras 10 para no saturar
          .map(v => `"${v.categoria}" + "${v.subcategoria}" + "${v.letra}"`);
        
        console.log('🔍 [RegistrosPisos] Combinaciones disponibles (año correcto):', combinacionesDisponibles);
      }
      
      return 0;
    }
  };

  // Calcular suma total de valores unitarios
  const calcularSumaValores = useCallback((): number => {
    const suma = categoriasSeleccionadas.reduce((total, categoria) => total + categoria.valor, 0);
    console.log('🔢 [RegistrosPisos] Suma total de valores:', suma);
    return suma;
  }, [categoriasSeleccionadas]);

  // Actualizar el campo "Otras instalaciones" con la suma
  useEffect(() => {
    const sumaTotal = calcularSumaValores();
    setFormData(prev => ({ ...prev, otrasInstalaciones: sumaTotal.toFixed(2) }));
  }, [categoriasSeleccionadas, calcularSumaValores]);

  // Manejar cambios en el formulario
  const handleInputChange = (field: keyof PisoFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Agregar nueva categoría seleccionada
  const agregarCategoria = () => {
    if (!categoriaPadre || !categoriaHija || !letraSeleccionada) {
      NotificationService.warning('Debe seleccionar padre, hijo y letra');
      return;
    }
    
    // Logging detallado de las selecciones
    console.log('🎯 [RegistrosPisos] AGREGANDO CATEGORÍA CON:');
    console.log('  - Padre:', { value: categoriaPadre.value, label: categoriaPadre.label, id: categoriaPadre.id });
    console.log('  - Hijo:', { value: categoriaHija.value, label: categoriaHija.label, id: categoriaHija.id });
    console.log('  - Letra:', { value: letraSeleccionada.value, label: letraSeleccionada.label, id: letraSeleccionada.id });
    console.log('  - Año:', formData.anio);
    console.log('  - Valores unitarios disponibles:', valoresUnitarios.length);
    
    // Validar duplicidad: no permitir misma letra con mismo hijo
    const existeDuplicado = categoriasSeleccionadas.some(cat => 
      cat.hijo.value === categoriaHija.value && cat.letra.value === letraSeleccionada.value
    );
    
    if (existeDuplicado) {
      NotificationService.error(`Ya existe la letra ${letraSeleccionada.label} para ${categoriaHija.label}`);
      return;
    }
    
    // Buscar el valor unitario correspondiente
    const valorUnitario = buscarValorUnitario(categoriaPadre, categoriaHija, letraSeleccionada);
    
    if (valorUnitario === 0) {
      console.log('⚠️ [RegistrosPisos] No se encontró valor, mostrando algunos valores disponibles como referencia:');
      const muestraValores = valoresUnitarios.slice(0, 10).map(v => ({
        cat: v.categoria,
        sub: v.subcategoria,
        letra: v.letra,
        costo: v.costo
      }));
      console.table(muestraValores);
      
      NotificationService.warning(`No se encontró valor unitario para ${categoriaPadre.label}/${categoriaHija.label}/${letraSeleccionada.label} en el año ${formData.anio}`);
    }
    
    const nuevaCategoria: CategoriaSeleccionada = {
      id: `${Date.now()}-${Math.random()}`,
      padre: categoriaPadre,
      hijo: categoriaHija,
      letra: letraSeleccionada,
      fechaCreacion: new Date(),
      valor: valorUnitario
    };
    
    setCategoriasSeleccionadas(prev => [...prev, nuevaCategoria]);
    
    // Limpiar selecciones
    setCategoriaHija(null);
    setLetraSeleccionada(null);
    
    NotificationService.success(`Categoría agregada correctamente. Valor: S/ ${valorUnitario.toFixed(2)}`);
  };
  
  // Eliminar categoría seleccionada
  const eliminarCategoria = (id: string) => {
    setCategoriasSeleccionadas(prev => prev.filter(cat => cat.id !== id));
    NotificationService.info('Categoría eliminada');
  };
  
  // Limpiar todas las categorías
  const limpiarCategorias = () => {
    setCategoriasSeleccionadas([]);
    setCategoriaPadre(null);
    setCategoriaHija(null);
    setLetraSeleccionada(null);
  };

  // Validar formulario
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!predio) newErrors.predio = 'Debe seleccionar un predio';
    if (!formData.descripcion) newErrors.descripcion = 'La descripción es requerida';
    if (!formData.fechaConstruccion) newErrors.fechaConstruccion = 'La fecha es requerida';
    if (!formData.estadoConservacion) newErrors.estadoConservacion = 'Seleccione el estado';
    if (!formData.areaConstruida || parseFloat(formData.areaConstruida) <= 0) {
      newErrors.areaConstruida = 'El área debe ser mayor a 0';
    }
    if (!formData.materialPredominante) newErrors.materialPredominante = 'Seleccione el material';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Determinar el número de piso basado en la descripción
  const determinarNumeroPiso = (descripcion: string): number => {
    const descripciones: Record<string, number> = {
      'Primer piso': 1,
      'Segundo piso': 2,
      'Tercer piso': 3,
      'Sótano': -1,
      'Azotea': 99
    };
    return descripciones[descripcion] || 1;
  };

  // Guardar piso usando la nueva API POST
  const handleSubmit = async () => {
    if (!validateForm()) {
      NotificationService.error('Por favor complete todos los campos requeridos');
      return;
    }

    if (!predio) {
      NotificationService.error('Debe seleccionar un predio');
      return;
    }

    if (categoriasSeleccionadas.length === 0) {
      NotificationService.error('Debe seleccionar al menos una categoría');
      return;
    }

    try {
      console.log('🏗️ [RegistrosPisos] Iniciando creación de piso con API POST');
      
      // Preparar datos para el API POST según la estructura exacta
      const datosParaCrear = {
        // Datos básicos requeridos
        anio: formData.anio || new Date().getFullYear(),
        codPredio: String(predio.codigoPredio),
        numeroPiso: determinarNumeroPiso(formData.descripcion),
        areaConstruida: parseFloat(formData.areaConstruida),
        
        // Fecha de construcción
        fechaConstruccion: formData.fechaConstruccion 
          ? formData.fechaConstruccion.toISOString().split('T')[0]
          : '1990-01-01',
        
        // Datos de categorías seleccionadas (usar la primera como representativa)
        ...(categoriasSeleccionadas.length > 0 && {
          codLetraMurosColumnas: String(categoriasSeleccionadas[0]?.letra.value || '1101'),
          murosColumnas: String(categoriasSeleccionadas[0]?.padre.value || '100101'),
          codLetraTechos: String(categoriasSeleccionadas[0]?.letra.value || '1101'),
          techos: String(categoriasSeleccionadas[0]?.hijo.value || '100102'),
          codLetraPisos: String(categoriasSeleccionadas[0]?.letra.value || '1101'),
          pisos: String(categoriasSeleccionadas[0]?.hijo.value || '100201'),
          codLetraPuertasVentanas: String(categoriasSeleccionadas[0]?.letra.value || '1101'),
          puertasVentanas: String(categoriasSeleccionadas[0]?.hijo.value || '100202'),
          codLetraRevestimiento: String(categoriasSeleccionadas[0]?.letra.value || '1101'),
          revestimiento: String(categoriasSeleccionadas[0]?.hijo.value || '100203'),
          codLetraBanios: String(categoriasSeleccionadas[0]?.letra.value || '1101'),
          banios: String(categoriasSeleccionadas[0]?.hijo.value || '100204'),
          codLetraInstalacionesElectricas: String(categoriasSeleccionadas[0]?.letra.value || '1101'),
          instalacionesElectricas: '100301'
        }),
        
        // Estado de conservación del formulario
        codEstadoConservacion: String(formData.estadoConservacion || '9402'),
        codMaterialEstructural: (() => {
          const materialMap: Record<string, string> = {
            'Concreto': '0703',
            'Ladrillo': '0702',
            'Adobe': '0701',
            'Madera': '0704',
            'Metal': '0705'
          };
          return materialMap[formData.materialPredominante] || '0703';
        })()
      };
      
      console.log('📤 [RegistrosPisos] Datos preparados para crear piso:', datosParaCrear);
      
      // Llamar al hook actualizado para crear el piso
      const pisoCreado = await crearPiso(datosParaCrear);
      
      if (pisoCreado) {
        console.log('✅ [RegistrosPisos] Piso creado exitosamente:', pisoCreado);
        
        // Limpiar formulario después del éxito
        setFormData({
          descripcion: '',
          fechaConstruccion: null,
          antiguedad: '30 años',
          estadoConservacion: '',
          areaConstruida: '',
          materialPredominante: '',
          formaRegistro: FormaRegistro.INDIVIDUAL,
          otrasInstalaciones: '0.00',
          anio: new Date().getFullYear()
        });
        limpiarCategorias();
        
        NotificationService.success(`Piso ${pisoCreado.numeroPiso} creado exitosamente`);
      } else {
        throw new Error('No se pudo crear el piso');
      }
      
    } catch (error: any) {
      console.error('❌ [RegistrosPisos] Error al crear piso:', error);
      NotificationService.error(error.message || 'Error al crear el piso');
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Box sx={{ p: 3 }}>

        {/* Sección: Seleccionar predio */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={1} mb={3}>
              <DomainIcon color="primary" />
              <Typography variant="h6" fontWeight={600}>
                Seleccionar predio
              </Typography>
            </Stack>
            
            <Stack spacing={2}>
              {/* Primera fila */}
              
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                <Box sx={{ flex: '0 0 150px' }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => setShowSelectorPredios(true)}
                      startIcon={<SearchIcon />}
                      sx={{ height: '35px', minHeight:'35px' }}
                    >
                      Seleccionar predio
                    </Button>
                    {errors.predio && (
                      <FormHelperText error>{errors.predio}</FormHelperText>
                    )}
                  </Box>
                </Box>
                
                <Box sx={{ flex: '0 0 100px' }}>
                  <TextField
                    fullWidth
                    label="Código de predio"
                    value={predio?.codigoPredio || ''}
                    InputProps={{
                      readOnly: true,
                      startAdornment: (
                        <InputAdornment position="start">
                          <HomeIcon />
                        </InputAdornment>
                      )
                    }}
                  />
                </Box>
                  {predio &&( 
                   <Box sx={{ flex: '0 0 150px' }}>
                   <TextField
                     fullWidth
                     label="Tipo de predio"
                     value={predio.tipoPredio || 'Sin especificar'}
                     InputProps={{ readOnly: true }}
                     variant="outlined"
                   />
                 </Box>
                )} 
                {predio &&( 
                  <Box sx={{ flex: '0 0 100px' }}>
                  <TextField
                    fullWidth
                    label="Área terreno"
                    value={predio.areaTerreno ? `${predio.areaTerreno.toFixed(2)} m²` : 'No disponible'}
                    InputProps={{ readOnly: true }}
                    variant="outlined"
                  />
                </Box>
                 )}
                 {predio &&( 
                  <Box sx={{ flex: '0 0 60px' }}>
                    <TextField
                      fullWidth
                      label="Año"
                      value={predio.anio || 'No disponible'}
                      InputProps={{ readOnly: true }}
                      variant="outlined"
                    />
                  </Box>
                  )}
                  {predio &&( 
                  <Box sx={{ flex: '0 0 100px' }}>
                  <TextField
                    fullWidth
                    label="Contribuyente"
                    value={predio.contribuyente || 'Sin asignar'}
                    InputProps={{ readOnly: true }}
                    variant="outlined"
                  />
                </Box>
                 )}
              </Box>
           
              {/* Segunda fila de información del predio */}
              {predio && (
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                 <Box sx={{ flex: '0 0 700px' }}>
                  <TextField
                    fullWidth
                    label="Dirección"
                    value={predio?.direccion || ''}
                    InputProps={{
                      readOnly: true,
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationIcon />
                        </InputAdornment>
                      )
                    }}
                  />
                </Box>
     
                </Box>
              )}
            </Stack>
          </CardContent>
        </Card>

        {/* Sección: Datos del piso */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={1} mb={3}>
              <EngineeringIcon color="primary" />
              <Typography variant="h6" fontWeight={600}>
                Datos del piso
              </Typography>
            </Stack>
            
            <Stack spacing={3}>
              {/* Primera fila */}
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                <Box sx={{ flex: '0 0 80px' }}>
                  <Autocomplete
                    options={opcionesAnios}
                    getOptionLabel={(option) => option?.label || ''}
                    value={opcionesAnios.find(opt => opt.value === formData.anio) || null}
                    onChange={(_, newValue) => handleInputChange('anio', parseInt(newValue?.value?.toString() || '') || new Date().getFullYear())}
                    disabled={loadingAnios}
                    size="small"
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Año"
                        placeholder="Año"
                        error={!!errorAnios}
                        helperText={errorAnios}
                        sx={{ 
                          '& .MuiInputBase-root': { 
                            height: '33px' 
                          }
                        }}
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {loadingAnios ? <div>Loading...</div> : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                  />
                </Box>

                <Box sx={{ flex: '0 0 120px' }}>
                  <Autocomplete
                    options={descripciones}
                    getOptionLabel={(option) => option?.label || ''}
                    value={descripciones.find(opt => opt.value === formData.descripcion) || null}
                    onChange={(_, newValue) => handleInputChange('descripcion', newValue?.value || '')}
                    size="small"
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Pisos"
                        placeholder="Seleccione"
                        required
                        error={!!errors.descripcion}
                        helperText={errors.descripcion}
                        sx={{ 
                          '& .MuiInputBase-root': { 
                            height: '33px' 
                          }
                        }}
                      />
                    )}
                  />
                </Box>

                <Box sx={{ flex: '0 0 120px', maxWidth:'145px' }}>
                  <DatePicker
                    label="Fecha construcción"
                    value={formData.fechaConstruccion}
                    onChange={(date) => handleInputChange('fechaConstruccion', date)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: 'small',
                        error: !!errors.fechaConstruccion,
                        helperText: errors.fechaConstruccion,
                        sx: { 
                          '& .MuiInputBase-root': { 
                            height: '33px' 
                          }
                        }
                      }
                    }}
                  />
                </Box>

                <Box sx={{ flex: '0 0 100px' }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Antigüedad"
                    value={formData.antiguedad}
                    InputProps={{ readOnly: true }}
                    sx={{ 
                      '& .MuiInputBase-root': { 
                        height: '33px' 
                      }
                    }}
                  />
                </Box>

                <Box sx={{ flex: '0 0 130px' }}>
                  <Autocomplete
                    options={opcionesEstadoConservacion}
                    getOptionLabel={(option) => option?.label || ''}
                    value={opcionesEstadoConservacion.find(opt => opt.value === formData.estadoConservacion) || null}
                    onChange={(_, newValue) => handleInputChange('estadoConservacion', newValue?.value || '')}
                    disabled={loadingEstado}
                    size="small"
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Estado Conservación"
                        placeholder="Seleccione Estado"
                        required
                        error={!!errors.estadoConservacion}
                        helperText={errors.estadoConservacion}
                        sx={{ 
                          '& .MuiInputBase-root': { 
                            height: '33px' 
                          }
                        }}
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {loadingEstado ? <div>Loading...</div> : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                  />
                </Box>

                <Box sx={{ flex: '0 0 125px' }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Área construida"
                    value={formData.areaConstruida}
                    onChange={(e) => handleInputChange('areaConstruida', e.target.value)}
                    error={!!errors.areaConstruida}
                    helperText={errors.areaConstruida}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">m²</InputAdornment>
                    }}
                    type="number"
                    sx={{ 
                      '& .MuiInputBase-root': { 
                        height: '33px' 
                      }
                    }}
                  />
                </Box>

                <Box sx={{ flex: '0 0 140px' }}>
                  <Autocomplete
                    options={materiales}
                    getOptionLabel={(option) => option?.label || ''}
                    value={materiales.find(opt => opt.value === formData.materialPredominante) || null}
                    onChange={(_, newValue) => handleInputChange('materialPredominante', newValue?.value || '')}
                    size="small"
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Material predominante"
                        placeholder="Seleccione"
                        required
                        error={!!errors.materialPredominante}
                        helperText={errors.materialPredominante}
                        sx={{ 
                          '& .MuiInputBase-root': { 
                            height: '33px' 
                          }
                        }}
                      />
                    )}
                  />
                </Box>

                <Box sx={{ flex: '0 0 100px' }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Otras instalaciones"
                    value={formData.otrasInstalaciones}
                    InputProps={{
                      readOnly: true,
                      startAdornment: <InputAdornment position="start">S/</InputAdornment>
                    }}
                    sx={{ 
                      '& .MuiInputBase-root': { 
                        height: '33px',
                        bgcolor: alpha(theme.palette.grey[100], 0.5)
                      }
                    }}
                    helperText=""
                  />
                </Box>

              </Box>

              {/* Segunda fila */}
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-start' }}>
              </Box>
            </Stack>

            {/* Sección de categorías de valores unitarios */}
            <Box sx={{ mt: 4 }}>
              <Stack direction="row" alignItems="center" spacing={1} mb={3}>
                <CategoryIcon color="primary" />
                <Typography variant="subtitle1" fontWeight={600}>
                  Categorías de Valores Unitarios
                </Typography>
              </Stack>
              
              {/* Alertas de errores */}
              {(errorPadre || errorHijas || errorLetras || errorEstado) && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    Errores al cargar datos:
                    {errorPadre && <div>• Categorías Padre: {errorPadre}</div>}
                    {errorHijas && <div>• Categorías Hijas: {errorHijas}</div>}
                    {errorLetras && <div>• Letras: {errorLetras}</div>}
                    {errorEstado && <div>• Estado Conservación: {errorEstado}</div>}
                  </Typography>
                </Alert>
              )}
              
              {/* Estado de carga */}
              {(loadingPadre || loadingHijas || loadingLetras) && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  Cargando datos del servidor...
                  {loadingPadre && ' Categorías Padre'}
                  {loadingHijas && ' Categorías Hijas'}
                  {loadingLetras && ' Letras'}
                </Alert>
              )}


              {/* Selectores de categorías */}
              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 2, alignItems: 'flex-start' }}>
                <Box sx={{ flex: '0 0 140px' }}>
                  <Autocomplete
                    options={opcionesPadre}
                    getOptionLabel={(option) => option?.label || ''}
                    value={categoriaPadre}
                    onChange={(_, newValue) => {
                      console.log('📝 [Autocomplete Padre] onChange recibido:', newValue);
                      setCategoriaPadre(newValue);
                    }}
                    disabled={loadingPadre}
                    size="small"
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Categoría Padre"
                        placeholder="Seleccione..."
                        required
                        error={!!errorPadre}
                        helperText={errorPadre || `${opcionesPadre.length} opciones`}
                        sx={{
                          '& .MuiInputBase-root': {
                            height: '32px',
                            fontSize: '0.813rem'
                          },
                          '& .MuiFormLabel-root': {
                            fontSize: '0.813rem'
                          },
                          '& .MuiFormHelperText-root': {
                            fontSize: '0.688rem',
                            marginTop: '2px'
                          }
                        }}
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {loadingPadre ? <div>Loading...</div> : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                  />
                </Box>
                
                <Box sx={{ flex: '0 0 160px' }}>
                  <Autocomplete
                    options={opcionesHijas}
                    getOptionLabel={(option) => option?.label || ''}
                    value={categoriaHija}
                    onChange={(_, newValue) => {
                      console.log('📝 [Autocomplete Hijo] onChange recibido:', newValue);
                      setCategoriaHija(newValue);
                    }}
                    disabled={!categoriaPadre || loadingHijas}
                    size="small"
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Categoría Hija"
                        placeholder={categoriaPadre ? "Seleccione..." : "Primero padre"}
                        required
                        error={!!errorHijas}
                        helperText={
                          errorHijas || 
                          (!categoriaPadre ? 'Seleccione padre' : 
                            `${opcionesHijas.length} opciones`
                          )
                        }
                        sx={{
                          '& .MuiInputBase-root': {
                            height: '32px',
                            fontSize: '0.813rem'
                          },
                          '& .MuiFormLabel-root': {
                            fontSize: '0.813rem'
                          },
                          '& .MuiFormHelperText-root': {
                            fontSize: '0.688rem',
                            marginTop: '2px'
                          }
                        }}
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {loadingHijas ? <div>Loading...</div> : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                  />
                </Box>
                
                <Box sx={{ flex: '0 0 70px' }}>
                  <Autocomplete
                    options={opcionesLetras}
                    getOptionLabel={(option) => option?.label || ''}
                    value={letraSeleccionada}
                    onChange={(_, newValue) => {
                      console.log('📝 [Autocomplete Letra] onChange recibido:', newValue);
                      setLetraSeleccionada(newValue);
                    }}
                    disabled={!categoriaHija || loadingLetras}
                    size="small"
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Letra"
                        placeholder="A-Z"
                        required
                        error={!!errorLetras}
                        helperText={
                          errorLetras || 
                          (!categoriaHija ? 'Sel. hijo' : 
                            `${opcionesLetras.length} letras`
                          )
                        }
                        sx={{
                          '& .MuiInputBase-root': {
                            height: '32px',
                            fontSize: '0.813rem'
                          },
                          '& .MuiFormLabel-root': {
                            fontSize: '0.813rem'
                          },
                          '& .MuiFormHelperText-root': {
                            fontSize: '0.688rem',
                            marginTop: '2px'
                          }
                        }}
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {loadingLetras ? <div>Loading...</div> : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                  />
                </Box>
                
                <Box sx={{ 
                  flex: '0 0 auto', 
                  display: 'flex', 
                  alignItems: 'center',
                  marginTop: '0px'
                }}>
                  <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                    <Button
                      variant="contained"
                      onClick={agregarCategoria}
                      startIcon={<AddIcon sx={{ fontSize: '0.875rem' }} />}
                      disabled={!categoriaPadre || !categoriaHija || !letraSeleccionada}
                      sx={{ 
                        height: '33px', 
                        minHeight: '32px',
                        maxHeight: '40px',
                        fontSize: '0.75rem',
                        px: 1.5,
                        lineHeight: 1,
                        '& .MuiButton-startIcon': {
                          marginRight: '4px'
                        }
                      }}
                      size="small"
                    >
                      Agregar
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={limpiarCategorias}
                      color="warning"
                      sx={{ 
                        height: '33px', 
                        minHeight: '32px',
                        maxHeight: '33px',
                        fontSize: '0.75rem',
                        px: 1.5,
                        lineHeight: 1
                      }}
                      size="small"
                    >
                      Limpiar
                    </Button>
                  </Stack>
                </Box>
              </Box>
              
              {/* Lista de categorías seleccionadas */}
              {categoriasSeleccionadas.length > 0 && (
                <>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Categorías seleccionadas ({categoriasSeleccionadas.length})
                  </Typography>
                  
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: 'grey.50' }}>
                          <TableCell sx={{ fontWeight: 600 }}>#</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>CATEGORIA</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>SUBCATEGORIA</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>LETRA</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 600 }}>VALOR (S/)</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 600 }}>ACCIONES</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {categoriasSeleccionadas.map((categoria, index) => (
                          <TableRow key={categoria.id} hover>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>
                              <Chip
                                label={categoria.padre.label}
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={categoria.hijo.label}
                                size="small"
                                color="secondary"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={categoria.letra.label}
                                size="small"
                                color="success"
                                sx={{ fontWeight: 'bold' }}
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                label={categoria.valor.toFixed(2)}
                                size="small"
                                color={categoria.valor > 0 ? "success" : "warning"}
                                variant="filled"
                                sx={{ 
                                  fontWeight: 'bold',
                                  minWidth: '60px'
                                }}
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Stack direction="row" spacing={1} justifyContent="center">
                                <Tooltip title="Ver detalles">
                                  <IconButton size="small" color="info">
                                    <VisibilityIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Eliminar">
                                  <IconButton 
                                    size="small" 
                                    color="error"
                                    onClick={() => eliminarCategoria(categoria.id)}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Stack>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  
                  {/* Información de resumen */}
                  <Alert severity="info" sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2">
                        No se permite duplicar letras para la misma categoría hijo. 
                        Total de combinaciones: {categoriasSeleccionadas.length}
                        {predio && (
                          <span style={{ marginLeft: 8, fontWeight: 'bold' }}>
                            | Predio: {predio.codigoPredio}
                          </span>
                        )}
                      </Typography>
                      <Chip
                        label={`Suma total: S/ ${calcularSumaValores().toFixed(2)}`}
                        color="primary"
                        variant="filled"
                        sx={{ fontWeight: 'bold' }}
                      />
                    </Box>
                  </Alert>
                </>
              )}
              
              {categoriasSeleccionadas.length === 0 && (
                <Alert severity="warning">
                  No hay categorías seleccionadas. Agregue al menos una combinación.
                </Alert>
              )}
            </Box>

            {/* Botón guardar */}
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant="outlined"
                size="large"
                onClick={() => {
                  setFormData({
                    descripcion: '',
                    fechaConstruccion: null,
                    antiguedad: '30 años',
                    estadoConservacion: '',
                    areaConstruida: '',
                    materialPredominante: '',
                    formaRegistro: FormaRegistro.INDIVIDUAL,
                    otrasInstalaciones: '0.00',
                    anio: new Date().getFullYear()
                  });
                  limpiarCategorias();
                  setPredio(null);
                }}
                disabled={loading}
              >
                Limpiar Formulario
              </Button>
              <Button
                variant="contained"
                size="large"
                startIcon={<SaveIcon />}
                onClick={handleSubmit}
                disabled={loading || !predio || categoriasSeleccionadas.length === 0}
              >
                {loading ? 'Creando Piso...' : 'Crear Piso'}
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Modal de selección de predios */}
        <SelectorPredios
          open={showSelectorPredios}
          onClose={() => setShowSelectorPredios(false)}
          onSelect={(predioSeleccionado) => {
            setPredio(predioSeleccionado);
            setShowSelectorPredios(false);
          }}
        />
      </Box>
    </LocalizationProvider>
  );
};

export default RegistrosPisos;
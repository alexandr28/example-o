// src/components/caja/modal/DeudaContribuyente.tsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  Divider,
  Paper,
  Tabs,
  Tab,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Radio,
  RadioGroup,
  FormControl,
  FormControlLabel,
  Alert,
  Checkbox
} from '@mui/material';
import {
  Close as CloseIcon,
  Receipt as ReceiptIcon,
  Public as PublicIcon,
  AccountBalance as AccountBalanceIcon,
  Payment as PaymentIcon,
  Gavel as GavelIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Styled Components
const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: theme.spacing(2),
    minWidth: '800px',
    maxWidth: '1000px',
    height: '600px',
    overflowX: 'hidden',
  },
}));

const HeaderBox = styled(Box)(({ theme }) => ({
  background: theme.palette.primary.main,
  color: 'white',
  padding: theme.spacing(2),
  margin: theme.spacing(-3, -3, 2, -3),
  borderRadius: `${theme.spacing(2)} ${theme.spacing(2)} 0 0`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}));

const ContentBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  overflowX: 'hidden',
}));

// Interfaces
export interface ContribuyenteData {
  codigoPredio: string;
  dniRuc: string;
  contribuyente: string;
  direccionPredio: string;
}

export interface DeudaGlobalItem {
  id: string;
  año: number;
  titulo: string;
  mes1: number;
  mes2: number;
  mes3: number;
  mes4: number;
  mes5: number;
  mes6: number;
  mes7: number;
  mes8: number;
  mes9: number;
  mes10: number;
  mes11: number;
  mes12: number;
  deuda: number;
}

// Interface para datos de pago procesado
interface ConceptoPago {
  id: string;
  descripcion: string;
  añosAfectados: number[];
  mesesAfectados: number[];
  total: number;
  detalleMeses: { [mes: number]: number };
}

interface DatosPagoDeudaOrdinaria {
  montoTotal: number;
  conceptos: ConceptoPago[];
  contribuyente: ContribuyenteData;
}

interface DeudaContribuyenteProps {
  open: boolean;
  onClose: () => void;
  contribuyenteData?: ContribuyenteData | null;
  loading?: boolean;
  onPagoGenerado?: (datos: DatosPagoDeudaOrdinaria) => void;
}

// Datos de ejemplo para Deuda Global
const deudaGlobalData: DeudaGlobalItem[] = [
  {
    id: '1',
    año: 2023,
    titulo: 'Impuesto Predial',
    mes1: 150.50, mes2: 150.50, mes3: 150.50, mes4: 150.50, mes5: 150.50, mes6: 150.50,
    mes7: 150.50, mes8: 150.50, mes9: 150.50, mes10: 150.50, mes11: 150.50, mes12: 150.50,
    deuda: 1806.00
  },
  {
    id: '2',
    año: 2023,
    titulo: 'Serenazgo',
    mes1: 25.00, mes2: 25.00, mes3: 25.00, mes4: 25.00, mes5: 25.00, mes6: 25.00,
    mes7: 25.00, mes8: 25.00, mes9: 25.00, mes10: 25.00, mes11: 25.00, mes12: 25.00,
    deuda: 300.00
  },
  {
    id: '3',
    año: 2023,
    titulo: 'Parques y Jardines',
    mes1: 15.75, mes2: 15.75, mes3: 15.75, mes4: 15.75, mes5: 15.75, mes6: 15.75,
    mes7: 15.75, mes8: 15.75, mes9: 15.75, mes10: 15.75, mes11: 15.75, mes12: 15.75,
    deuda: 189.00
  },
  {
    id: '4',
    año: 2024,
    titulo: 'Impuesto Predial',
    mes1: 175.25, mes2: 175.25, mes3: 175.25, mes4: 175.25, mes5: 175.25, mes6: 175.25,
    mes7: 0, mes8: 0, mes9: 0, mes10: 0, mes11: 0, mes12: 0,
    deuda: 1051.50
  },
  {
    id: '5',
    año: 2024,
    titulo: 'TIM Limpieza Publica',
    mes1: 30.00, mes2: 30.00, mes3: 30.00, mes4: 30.00, mes5: 30.00, mes6: 30.00,
    mes7: 0, mes8: 0, mes9: 0, mes10: 0, mes11: 0, mes12: 0,
    deuda: 180.00
  }
];

// Interfaces para Deuda Fraccionamiento
interface ResolucionFraccionamiento {
  año: number;
  resolucion: string;
  cuotas: CuotaFraccionamiento[];
}

interface CuotaFraccionamiento {
  nCuota: number;
  deuda: number;
  im: number;
  cuota: number;
  fVenc: string;
  checked: boolean;
}

interface TributoFraccionado {
  tributo: string;
  valores: number[];
}

// Interfaces para Deuda Coactiva
interface ExpedienteCoactivo {
  añoExpediente: number;
  nroExpediente: string;
  años: AñoCoactivo[];
}

interface AñoCoactivo {
  año: number;
  tributos: TributoCoactivo[];
}

interface TributoCoactivo {
  tributo: string;
  valores: number[];
  checked: boolean;
}

const DeudaContribuyente: React.FC<DeudaContribuyenteProps> = ({
  open,
  onClose,
  contribuyenteData = null,
  loading = false,
  onPagoGenerado
}) => {
  // Estados
  const [montoAPagar, setMontoAPagar] = useState<string>('');
  const [tipoMonto, setTipoMonto] = useState<string>('repartir');
  const [deudaTabValue, setDeudaTabValue] = useState(0);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  
  // Estados para Deuda Fraccionamiento
  const [selectedAño, setSelectedAño] = useState<number | null>(null);
  const [cuotasFraccionamiento, setCuotasFraccionamiento] = useState<CuotaFraccionamiento[]>([]);
  const [tributosFraccionados, setTributosFraccionados] = useState<TributoFraccionado[]>([]);
  const [montoFraccionado, setMontoFraccionado] = useState<string>('');
  
  // Estados para Deuda Coactiva
  const [selectedExpediente, setSelectedExpediente] = useState<number | null>(null);
  const [selectedAñoCoactivo, setSelectedAñoCoactivo] = useState<number | null>(null);
  const [añosCoactivos, setAñosCoactivos] = useState<AñoCoactivo[]>([]);
  const [tributosCoactivos, setTributosCoactivos] = useState<TributoCoactivo[]>([]);
  const [montoCoactivo, setMontoCoactivo] = useState<string>('');

  // Calcular deuda global total
  const calcularDeudaGlobalTotal = (): number => {
    return deudaGlobalData.reduce((total, item) => total + item.deuda, 0);
  };

  // Calcular distribución de pago (vertical - por columnas)
  const calcularDistribucionPago = () => {
    const monto = parseFloat(montoAPagar) || 0;
    const distribucion: { [key: string]: { [key: string]: number } } = {};
    
    // Inicializar distribución
    for (const item of deudaGlobalData) {
      distribucion[item.id] = {};
      for (let mes = 1; mes <= 12; mes++) {
        distribucion[item.id][`mes${mes}`] = 0;
      }
    }
    
    let montoRestante = monto;
    
    if (tipoMonto === 'repartir') {
      // Distribuir verticalmente entre todas las filas
      for (let mes = 1; mes <= 12 && montoRestante > 0; mes++) {
        const mesKey = `mes${mes}` as keyof typeof deudaGlobalData[0];
        
        // Procesar cada fila para el mes actual
        for (const item of deudaGlobalData) {
          const deudaMes = item[mesKey] as number;
          
          if (montoRestante > 0 && deudaMes > 0) {
            const pago = Math.min(montoRestante, deudaMes);
            distribucion[item.id][mesKey] = pago;
            montoRestante -= pago;
          }
        }
      }
    } else {
      // Distribuir verticalmente solo entre filas seleccionadas
      const filasSeleccionadas = deudaGlobalData.filter(d => selectedRows.includes(d.id));
      
      for (let mes = 1; mes <= 12 && montoRestante > 0; mes++) {
        const mesKey = `mes${mes}` as keyof typeof deudaGlobalData[0];
        
        // Procesar solo filas seleccionadas para el mes actual
        for (const item of filasSeleccionadas) {
          const deudaMes = item[mesKey] as number;
          
          if (montoRestante > 0 && deudaMes > 0) {
            const pago = Math.min(montoRestante, deudaMes);
            distribucion[item.id][mesKey] = pago;
            montoRestante -= pago;
          }
        }
      }
    }
    
    return distribucion;
  };

  // Obtener color de celda según el pago
  const getCellColor = (itemId: string, mesKey: string, deudaMes: number): string => {
    if (deudaTabValue !== 1 || !montoAPagar || parseFloat(montoAPagar) <= 0) {
      return 'transparent';
    }
    
    const distribucion = calcularDistribucionPago();
    const pago = distribucion[itemId]?.[mesKey] || 0;
    
    if (pago === 0) return 'transparent';
    if (pago >= deudaMes) return '#1976d2'; // Primary color for full payment
    
    // Gradient for partial payment
    const percentage = (pago / deudaMes) * 100;
    return `linear-gradient(to right, #1976d2 ${percentage}%, transparent ${percentage}%)`;
  };

  // Verificar si el monto excede la deuda
  const montoExcedeDeuda = (): boolean => {
    const monto = parseFloat(montoAPagar) || 0;
    let deudaTotal = 0;
    
    if (tipoMonto === 'repartir') {
      deudaTotal = calcularDeudaGlobalTotal();
    } else {
      deudaTotal = deudaGlobalData
        .filter(d => selectedRows.includes(d.id))
        .reduce((sum, item) => sum + item.deuda, 0);
    }
    
    return monto > deudaTotal;
  };

  // Procesar pago de deuda ordinaria
  const procesarPagoDeudaOrdinaria = () => {
    if (!montoAPagar || parseFloat(montoAPagar) <= 0 || !contribuyenteData) {
      return;
    }

    const monto = parseFloat(montoAPagar);
    const distribucion = calcularDistribucionPago();
    const conceptos: ConceptoPago[] = [];
    
    // Agrupar por tributo
    const tributosProcesados = new Map<string, {
      añosAfectados: Set<number>,
      mesesAfectados: Set<number>,
      total: number,
      detalleMeses: { [mes: number]: number }
    }>();

    // Procesar distribución por cada item de deuda global
    for (const item of deudaGlobalData) {
      if (!tributosProcesados.has(item.titulo)) {
        tributosProcesados.set(item.titulo, {
          añosAfectados: new Set(),
          mesesAfectados: new Set(),
          total: 0,
          detalleMeses: {}
        });
      }
      
      const tributoData = tributosProcesados.get(item.titulo)!;
      
      // Verificar si este item tiene pagos
      const itemDistribucion = distribucion[item.id];
      if (itemDistribucion) {
        let tienePago = false;
        
        for (let mes = 1; mes <= 12; mes++) {
          const mesKey = `mes${mes}` as keyof typeof item;
          const pagoMes = itemDistribucion[mesKey] || 0;
          
          if (pagoMes > 0) {
            tienePago = true;
            tributoData.añosAfectados.add(item.año);
            tributoData.mesesAfectados.add(mes);
            tributoData.total += pagoMes;
            
            if (!tributoData.detalleMeses[mes]) {
              tributoData.detalleMeses[mes] = 0;
            }
            tributoData.detalleMeses[mes] += pagoMes;
          }
        }
      }
    }

    // Convertir a conceptos
    tributosProcesados.forEach((data, tributoNombre) => {
      if (data.total > 0) {
        const añosArray = Array.from(data.añosAfectados).sort();
        const mesesArray = Array.from(data.mesesAfectados).sort();
        
        conceptos.push({
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          descripcion: `${tributoNombre} - Años: ${añosArray.join(', ')} - Meses: ${mesesArray.join(', ')}`,
          añosAfectados: añosArray,
          mesesAfectados: mesesArray,
          total: data.total,
          detalleMeses: data.detalleMeses
        });
      }
    });

    const datosPago: DatosPagoDeudaOrdinaria = {
      montoTotal: monto,
      conceptos,
      contribuyente: contribuyenteData
    };

    // Llamar al callback para enviar los datos a Pagos.tsx
    if (onPagoGenerado) {
      onPagoGenerado(datosPago);
    }

    // Cerrar el modal
    handleClose();
  };

  // Procesar pago de deuda fraccionamiento
  const procesarPagoDeudaFraccionamiento = () => {
    if (!montoAPagar || parseFloat(montoAPagar) <= 0 || !contribuyenteData) {
      return;
    }

    const monto = parseFloat(montoAPagar);
    const conceptos: ConceptoPago[] = [];
    
    // Verificar que hay datos de tributos fraccionados
    if (!tributosFraccionados || tributosFraccionados.length === 0) {
      console.log('No hay tributos fraccionados cargados');
      return;
    }

    // Obtener cuotas seleccionadas
    const cuotasSeleccionadas = cuotasFraccionamiento.filter(c => c.checked);
    
    if (cuotasSeleccionadas.length === 0) {
      console.log('No hay cuotas seleccionadas');
      return;
    }

    // Obtener la resolución actual
    const resolucionActual = resolucionesFraccionamiento.find(r => r.año === selectedAño);
    
    if (!resolucionActual) {
      console.log('No hay resolución seleccionada');
      return;
    }

    // Usar la misma lógica que getCellColorFraccionamiento para determinar qué celdas están pintadas
    const tributosProcesados = new Map<string, {
      añosAfectados: Set<number>,
      mesesAfectados: Set<number>,
      total: number,
      detalleMeses: { [mes: number]: number }
    }>();

    let montoRestante = monto;
    
    // Recorrer columnas verticalmente (igual que en getCellColorFraccionamiento)
    for (let col = 0; col < 12; col++) {
      for (let row = 0; row < tributosFraccionados.length; row++) {
        if (montoRestante <= 0) break;
        
        const tributo = tributosFraccionados[row];
        const valor = tributo.valores[col];
        
        if (valor > 0) {
          // Calcular cuánto se puede pagar de esta celda
          const pagoEnCelda = Math.min(montoRestante, valor);
          
          if (pagoEnCelda > 0) {
            // Inicializar tributo si no existe
            if (!tributosProcesados.has(tributo.tributo)) {
              tributosProcesados.set(tributo.tributo, {
                añosAfectados: new Set(),
                mesesAfectados: new Set(),
                total: 0,
                detalleMeses: {}
              });
            }
            
            const tributoData = tributosProcesados.get(tributo.tributo)!;
            
            // Agregar datos
            tributoData.añosAfectados.add(selectedAño!);
            tributoData.mesesAfectados.add(col + 1); // +1 porque los meses van de 1-12
            tributoData.total += pagoEnCelda;
            
            // Detalle por mes
            const mes = col + 1;
            if (!tributoData.detalleMeses[mes]) {
              tributoData.detalleMeses[mes] = 0;
            }
            tributoData.detalleMeses[mes] += pagoEnCelda;
            
            // Restar del monto restante
            montoRestante -= pagoEnCelda;
          }
        }
      }
      
      if (montoRestante <= 0) break;
    }

    // Convertir a conceptos para Pagos.tsx
    tributosProcesados.forEach((data, tributoNombre) => {
      if (data.total > 0) {
        const añosArray = Array.from(data.añosAfectados).sort();
        const mesesArray = Array.from(data.mesesAfectados).sort();
        
        // Crear descripción con información detallada de fraccionamiento
        const cuotasInfo = cuotasSeleccionadas.map(c => `Cuota ${c.nCuota} (${c.fVenc})`).join(', ');
        const descripcion = `${tributoNombre} - Año: ${añosArray.join(', ')} - ${resolucionActual.resolucion} (${cuotasInfo}) - Meses: ${mesesArray.join(', ')}`;
        
        conceptos.push({
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          descripcion,
          añosAfectados: añosArray,
          mesesAfectados: mesesArray,
          total: data.total,
          detalleMeses: data.detalleMeses
        });
      }
    });

    const datosPago: DatosPagoDeudaOrdinaria = {
      montoTotal: monto,
      conceptos,
      contribuyente: contribuyenteData
    };

    // Llamar al callback para enviar los datos a Pagos.tsx
    if (onPagoGenerado) {
      onPagoGenerado(datosPago);
    }

    // Cerrar el modal
    handleClose();
  };

  // Manejar selección de filas
  const handleRowSelection = (itemId: string) => {
    setSelectedRows(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  // Manejar cambio de tabs de deuda
  const handleDeudaTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setDeudaTabValue(newValue);
  };

  // Manejar cambio de monto
  const handleMontoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    // Solo permitir n�meros positivos con decimales
    if (value === '' || (/^\d*\.?\d*$/.test(value) && parseFloat(value) >= 0)) {
      setMontoAPagar(value);
    }
  };

  // Datos de ejemplo para Deuda Fraccionamiento
  const resolucionesFraccionamiento: ResolucionFraccionamiento[] = [
    {
      año: 2022,
      resolucion: 'R001',
      cuotas: [
        { nCuota: 1, deuda: 1200.50, im: 12.25, cuota: 1212.75, fVenc: '15/01/2023', checked: true },
        { nCuota: 2, deuda: 1200.50, im: 12.25, cuota: 1212.75, fVenc: '15/02/2023', checked: false },
        { nCuota: 3, deuda: 1200.50, im: 12.25, cuota: 1212.75, fVenc: '15/03/2023', checked: false },
        { nCuota: 4, deuda: 1200.50, im: 12.25, cuota: 1212.75, fVenc: '15/04/2023', checked: false }
      ]
    },
    {
      año: 2023,
      resolucion: 'R002',
      cuotas: [
        { nCuota: 1, deuda: 1500.50, im: 15.25, cuota: 1515.75, fVenc: '15/01/2024', checked: true },
        { nCuota: 2, deuda: 1500.50, im: 15.25, cuota: 1515.75, fVenc: '15/02/2024', checked: false },
        { nCuota: 3, deuda: 1500.50, im: 15.25, cuota: 1515.75, fVenc: '15/03/2024', checked: false },
        { nCuota: 4, deuda: 1500.50, im: 15.25, cuota: 1515.75, fVenc: '15/04/2024', checked: false },
        { nCuota: 5, deuda: 1500.50, im: 15.25, cuota: 1515.75, fVenc: '15/05/2024', checked: false },
        { nCuota: 6, deuda: 1500.50, im: 15.25, cuota: 1515.75, fVenc: '15/06/2024', checked: false }
      ]
    },
    {
      año: 2024,
      resolucion: 'R003',
      cuotas: [
        { nCuota: 1, deuda: 1800.50, im: 18.25, cuota: 1818.75, fVenc: '15/01/2025', checked: true },
        { nCuota: 2, deuda: 1800.50, im: 18.25, cuota: 1818.75, fVenc: '15/02/2025', checked: false },
        { nCuota: 3, deuda: 1800.50, im: 18.25, cuota: 1818.75, fVenc: '15/03/2025', checked: false }
      ]
    }
  ];

  // Tributos base para la tabla de fraccionamiento
  const tributosFraccionadosBase: TributoFraccionado[] = [
    { tributo: 'Parques y Jardines', valores: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { tributo: 'Impuesto Predial', valores: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { tributo: 'Serenazgo', valores: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { tributo: 'Limpieza Publica', valores: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { tributo: 'Formularios D.J', valores: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { tributo: 'TIM Impuesto Predial', valores: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { tributo: 'TIM Parques y Jardines', valores: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }
  ];

  // Manejar selección de año en Deuda Fraccionamiento
  const handleAñoClick = (año: number) => {
    setSelectedAño(año);
    const resolucion = resolucionesFraccionamiento.find(r => r.año === año);
    if (resolucion) {
      // Configurar cuotas con el menor N°Cuota marcado
      const cuotasConCheck = resolucion.cuotas.map((cuota, index) => ({
        ...cuota,
        checked: index === 0 // Solo marcar la primera cuota (menor N°Cuota)
      }));
      setCuotasFraccionamiento(cuotasConCheck);
      
      // Simular datos de tributos fraccionados para el año seleccionado
      const nuevosTributos = tributosFraccionadosBase.map(tributo => {
        const valores = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        
        // Asignar valores de ejemplo según el tributo y año
        if (tributo.tributo === 'Parques y Jardines') {
          for (let i = 0; i < 6; i++) valores[i] = 25.50 * (año / 2022);
        } else if (tributo.tributo === 'Impuesto Predial') {
          for (let i = 0; i < 6; i++) valores[i] = 150.75 * (año / 2022);
        } else if (tributo.tributo === 'Serenazgo') {
          for (let i = 0; i < 6; i++) valores[i] = 35.25 * (año / 2022);
        } else if (tributo.tributo === 'Limpieza Publica') {
          for (let i = 0; i < 6; i++) valores[i] = 40.00 * (año / 2022);
        } else if (tributo.tributo === 'Formularios D.J') {
          for (let i = 0; i < 6; i++) valores[i] = 10.00 * (año / 2022);
        } else if (tributo.tributo === 'TIM Impuesto Predial') {
          for (let i = 0; i < 6; i++) valores[i] = 5.50 * (año / 2022);
        } else if (tributo.tributo === 'TIM Parques y Jardines') {
          for (let i = 0; i < 6; i++) valores[i] = 3.25 * (año / 2022);
        }
        
        return { ...tributo, valores };
      });
      
      setTributosFraccionados(nuevosTributos);
      
      // Calcular deuda fraccionada total
      const totalFraccionado = cuotasConCheck
        .filter(c => c.checked)
        .reduce((sum, c) => sum + c.cuota, 0);
      setMontoFraccionado(`S/. ${totalFraccionado.toFixed(2)}`);
    }
  };

  // Manejar check de cuotas en Deuda Fraccionamiento
  const handleCuotaCheck = (nCuota: number) => {
    const nuevasCuotas = cuotasFraccionamiento.map(cuota => 
      cuota.nCuota === nCuota 
        ? { ...cuota, checked: !cuota.checked }
        : cuota
    );
    setCuotasFraccionamiento(nuevasCuotas);
    
    // Recalcular deuda fraccionada
    const totalFraccionado = nuevasCuotas
      .filter(c => c.checked)
      .reduce((sum, c) => sum + c.cuota, 0);
    setMontoFraccionado(`S/. ${totalFraccionado.toFixed(2)}`);
  };

  // Calcular color de celda para pintado vertical en Deuda Fraccionamiento
  const getCellColorFraccionamiento = (tributoIndex: number, mesIndex: number): string => {
    // Solo pintar si hay tributos fraccionados cargados
    if (!tributosFraccionados || tributosFraccionados.length === 0) return 'transparent';
    
    // Usar montoAPagar si está disponible, sino usar montoFraccionado
    let montoNumerico = 0;
    if (montoAPagar && parseFloat(montoAPagar) > 0) {
      montoNumerico = parseFloat(montoAPagar);
    } else if (montoFraccionado && montoFraccionado !== 'S/. 0.00') {
      montoNumerico = parseFloat(montoFraccionado.replace('S/. ', ''));
    }
    
    if (montoNumerico === 0) return 'transparent';
    
    let montoRestante = montoNumerico;
    
    // Recorrer columnas verticalmente
    for (let col = 0; col < 12; col++) {
      for (let row = 0; row < tributosFraccionados.length; row++) {
        const valor = tributosFraccionados[row].valores[col];
        
        if (montoRestante > 0 && valor > 0) {
          if (row === tributoIndex && col === mesIndex) {
            if (montoRestante >= valor) {
              return '#1976d2'; // Color completo
            } else if (montoRestante > 0) {
              const percentage = (montoRestante / valor) * 100;
              return `linear-gradient(to bottom, #1976d2 ${percentage}%, transparent ${percentage}%)`;
            }
          }
          montoRestante -= Math.min(montoRestante, valor);
        }
      }
    }
    
    return 'transparent';
  };

  // Datos de ejemplo para Deuda Coactiva
  const expedientesCoactivos: ExpedienteCoactivo[] = [
    {
      añoExpediente: 2021,
      nroExpediente: 'EXP-001-2021',
      años: [
        {
          año: 2019,
          tributos: [
            { tributo: 'Parques y Jardines', valores: [30.50, 30.50, 30.50, 30.50, 30.50, 30.50, 0, 0, 0, 0, 0, 0], checked: true },
            { tributo: 'Impuesto Predial', valores: [180.75, 180.75, 180.75, 180.75, 180.75, 180.75, 0, 0, 0, 0, 0, 0], checked: true },
            { tributo: 'Serenazgo', valores: [45.25, 45.25, 45.25, 45.25, 45.25, 45.25, 0, 0, 0, 0, 0, 0], checked: true },
            { tributo: 'Limpieza Publica', valores: [50.00, 50.00, 50.00, 50.00, 50.00, 50.00, 0, 0, 0, 0, 0, 0], checked: true },
            { tributo: 'Formularios D.J', valores: [15.00, 15.00, 15.00, 15.00, 15.00, 15.00, 0, 0, 0, 0, 0, 0], checked: true },
            { tributo: 'TIM Impuesto Predial', valores: [8.50, 8.50, 8.50, 8.50, 8.50, 8.50, 0, 0, 0, 0, 0, 0], checked: true },
            { tributo: 'TIM Parques y Jardines', valores: [5.25, 5.25, 5.25, 5.25, 5.25, 5.25, 0, 0, 0, 0, 0, 0], checked: true },
            { tributo: 'TIM Serenazgo', valores: [4.25, 4.25, 4.25, 4.25, 4.25, 4.25, 0, 0, 0, 0, 0, 0], checked: true }
          ]
        },
        {
          año: 2020,
          tributos: [
            { tributo: 'Parques y Jardines', valores: [35.50, 35.50, 35.50, 35.50, 35.50, 35.50, 35.50, 35.50, 35.50, 35.50, 35.50, 35.50], checked: true },
            { tributo: 'Impuesto Predial', valores: [200.75, 200.75, 200.75, 200.75, 200.75, 200.75, 200.75, 200.75, 200.75, 200.75, 200.75, 200.75], checked: true },
            { tributo: 'Serenazgo', valores: [50.25, 50.25, 50.25, 50.25, 50.25, 50.25, 50.25, 50.25, 50.25, 50.25, 50.25, 50.25], checked: true },
            { tributo: 'Limpieza Publica', valores: [55.00, 55.00, 55.00, 55.00, 55.00, 55.00, 55.00, 55.00, 55.00, 55.00, 55.00, 55.00], checked: true },
            { tributo: 'Formularios D.J', valores: [18.00, 18.00, 18.00, 18.00, 18.00, 18.00, 18.00, 18.00, 18.00, 18.00, 18.00, 18.00], checked: true },
            { tributo: 'TIM Impuesto Predial', valores: [10.50, 10.50, 10.50, 10.50, 10.50, 10.50, 10.50, 10.50, 10.50, 10.50, 10.50, 10.50], checked: true },
            { tributo: 'TIM Parques y Jardines', valores: [6.25, 6.25, 6.25, 6.25, 6.25, 6.25, 6.25, 6.25, 6.25, 6.25, 6.25, 6.25], checked: true },
            { tributo: 'TIM Serenazgo', valores: [5.25, 5.25, 5.25, 5.25, 5.25, 5.25, 5.25, 5.25, 5.25, 5.25, 5.25, 5.25], checked: true }
          ]
        }
      ]
    },
    {
      añoExpediente: 2022,
      nroExpediente: 'EXP-002-2022',
      años: [
        {
          año: 2020,
          tributos: [
            { tributo: 'Parques y Jardines', valores: [40.50, 40.50, 40.50, 40.50, 40.50, 40.50, 40.50, 40.50, 40.50, 40.50, 40.50, 40.50], checked: true },
            { tributo: 'Impuesto Predial', valores: [220.75, 220.75, 220.75, 220.75, 220.75, 220.75, 220.75, 220.75, 220.75, 220.75, 220.75, 220.75], checked: true },
            { tributo: 'Serenazgo', valores: [55.25, 55.25, 55.25, 55.25, 55.25, 55.25, 55.25, 55.25, 55.25, 55.25, 55.25, 55.25], checked: true },
            { tributo: 'Limpieza Publica', valores: [60.00, 60.00, 60.00, 60.00, 60.00, 60.00, 60.00, 60.00, 60.00, 60.00, 60.00, 60.00], checked: true },
            { tributo: 'Formularios D.J', valores: [20.00, 20.00, 20.00, 20.00, 20.00, 20.00, 20.00, 20.00, 20.00, 20.00, 20.00, 20.00], checked: true },
            { tributo: 'TIM Impuesto Predial', valores: [12.50, 12.50, 12.50, 12.50, 12.50, 12.50, 12.50, 12.50, 12.50, 12.50, 12.50, 12.50], checked: true },
            { tributo: 'TIM Parques y Jardines', valores: [7.25, 7.25, 7.25, 7.25, 7.25, 7.25, 7.25, 7.25, 7.25, 7.25, 7.25, 7.25], checked: true },
            { tributo: 'TIM Serenazgo', valores: [6.25, 6.25, 6.25, 6.25, 6.25, 6.25, 6.25, 6.25, 6.25, 6.25, 6.25, 6.25], checked: true }
          ]
        }
      ]
    },
    {
      añoExpediente: 2023,
      nroExpediente: 'EXP-003-2023',
      años: [
        {
          año: 2021,
          tributos: [
            { tributo: 'Parques y Jardines', valores: [45.50, 45.50, 45.50, 45.50, 45.50, 45.50, 45.50, 45.50, 45.50, 45.50, 45.50, 45.50], checked: true },
            { tributo: 'Impuesto Predial', valores: [250.75, 250.75, 250.75, 250.75, 250.75, 250.75, 250.75, 250.75, 250.75, 250.75, 250.75, 250.75], checked: true },
            { tributo: 'Serenazgo', valores: [60.25, 60.25, 60.25, 60.25, 60.25, 60.25, 60.25, 60.25, 60.25, 60.25, 60.25, 60.25], checked: true },
            { tributo: 'Limpieza Publica', valores: [65.00, 65.00, 65.00, 65.00, 65.00, 65.00, 65.00, 65.00, 65.00, 65.00, 65.00, 65.00], checked: true },
            { tributo: 'Formularios D.J', valores: [22.00, 22.00, 22.00, 22.00, 22.00, 22.00, 22.00, 22.00, 22.00, 22.00, 22.00, 22.00], checked: true },
            { tributo: 'TIM Impuesto Predial', valores: [14.50, 14.50, 14.50, 14.50, 14.50, 14.50, 14.50, 14.50, 14.50, 14.50, 14.50, 14.50], checked: true },
            { tributo: 'TIM Parques y Jardines', valores: [8.25, 8.25, 8.25, 8.25, 8.25, 8.25, 8.25, 8.25, 8.25, 8.25, 8.25, 8.25], checked: true },
            { tributo: 'TIM Serenazgo', valores: [7.25, 7.25, 7.25, 7.25, 7.25, 7.25, 7.25, 7.25, 7.25, 7.25, 7.25, 7.25], checked: true }
          ]
        },
        {
          año: 2022,
          tributos: [
            { tributo: 'Parques y Jardines', valores: [48.50, 48.50, 48.50, 48.50, 48.50, 48.50, 48.50, 48.50, 48.50, 48.50, 48.50, 48.50], checked: true },
            { tributo: 'Impuesto Predial', valores: [270.75, 270.75, 270.75, 270.75, 270.75, 270.75, 270.75, 270.75, 270.75, 270.75, 270.75, 270.75], checked: true },
            { tributo: 'Serenazgo', valores: [65.25, 65.25, 65.25, 65.25, 65.25, 65.25, 65.25, 65.25, 65.25, 65.25, 65.25, 65.25], checked: true },
            { tributo: 'Limpieza Publica', valores: [70.00, 70.00, 70.00, 70.00, 70.00, 70.00, 70.00, 70.00, 70.00, 70.00, 70.00, 70.00], checked: true },
            { tributo: 'Formularios D.J', valores: [25.00, 25.00, 25.00, 25.00, 25.00, 25.00, 25.00, 25.00, 25.00, 25.00, 25.00, 25.00], checked: true },
            { tributo: 'TIM Impuesto Predial', valores: [16.50, 16.50, 16.50, 16.50, 16.50, 16.50, 16.50, 16.50, 16.50, 16.50, 16.50, 16.50], checked: true },
            { tributo: 'TIM Parques y Jardines', valores: [9.25, 9.25, 9.25, 9.25, 9.25, 9.25, 9.25, 9.25, 9.25, 9.25, 9.25, 9.25], checked: true },
            { tributo: 'TIM Serenazgo', valores: [8.25, 8.25, 8.25, 8.25, 8.25, 8.25, 8.25, 8.25, 8.25, 8.25, 8.25, 8.25], checked: true }
          ]
        }
      ]
    }
  ];

  // Manejar selección de expediente en Deuda Coactiva
  const handleExpedienteClick = (añoExpediente: number) => {
    setSelectedExpediente(añoExpediente);
    const expediente = expedientesCoactivos.find(e => e.añoExpediente === añoExpediente);
    if (expediente) {
      setAñosCoactivos(expediente.años);
      setSelectedAñoCoactivo(null);
      setTributosCoactivos([]);
      setMontoCoactivo('S/. 0.00');
    }
  };

  // Manejar selección de año en Deuda Coactiva
  const handleAñoCoactivoClick = (año: number) => {
    setSelectedAñoCoactivo(año);
    const añoData = añosCoactivos.find(a => a.año === año);
    if (añoData) {
      setTributosCoactivos(añoData.tributos);
      
      // Calcular deuda coactiva total
      const totalCoactivo = añoData.tributos
        .filter(t => t.checked)
        .reduce((sum, tributo) => {
          const totalTributo = tributo.valores.reduce((s, v) => s + v, 0);
          return sum + totalTributo;
        }, 0);
      setMontoCoactivo(`S/. ${totalCoactivo.toFixed(2)}`);
    }
  };

  // Manejar check de tributos en Deuda Coactiva
  const handleTributoCoactivoCheck = (index: number) => {
    const nuevosTributos = tributosCoactivos.map((tributo, i) =>
      i === index ? { ...tributo, checked: !tributo.checked } : tributo
    );
    setTributosCoactivos(nuevosTributos);

    // Recalcular deuda coactiva
    const totalCoactivo = nuevosTributos
      .filter(t => t.checked)
      .reduce((sum, tributo) => {
        const totalTributo = tributo.valores.reduce((s, v) => s + v, 0);
        return sum + totalTributo;
      }, 0);
    setMontoCoactivo(`S/. ${totalCoactivo.toFixed(2)}`);
  };

  // Procesar pago de deuda coactiva
  const procesarPagoDeudaCoactiva = () => {
    if (!montoAPagar || parseFloat(montoAPagar) <= 0 || !contribuyenteData) {
      return;
    }

    const monto = parseFloat(montoAPagar);
    const conceptos: ConceptoPago[] = [];

    // Verificar que hay datos de tributos coactivos
    if (!tributosCoactivos || tributosCoactivos.length === 0) {
      console.log('No hay tributos coactivos cargados');
      return;
    }

    // Verificar que hay un expediente y año seleccionados
    if (!selectedExpediente || !selectedAñoCoactivo) {
      console.log('No hay expediente o año coactivo seleccionado');
      return;
    }

    // Obtener el expediente actual
    const expedienteActual = expedientesCoactivos.find(e => e.añoExpediente === selectedExpediente);
    if (!expedienteActual) {
      console.log('No se encontró el expediente');
      return;
    }

    // Usar la misma lógica que getCellColorCoactivo para determinar qué celdas están pintadas
    const tributosProcesados = new Map<string, {
      añosAfectados: Set<number>,
      mesesAfectados: Set<number>,
      total: number,
      detalleMeses: { [mes: number]: number },
      nroExpediente: string,
      añoExpediente: number
    }>();

    let montoRestante = monto;

    // Recorrer columnas verticalmente (igual que en getCellColorCoactivo)
    for (let col = 0; col < 12; col++) {
      for (let row = 0; row < tributosCoactivos.length; row++) {
        if (montoRestante <= 0) break;

        const tributo = tributosCoactivos[row];

        // Solo procesar tributos que están marcados (checked)
        if (!tributo.checked) continue;

        const valor = tributo.valores[col];

        if (valor > 0) {
          // Calcular cuánto se puede pagar de esta celda
          const pagoEnCelda = Math.min(montoRestante, valor);

          if (pagoEnCelda > 0) {
            // Inicializar tributo si no existe
            if (!tributosProcesados.has(tributo.tributo)) {
              tributosProcesados.set(tributo.tributo, {
                añosAfectados: new Set(),
                mesesAfectados: new Set(),
                total: 0,
                detalleMeses: {},
                nroExpediente: expedienteActual.nroExpediente,
                añoExpediente: expedienteActual.añoExpediente
              });
            }

            const tributoData = tributosProcesados.get(tributo.tributo)!;

            // Agregar datos
            tributoData.añosAfectados.add(selectedAñoCoactivo);
            tributoData.mesesAfectados.add(col + 1); // +1 porque los meses van de 1-12
            tributoData.total += pagoEnCelda;

            // Detalle por mes
            const mes = col + 1;
            if (!tributoData.detalleMeses[mes]) {
              tributoData.detalleMeses[mes] = 0;
            }
            tributoData.detalleMeses[mes] += pagoEnCelda;

            // Restar del monto restante
            montoRestante -= pagoEnCelda;
          }
        }
      }

      if (montoRestante <= 0) break;
    }

    // Convertir a conceptos para Pagos.tsx
    tributosProcesados.forEach((data, tributoNombre) => {
      if (data.total > 0) {
        const añosArray = Array.from(data.añosAfectados).sort();
        const mesesArray = Array.from(data.mesesAfectados).sort();

        // Crear descripción con información detallada del expediente coactivo
        const descripcion = `${tributoNombre} - Expediente: ${data.nroExpediente} (${data.añoExpediente}) - Año: ${añosArray.join(', ')} - Meses: ${mesesArray.join(', ')}`;

        conceptos.push({
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          descripcion,
          añosAfectados: añosArray,
          mesesAfectados: mesesArray,
          total: data.total,
          detalleMeses: data.detalleMeses
        });
      }
    });

    const datosPago: DatosPagoDeudaOrdinaria = {
      montoTotal: monto,
      conceptos,
      contribuyente: contribuyenteData
    };

    // Llamar al callback para enviar los datos a Pagos.tsx
    if (onPagoGenerado) {
      onPagoGenerado(datosPago);
    }

    // Cerrar el modal
    handleClose();
  };

  // Calcular color de celda para pintado vertical en Deuda Coactiva
  const getCellColorCoactivo = (tributoIndex: number, mesIndex: number): string => {
    // Solo pintar si hay tributos coactivos cargados
    if (!tributosCoactivos || tributosCoactivos.length === 0) return 'transparent';
    
    // Usar montoAPagar si está disponible, sino usar montoCoactivo
    let montoNumerico = 0;
    if (montoAPagar && parseFloat(montoAPagar) > 0) {
      montoNumerico = parseFloat(montoAPagar);
    } else if (montoCoactivo && montoCoactivo !== 'S/. 0.00') {
      montoNumerico = parseFloat(montoCoactivo.replace('S/. ', ''));
    }
    
    if (montoNumerico === 0) return 'transparent';
    
    let montoRestante = montoNumerico;
    
    // Recorrer columnas verticalmente
    for (let col = 0; col < 12; col++) {
      for (let row = 0; row < tributosCoactivos.length; row++) {
        const tributo = tributosCoactivos[row];
        if (tributo.checked) {
          const valor = tributo.valores[col];
          
          if (montoRestante > 0 && valor > 0) {
            if (row === tributoIndex && col === mesIndex) {
              if (montoRestante >= valor) {
                return '#1976d2'; // Color completo
              } else if (montoRestante > 0) {
                const percentage = (montoRestante / valor) * 100;
                return `linear-gradient(to bottom, #1976d2 ${percentage}%, transparent ${percentage}%)`;
              }
            }
            montoRestante -= Math.min(montoRestante, valor);
          }
        }
      }
    }
    
    return 'transparent';
  };

  // Limpiar formulario al cerrar
  const handleClose = () => {
    setMontoAPagar('');
    setTipoMonto('repartir');
    setDeudaTabValue(0);
    setSelectedRows([]);
    setSelectedAño(null);
    setCuotasFraccionamiento([]);
    setTributosFraccionados([]);
    setMontoFraccionado('');
    setSelectedExpediente(null);
    setSelectedAñoCoactivo(null);
    setAñosCoactivos([]);
    setTributosCoactivos([]);
    setMontoCoactivo('');
    onClose();
  };

  return (
    <StyledDialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
    >
      {/* Header */}
      <HeaderBox>
        <Box display="flex" alignItems="center" gap={1}>
          <ReceiptIcon />
          <Typography variant="h6" fontWeight="bold">
            Deuda Contribuyente
          </Typography>
        </Box>
        <IconButton
          onClick={handleClose}
          sx={{ color: 'white' }}
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </HeaderBox>

      <DialogContent sx={{ padding: 3, height: '100%', overflow: 'hidden' }}>
        <ContentBox>
          {contribuyenteData ? (
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, height: '100%', overflow: 'hidden' }}>
              {/* Tabla de datos del contribuyente */}
              <Paper elevation={1} sx={{ border: '1px solid #e0e0e0' }}>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>
                          Codigo Predio
                        </TableCell>
                        <TableCell sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>
                          Contribuyente
                        </TableCell>
                        <TableCell sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>
                          Direccion
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>{contribuyenteData.codigoPredio}</TableCell>
                        <TableCell>{contribuyenteData.contribuyente}</TableCell>
                        <TableCell>{contribuyenteData.direccionPredio}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>

              {/* Seccion Monto a Pagar */}
              <Paper elevation={1} sx={{ p: 2, border: '1px solid #e0e0e0', opacity: deudaTabValue === 0 ? 0.5 : 1 }}>
               
                {/** TextField Monto */}
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                  <Box sx={{ flex: '0 1 130px', minWidth: '130px' }}>
                    <TextField
                      label="Monto a Pagar"
                      value={montoAPagar}
                      onChange={handleMontoChange}
                      size="small"
                      fullWidth
                      type="number"
                      inputProps={{ min: 0, step: 0.01 }}
                      placeholder="0.00"
                      disabled={deudaTabValue === 0}
                    />
                  </Box>
                  {/** RadioGroup */}
                  <Box sx={{ flex: '0 1 auto' }}>
                    <FormControl component="fieldset" size="small" disabled={deudaTabValue === 0 || !montoAPagar || parseFloat(montoAPagar) <= 0}>
                      <RadioGroup
                        row
                        value={tipoMonto}
                        onChange={(e) => setTipoMonto(e.target.value)}
                      >
                        <FormControlLabel 
                          value="repartir" 
                          control={<Radio size="small" />} 
                          label="Repartir Monto" 
                        />
                        <FormControlLabel 
                          value="seleccionar" 
                          control={<Radio size="small" />} 
                          label="Seleccionar Monto" 
                        />
                      </RadioGroup>
                    </FormControl>
                  </Box>
                  {/** Button Pagar */}
                  <Box sx={{ flex: '0 1 auto' }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={
                        deudaTabValue === 1 ? procesarPagoDeudaOrdinaria :
                        deudaTabValue === 2 ? procesarPagoDeudaFraccionamiento :
                        deudaTabValue === 3 ? procesarPagoDeudaCoactiva :
                        () => console.log('Pagar clicked')
                      }
                      disabled={
                        deudaTabValue === 0 ||
                        !montoAPagar ||
                        parseFloat(montoAPagar) <= 0 ||
                        (deudaTabValue === 1 && montoExcedeDeuda()) ||
                        (deudaTabValue === 2 && (!selectedAño || cuotasFraccionamiento.filter(c => c.checked).length === 0)) ||
                        (deudaTabValue === 3 && (!selectedExpediente || !selectedAñoCoactivo || tributosCoactivos.filter(t => t.checked).length === 0))
                      }
                      sx={{
                        px: 3,
                        height: '40px'
                      }}
                    >
                      Pagar
                    </Button>
                  </Box>
                  {/** Button Nuevo */}
                  <Box sx={{ flex: '0 1 auto' }}>
                    <Button
                      variant="outlined"
                      onClick={() => console.log('Nuevo clicked')}
                      disabled={deudaTabValue === 0 || !montoAPagar || parseFloat(montoAPagar) <= 0}
                      sx={{
                        px: 3,
                        height: '40px',
                        backgroundColor: 'white',
                        borderColor: 'primary.main',
                        color: 'primary.main',
                        '&:hover': {
                          backgroundColor: 'primary.light',
                          borderColor: 'primary.main',
                        }
                      }}
                    >
                      Nuevo
                    </Button>
                  </Box>
                </Box>
                
                {/* Warning message for excess payment */}
                {montoExcedeDeuda() && (
                  <Box sx={{ mt: 2 }}>
                    <Alert severity="warning" icon={<WarningIcon />}>
                      El monto ingresado excede la deuda total seleccionada
                    </Alert>
                  </Box>
                )}
              </Paper>

              {/* Tabs de tipos de deuda */}
              <Paper elevation={1} sx={{ flex: 1, border: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2, pt: 2 }}>
                  <Tabs value={deudaTabValue} onChange={handleDeudaTabChange} variant="scrollable" scrollButtons="auto">
                    <Tab 
                      label="Deuda Global" 
                      icon={<PublicIcon />} 
                    />
                    <Tab 
                      label="Deuda Ordinaria" 
                      icon={<AccountBalanceIcon />} 
                    />
                    <Tab 
                      label="Deuda Fraccionamiento" 
                      icon={<PaymentIcon />} 
                    />
                    <Tab 
                      label="Deuda Coactiva" 
                      icon={<GavelIcon />} 
                    />
                  </Tabs>
                </Box>
                
                {/* Contenido de tabs de deuda */}
                <Box sx={{ flex: 1, p: 2, display: 'flex', flexDirection: 'column', gap: 2, overflow: 'hidden' }}>
                  {/* Tab Deuda Global */}
                  {deudaTabValue === 0 && (
                    <Box sx={{ display: 'flex', gap: 2, height: '100%', overflow: 'hidden' }}>
                      {/* Tabla de Deuda Global */}
                      <Box sx={{ flex: 1, minHeight: 0 }}>
                        <TableContainer 
                          component={Paper} 
                          variant="outlined"
                          sx={{
                            height: '100%',
                            overflowY: 'auto',
                            overflowX: 'hidden',
                            '&::-webkit-scrollbar': {
                              width: '8px',
                            },
                            '&::-webkit-scrollbar-track': {
                              backgroundColor: '#f1f1f1',
                            },
                            '&::-webkit-scrollbar-thumb': {
                              backgroundColor: '#888',
                              borderRadius: '4px',
                              '&:hover': {
                                backgroundColor: '#555',
                              },
                            },
                          }}
                        >
                          <Table size="small" stickyHeader sx={{ minWidth: 750, tableLayout: 'fixed' }}>
                            <TableHead>
                              <TableRow>
                                <TableCell sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold', width: 35, maxWidth: 35, p: 0.25, fontSize: '0.75rem' }}>
                                  Año
                                </TableCell>
                                <TableCell sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold', width: 80, maxWidth: 80, p: 0, pl: 0.25, fontSize: '0.75rem' }}>
                                  Titulo
                                </TableCell>
                                <TableCell align="right" sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold', width: 30, maxWidth: 30, p: 0, fontSize: '0.7rem' }}>
                                  1
                                </TableCell>
                                <TableCell align="right" sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold', width: 30, maxWidth: 30, p: 0, fontSize: '0.7rem' }}>
                                  2
                                </TableCell>
                                <TableCell align="right" sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold', width: 30, maxWidth: 30, p: 0, fontSize: '0.7rem' }}>
                                  3
                                </TableCell>
                                <TableCell align="right" sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold', width: 30, maxWidth: 30, p: 0, fontSize: '0.7rem' }}>
                                  4
                                </TableCell>
                                <TableCell align="right" sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold', width: 30, maxWidth: 30, p: 0, fontSize: '0.7rem' }}>
                                  5
                                </TableCell>
                                <TableCell align="right" sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold', width: 30, maxWidth: 30, p: 0, fontSize: '0.7rem' }}>
                                  6
                                </TableCell>
                                <TableCell align="right" sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold', width: 30, maxWidth: 30, p: 0, fontSize: '0.7rem' }}>
                                  7
                                </TableCell>
                                <TableCell align="right" sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold', width: 30, maxWidth: 30, p: 0, fontSize: '0.7rem' }}>
                                  8
                                </TableCell>
                                <TableCell align="right" sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold', width: 30, maxWidth: 30, p: 0, fontSize: '0.7rem' }}>
                                  9
                                </TableCell>
                                <TableCell align="right" sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold', width: 30, maxWidth: 30, p: 0, fontSize: '0.7rem' }}>
                                  10
                                </TableCell>
                                <TableCell align="right" sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold', width: 30, maxWidth: 30, p: 0, fontSize: '0.7rem' }}>
                                  11
                                </TableCell>
                                <TableCell align="right" sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold', width: 30, maxWidth: 30, p: 0, fontSize: '0.7rem' }}>
                                  12
                                </TableCell>
                                <TableCell align="right" sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold', width: 50, maxWidth: 50, p: 0.25, fontSize: '0.75rem' }}>
                                  Deuda
                                </TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {deudaGlobalData.map((item) => (
                                <TableRow key={item.id} hover>
                                  <TableCell sx={{ p: 0.25, fontSize: '0.7rem' }}>{item.año}</TableCell>
                                  <TableCell sx={{ p: 0, pl: 0.25, fontSize: '0.7rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.titulo}</TableCell>
                                  <TableCell align="right" sx={{ p: 0, fontSize: '0.65rem' }}>{item.mes1 > 0 ? item.mes1.toFixed(2) : '-'}</TableCell>
                                  <TableCell align="right" sx={{ p: 0, fontSize: '0.65rem' }}>{item.mes2 > 0 ? item.mes2.toFixed(2) : '-'}</TableCell>
                                  <TableCell align="right" sx={{ p: 0, fontSize: '0.65rem' }}>{item.mes3 > 0 ? item.mes3.toFixed(2) : '-'}</TableCell>
                                  <TableCell align="right" sx={{ p: 0, fontSize: '0.65rem' }}>{item.mes4 > 0 ? item.mes4.toFixed(2) : '-'}</TableCell>
                                  <TableCell align="right" sx={{ p: 0, fontSize: '0.65rem' }}>{item.mes5 > 0 ? item.mes5.toFixed(2) : '-'}</TableCell>
                                  <TableCell align="right" sx={{ p: 0, fontSize: '0.65rem' }}>{item.mes6 > 0 ? item.mes6.toFixed(2) : '-'}</TableCell>
                                  <TableCell align="right" sx={{ p: 0, fontSize: '0.65rem' }}>{item.mes7 > 0 ? item.mes7.toFixed(2) : '-'}</TableCell>
                                  <TableCell align="right" sx={{ p: 0, fontSize: '0.65rem' }}>{item.mes8 > 0 ? item.mes8.toFixed(2) : '-'}</TableCell>
                                  <TableCell align="right" sx={{ p: 0, fontSize: '0.65rem' }}>{item.mes9 > 0 ? item.mes9.toFixed(2) : '-'}</TableCell>
                                  <TableCell align="right" sx={{ p: 0, fontSize: '0.65rem' }}>{item.mes10 > 0 ? item.mes10.toFixed(2) : '-'}</TableCell>
                                  <TableCell align="right" sx={{ p: 0, fontSize: '0.65rem' }}>{item.mes11 > 0 ? item.mes11.toFixed(2) : '-'}</TableCell>
                                  <TableCell align="right" sx={{ p: 0, fontSize: '0.65rem' }}>{item.mes12 > 0 ? item.mes12.toFixed(2) : '-'}</TableCell>
                                  <TableCell align="right" sx={{ p: 0.25, fontSize: '0.7rem', fontWeight: 'bold' }}>
                                    S/. {item.deuda.toFixed(2)}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Box>

                      {/* TextField Deuda Global Total */}
                      <Box sx={{ flex: '0 1 200px', minWidth: '200px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                          Deuda Global
                        </Typography>
                        <TextField
                          value={`S/. ${calcularDeudaGlobalTotal().toFixed(2)}`}
                          size="small"
                          fullWidth
                          disabled
                          sx={{ 
                            '& .MuiInputBase-root': {
                              backgroundColor: 'primary.main',
                              color: 'white',
                            },
                            '& .MuiInputBase-input.Mui-disabled': {
                              WebkitTextFillColor: 'white',
                              color: 'white',
                              fontWeight: 'bold'
                            },
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'primary.dark',
                            }
                          }}
                        />
                      </Box>
                    </Box>
                  )}

                  {/* Tab Deuda Ordinaria */}
                  {deudaTabValue === 1 && (
                    <Box sx={{ display: 'flex', gap: 2, height: '100%', overflow: 'hidden' }}>
                      {/* Tabla de Deuda Ordinaria */}
                      <Box sx={{ flex: 1, minHeight: 0 }}>
                        <TableContainer 
                          component={Paper} 
                          variant="outlined"
                          sx={{
                            height: '100%',
                            overflowY: 'auto',
                            overflowX: 'hidden',
                            '&::-webkit-scrollbar': {
                              width: '8px',
                            },
                            '&::-webkit-scrollbar-track': {
                              backgroundColor: '#f1f1f1',
                            },
                            '&::-webkit-scrollbar-thumb': {
                              backgroundColor: '#888',
                              borderRadius: '4px',
                              '&:hover': {
                                backgroundColor: '#555',
                              },
                            },
                          }}
                        >
                          <Table size="small" stickyHeader sx={{ minWidth: tipoMonto === 'seleccionar' ? 800 : 750, tableLayout: 'fixed' }}>
                            <TableHead>
                              <TableRow>
                                {tipoMonto === 'seleccionar' && (
                                  <TableCell sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold', width: 40, maxWidth: 40, p: 0.25 }}>
                                    {/* Empty header for checkbox column */}
                                  </TableCell>
                                )}
                                <TableCell sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold', width: 35, maxWidth: 35, p: 0.25, fontSize: '0.75rem' }}>
                                  Año
                                </TableCell>
                                <TableCell sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold', width: 80, maxWidth: 80, p: 0, pl: 0.25, fontSize: '0.75rem' }}>
                                  Tributo
                                </TableCell>
                                <TableCell align="right" sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold', width: 30, maxWidth: 30, p: 0, fontSize: '0.7rem' }}>
                                  1
                                </TableCell>
                                <TableCell align="right" sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold', width: 30, maxWidth: 30, p: 0, fontSize: '0.7rem' }}>
                                  2
                                </TableCell>
                                <TableCell align="right" sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold', width: 30, maxWidth: 30, p: 0, fontSize: '0.7rem' }}>
                                  3
                                </TableCell>
                                <TableCell align="right" sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold', width: 30, maxWidth: 30, p: 0, fontSize: '0.7rem' }}>
                                  4
                                </TableCell>
                                <TableCell align="right" sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold', width: 30, maxWidth: 30, p: 0, fontSize: '0.7rem' }}>
                                  5
                                </TableCell>
                                <TableCell align="right" sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold', width: 30, maxWidth: 30, p: 0, fontSize: '0.7rem' }}>
                                  6
                                </TableCell>
                                <TableCell align="right" sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold', width: 30, maxWidth: 30, p: 0, fontSize: '0.7rem' }}>
                                  7
                                </TableCell>
                                <TableCell align="right" sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold', width: 30, maxWidth: 30, p: 0, fontSize: '0.7rem' }}>
                                  8
                                </TableCell>
                                <TableCell align="right" sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold', width: 30, maxWidth: 30, p: 0, fontSize: '0.7rem' }}>
                                  9
                                </TableCell>
                                <TableCell align="right" sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold', width: 30, maxWidth: 30, p: 0, fontSize: '0.7rem' }}>
                                  10
                                </TableCell>
                                <TableCell align="right" sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold', width: 30, maxWidth: 30, p: 0, fontSize: '0.7rem' }}>
                                  11
                                </TableCell>
                                <TableCell align="right" sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold', width: 30, maxWidth: 30, p: 0, fontSize: '0.7rem' }}>
                                  12
                                </TableCell>
                                <TableCell align="right" sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold', width: 50, maxWidth: 50, p: 0.25, fontSize: '0.75rem' }}>
                                  Deuda
                                </TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {deudaGlobalData.map((item) => (
                                <TableRow key={item.id} hover>
                                  {tipoMonto === 'seleccionar' && (
                                    <TableCell sx={{ p: 0.25 }}>
                                      <Checkbox
                                        size="small"
                                        checked={selectedRows.includes(item.id)}
                                        onChange={() => handleRowSelection(item.id)}
                                        sx={{ p: 0 }}
                                      />
                                    </TableCell>
                                  )}
                                  <TableCell sx={{ p: 0.25, fontSize: '0.7rem' }}>{item.año}</TableCell>
                                  <TableCell sx={{ p: 0, pl: 0.25, fontSize: '0.7rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.titulo}</TableCell>
                                  <TableCell align="right" sx={{ 
                                    p: 0, 
                                    fontSize: '0.65rem',
                                    background: getCellColor(item.id, 'mes1', item.mes1),
                                    color: getCellColor(item.id, 'mes1', item.mes1) !== 'transparent' ? 'white' : 'inherit'
                                  }}>
                                    {item.mes1 > 0 ? item.mes1.toFixed(2) : '-'}
                                  </TableCell>
                                  <TableCell align="right" sx={{ 
                                    p: 0, 
                                    fontSize: '0.65rem',
                                    background: getCellColor(item.id, 'mes2', item.mes2),
                                    color: getCellColor(item.id, 'mes2', item.mes2) !== 'transparent' ? 'white' : 'inherit'
                                  }}>
                                    {item.mes2 > 0 ? item.mes2.toFixed(2) : '-'}
                                  </TableCell>
                                  <TableCell align="right" sx={{ 
                                    p: 0, 
                                    fontSize: '0.65rem',
                                    background: getCellColor(item.id, 'mes3', item.mes3),
                                    color: getCellColor(item.id, 'mes3', item.mes3) !== 'transparent' ? 'white' : 'inherit'
                                  }}>
                                    {item.mes3 > 0 ? item.mes3.toFixed(2) : '-'}
                                  </TableCell>
                                  <TableCell align="right" sx={{ 
                                    p: 0, 
                                    fontSize: '0.65rem',
                                    background: getCellColor(item.id, 'mes4', item.mes4),
                                    color: getCellColor(item.id, 'mes4', item.mes4) !== 'transparent' ? 'white' : 'inherit'
                                  }}>
                                    {item.mes4 > 0 ? item.mes4.toFixed(2) : '-'}
                                  </TableCell>
                                  <TableCell align="right" sx={{ 
                                    p: 0, 
                                    fontSize: '0.65rem',
                                    background: getCellColor(item.id, 'mes5', item.mes5),
                                    color: getCellColor(item.id, 'mes5', item.mes5) !== 'transparent' ? 'white' : 'inherit'
                                  }}>
                                    {item.mes5 > 0 ? item.mes5.toFixed(2) : '-'}
                                  </TableCell>
                                  <TableCell align="right" sx={{ 
                                    p: 0, 
                                    fontSize: '0.65rem',
                                    background: getCellColor(item.id, 'mes6', item.mes6),
                                    color: getCellColor(item.id, 'mes6', item.mes6) !== 'transparent' ? 'white' : 'inherit'
                                  }}>
                                    {item.mes6 > 0 ? item.mes6.toFixed(2) : '-'}
                                  </TableCell>
                                  <TableCell align="right" sx={{ 
                                    p: 0, 
                                    fontSize: '0.65rem',
                                    background: getCellColor(item.id, 'mes7', item.mes7),
                                    color: getCellColor(item.id, 'mes7', item.mes7) !== 'transparent' ? 'white' : 'inherit'
                                  }}>
                                    {item.mes7 > 0 ? item.mes7.toFixed(2) : '-'}
                                  </TableCell>
                                  <TableCell align="right" sx={{ 
                                    p: 0, 
                                    fontSize: '0.65rem',
                                    background: getCellColor(item.id, 'mes8', item.mes8),
                                    color: getCellColor(item.id, 'mes8', item.mes8) !== 'transparent' ? 'white' : 'inherit'
                                  }}>
                                    {item.mes8 > 0 ? item.mes8.toFixed(2) : '-'}
                                  </TableCell>
                                  <TableCell align="right" sx={{ 
                                    p: 0, 
                                    fontSize: '0.65rem',
                                    background: getCellColor(item.id, 'mes9', item.mes9),
                                    color: getCellColor(item.id, 'mes9', item.mes9) !== 'transparent' ? 'white' : 'inherit'
                                  }}>
                                    {item.mes9 > 0 ? item.mes9.toFixed(2) : '-'}
                                  </TableCell>
                                  <TableCell align="right" sx={{ 
                                    p: 0, 
                                    fontSize: '0.65rem',
                                    background: getCellColor(item.id, 'mes10', item.mes10),
                                    color: getCellColor(item.id, 'mes10', item.mes10) !== 'transparent' ? 'white' : 'inherit'
                                  }}>
                                    {item.mes10 > 0 ? item.mes10.toFixed(2) : '-'}
                                  </TableCell>
                                  <TableCell align="right" sx={{ 
                                    p: 0, 
                                    fontSize: '0.65rem',
                                    background: getCellColor(item.id, 'mes11', item.mes11),
                                    color: getCellColor(item.id, 'mes11', item.mes11) !== 'transparent' ? 'white' : 'inherit'
                                  }}>
                                    {item.mes11 > 0 ? item.mes11.toFixed(2) : '-'}
                                  </TableCell>
                                  <TableCell align="right" sx={{ 
                                    p: 0, 
                                    fontSize: '0.65rem',
                                    background: getCellColor(item.id, 'mes12', item.mes12),
                                    color: getCellColor(item.id, 'mes12', item.mes12) !== 'transparent' ? 'white' : 'inherit'
                                  }}>
                                    {item.mes12 > 0 ? item.mes12.toFixed(2) : '-'}
                                  </TableCell>
                                  <TableCell align="right" sx={{ p: 0.25, fontSize: '0.7rem', fontWeight: 'bold' }}>
                                    S/. {item.deuda.toFixed(2)}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Box>

                      {/* TextField Deuda Ordinaria Total */}
                      <Box sx={{ flex: '0 1 200px', minWidth: '200px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                          Deuda Ordinaria
                        </Typography>
                        <TextField
                          value={`S/. ${calcularDeudaGlobalTotal().toFixed(2)}`}
                          size="small"
                          fullWidth
                          disabled
                          sx={{ 
                            '& .MuiInputBase-root': {
                              backgroundColor: 'primary.main',
                              color: 'white',
                            },
                            '& .MuiInputBase-input.Mui-disabled': {
                              WebkitTextFillColor: 'white',
                              color: 'white',
                              fontWeight: 'bold'
                            },
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'primary.dark',
                            }
                          }}
                        />
                      </Box>
                    </Box>
                  )}
                  {/* tabs Deuda Fraccionamiento */}
                  {deudaTabValue === 2 && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%', overflow: 'hidden' }}>
                      {/* Contenedor de las tres tablas */}
                      <Box sx={{ display: 'flex', gap: 0, height: '160px', overflow: 'hidden' }}>
                        {/* Primera tabla: Año y Res */}
                        <TableContainer 
                          component={Paper} 
                          variant="outlined"
                          sx={{
                            width: '120px',
                            minWidth: '120px',
                            maxHeight: '160px',
                            borderRadius: 0,
                            borderRight: 0,
                            overflowY: 'auto',
                            overflowX: 'hidden',
                            '&::-webkit-scrollbar': {
                              width: '8px',
                            },
                            '&::-webkit-scrollbar-track': {
                              backgroundColor: '#f1f1f1',
                            },
                            '&::-webkit-scrollbar-thumb': {
                              backgroundColor: '#888',
                              borderRadius: '4px',
                              '&:hover': {
                                backgroundColor: '#555',
                              },
                            },
                          }}
                        >
                          <Table size="small" stickyHeader>
                            <TableHead>
                              <TableRow>
                                <TableCell sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold', width: '60px', fontSize: '0.75rem' }}>
                                  Año
                                </TableCell>
                                <TableCell sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold', width: '60px', fontSize: '0.75rem' }}>
                                  Res
                                </TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {resolucionesFraccionamiento.map((item, index) => (
                                <TableRow key={index}>
                                  <TableCell 
                                    sx={{ 
                                      fontSize: '0.7rem', 
                                      cursor: 'pointer',
                                      backgroundColor: selectedAño === item.año ? 'primary.main' : 'transparent',
                                      color: selectedAño === item.año ? 'white' : 'inherit',
                                      '&:hover': {
                                        backgroundColor: selectedAño === item.año ? 'primary.dark' : 'primary.light',
                                        color: 'white'
                                      }
                                    }}
                                    onClick={() => handleAñoClick(item.año)}
                                  >
                                    {item.año}
                                  </TableCell>
                                  <TableCell sx={{ fontSize: '0.7rem' }}>
                                    {item.resolucion}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>

                        {/* Segunda tabla: Check, N°Cuota, Deuda, IM, Cuota, F.Venc */}
                        <TableContainer 
                          component={Paper} 
                          variant="outlined"
                          sx={{
                            width: '350px',
                            minWidth: '350px',
                            maxHeight: '160px',
                            borderRadius: 0,
                            borderRight: 0,
                            overflowY: 'auto',
                            overflowX: 'hidden',
                            '&::-webkit-scrollbar': {
                              width: '8px',
                            },
                            '&::-webkit-scrollbar-track': {
                              backgroundColor: '#f1f1f1',
                            },
                            '&::-webkit-scrollbar-thumb': {
                              backgroundColor: '#888',
                              borderRadius: '4px',
                              '&:hover': {
                                backgroundColor: '#555',
                              },
                            },
                          }}
                        >
                          <Table size="small" stickyHeader>
                            <TableHead>
                              <TableRow>
                                <TableCell sx={{ backgroundColor: '#f5f5f5', width: '30px', p: 0.5 }}>
                                  {/* Check header */}
                                </TableCell>
                                <TableCell sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold', fontSize: '0.75rem' }}>
                                  N°Cuota
                                </TableCell>
                                <TableCell align="right" sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold', fontSize: '0.75rem' }}>
                                  Deuda
                                </TableCell>
                                <TableCell align="right" sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold', fontSize: '0.75rem' }}>
                                  IM
                                </TableCell>
                                <TableCell align="right" sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold', fontSize: '0.75rem' }}>
                                  Cuota
                                </TableCell>
                                <TableCell sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold', fontSize: '0.75rem' }}>
                                  F.Venc.
                                </TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {cuotasFraccionamiento.length > 0 ? cuotasFraccionamiento.map((cuota) => (
                                <TableRow key={cuota.nCuota}>
                                  <TableCell sx={{ p: 0.5 }}>
                                    <Checkbox
                                      size="small"
                                      checked={cuota.checked}
                                      onChange={() => handleCuotaCheck(cuota.nCuota)}
                                      sx={{ p: 0 }}
                                    />
                                  </TableCell>
                                  <TableCell sx={{ fontSize: '0.7rem' }}>
                                    {cuota.nCuota}
                                  </TableCell>
                                  <TableCell align="right" sx={{ fontSize: '0.7rem' }}>
                                    {cuota.deuda.toFixed(2)}
                                  </TableCell>
                                  <TableCell align="right" sx={{ fontSize: '0.7rem' }}>
                                    {cuota.im.toFixed(2)}
                                  </TableCell>
                                  <TableCell align="right" sx={{ fontSize: '0.7rem' }}>
                                    {cuota.cuota.toFixed(2)}
                                  </TableCell>
                                  <TableCell sx={{ fontSize: '0.7rem' }}>
                                    {cuota.fVenc}
                                  </TableCell>
                                </TableRow>
                              )) : (
                                <TableRow>
                                  <TableCell colSpan={6} align="center" sx={{ fontSize: '0.7rem', color: 'text.secondary', py: 2 }}>
                                    Seleccione un año para ver las cuotas
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </TableContainer>

                        {/* Tercera tabla: Tributo y columnas 1-12 con scroll horizontal */}
                        <Box sx={{ flex: 1, display: 'flex', maxHeight: '160px', overflow: 'hidden', border: '1px solid #e0e0e0', borderRadius: 0 }}>
                          <TableContainer 
                            component={Paper} 
                            elevation={0}
                            sx={{
                              flex: 1,
                              maxHeight: '160px',
                              overflowX: 'auto',
                              overflowY: 'auto',
                              '&::-webkit-scrollbar': {
                                height: '8px',
                                width: '8px',
                              },
                              '&::-webkit-scrollbar-track': {
                                backgroundColor: '#f1f1f1',
                              },
                              '&::-webkit-scrollbar-thumb': {
                                backgroundColor: '#888',
                                borderRadius: '4px',
                                '&:hover': {
                                  backgroundColor: '#555',
                                },
                              },
                            }}
                          >
                            <Table size="small" stickyHeader>
                              <TableHead>
                                <TableRow>
                                  <TableCell 
                                    sx={{ 
                                      backgroundColor: '#f5f5f5', 
                                      fontWeight: 'bold', 
                                      fontSize: '0.75rem',
                                      position: 'sticky',
                                      left: 0,
                                      zIndex: 3,
                                      borderRight: '1px solid #e0e0e0'
                                    }}
                                  >
                                    Tributo
                                  </TableCell>
                                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((mes) => (
                                    <TableCell 
                                      key={mes}
                                      align="right" 
                                      sx={{ 
                                        backgroundColor: '#f5f5f5', 
                                        fontWeight: 'bold', 
                                        fontSize: '0.7rem',
                                        minWidth: '45px'
                                      }}
                                    >
                                      {mes}
                                    </TableCell>
                                  ))}
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {(tributosFraccionados.length > 0 ? tributosFraccionados : tributosFraccionadosBase).map((row, index) => (
                                  <TableRow key={index}>
                                    <TableCell 
                                      sx={{ 
                                        fontSize: '0.7rem',
                                        position: 'sticky',
                                        left: 0,
                                        backgroundColor: 'white',
                                        zIndex: 2,
                                        borderRight: '1px solid #e0e0e0'
                                      }}
                                    >
                                      {row.tributo}
                                    </TableCell>
                                    {row.valores.map((valor, mesIndex) => (
                                      <TableCell 
                                        key={mesIndex}
                                        align="right" 
                                        sx={{ 
                                          fontSize: '0.65rem',
                                          minWidth: '45px',
                                          background: getCellColorFraccionamiento(index, mesIndex),
                                          color: getCellColorFraccionamiento(index, mesIndex) !== 'transparent' ? 'white' : 'inherit'
                                        }}
                                      >
                                        {valor > 0 ? valor.toFixed(2) : '-'}
                                      </TableCell>
                                    ))}
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </Box>
                      </Box>

                      {/* TextField Deuda Fraccionada */}
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2, mt: 1 }}>
                        <Typography variant="subtitle2" fontWeight="bold">
                          Deuda Fraccionada:
                        </Typography>
                        <TextField
                          value={montoFraccionado || 'S/. 0.00'}
                          size="small"
                          disabled
                          sx={{ 
                            width: '150px',
                            '& .MuiInputBase-root': {
                              backgroundColor: 'primary.main',
                              color: 'white',
                            },
                            '& .MuiInputBase-input.Mui-disabled': {
                              WebkitTextFillColor: 'white',
                              color: 'white',
                              fontWeight: 'bold'
                            },
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'primary.dark',
                            }
                          }}
                        />
                      </Box>
                    </Box>
                  )}
                  {/* tabs Deuda Coactiva */}
                  {deudaTabValue === 3 && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%', overflow: 'hidden' }}>
                      {/* Contenedor de las tres tablas */}
                      <Box sx={{ display: 'flex', gap: 0, maxHeight: '160px', overflow: 'hidden' }}>
                        {/* Primera tabla: Año Expediente y N° Expediente */}
                        <TableContainer 
                          component={Paper} 
                          variant="outlined"
                          sx={{
                            width: '180px',
                            minWidth: '180px',
                            maxHeight: '160px',
                            borderRadius: 0,
                            borderRight: 0,
                            overflowY: 'auto',
                            overflowX: 'hidden',
                            '&::-webkit-scrollbar': {
                              width: '8px',
                            },
                            '&::-webkit-scrollbar-track': {
                              backgroundColor: '#f1f1f1',
                            },
                            '&::-webkit-scrollbar-thumb': {
                              backgroundColor: '#888',
                              borderRadius: '4px',
                              '&:hover': {
                                backgroundColor: '#555',
                              },
                            },
                          }}
                        >
                          <Table size="small" stickyHeader>
                            <TableHead>
                              <TableRow>
                                <TableCell sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold', width: '90px', fontSize: '0.75rem' }}>
                                  Año Expediente
                                </TableCell>
                                <TableCell sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold', width: '90px', fontSize: '0.75rem' }}>
                                  N° Expediente
                                </TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {expedientesCoactivos.map((expediente, index) => (
                                <TableRow key={index}>
                                  <TableCell 
                                    sx={{ 
                                      fontSize: '0.7rem', 
                                      cursor: 'pointer',
                                      backgroundColor: selectedExpediente === expediente.añoExpediente ? 'primary.main' : 'transparent',
                                      color: selectedExpediente === expediente.añoExpediente ? 'white' : 'inherit',
                                      '&:hover': {
                                        backgroundColor: selectedExpediente === expediente.añoExpediente ? 'primary.dark' : 'primary.light',
                                        color: 'white'
                                      }
                                    }}
                                    onClick={() => handleExpedienteClick(expediente.añoExpediente)}
                                  >
                                    {expediente.añoExpediente}
                                  </TableCell>
                                  <TableCell sx={{ fontSize: '0.7rem' }}>
                                    {expediente.nroExpediente}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>

                        {/* Segunda tabla: Años */}
                        <TableContainer 
                          component={Paper} 
                          variant="outlined"
                          sx={{
                            width: '100px',
                            minWidth: '100px',
                            maxHeight: '160px',
                            borderRadius: 0,
                            borderRight: 0,
                            overflowY: 'auto',
                            overflowX: 'hidden',
                            '&::-webkit-scrollbar': {
                              width: '8px',
                            },
                            '&::-webkit-scrollbar-track': {
                              backgroundColor: '#f1f1f1',
                            },
                            '&::-webkit-scrollbar-thumb': {
                              backgroundColor: '#888',
                              borderRadius: '4px',
                              '&:hover': {
                                backgroundColor: '#555',
                              },
                            },
                          }}
                        >
                          <Table size="small" stickyHeader>
                            <TableHead>
                              <TableRow>
                                <TableCell sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold', fontSize: '0.75rem' }}>
                                  Año
                                </TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {añosCoactivos.length > 0 ? añosCoactivos.map((añoData) => (
                                <TableRow key={añoData.año}>
                                  <TableCell 
                                    sx={{ 
                                      fontSize: '0.7rem', 
                                      cursor: 'pointer',
                                      backgroundColor: selectedAñoCoactivo === añoData.año ? 'primary.main' : 'transparent',
                                      color: selectedAñoCoactivo === añoData.año ? 'white' : 'inherit',
                                      '&:hover': {
                                        backgroundColor: selectedAñoCoactivo === añoData.año ? 'primary.dark' : 'primary.light',
                                        color: 'white'
                                      }
                                    }}
                                    onClick={() => handleAñoCoactivoClick(añoData.año)}
                                  >
                                    {añoData.año}
                                  </TableCell>
                                </TableRow>
                              )) : (
                                <TableRow>
                                  <TableCell align="center" sx={{ fontSize: '0.7rem', color: 'text.secondary', py: 2 }}>
                                    Seleccione expediente
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </TableContainer>

                        {/* Tercera tabla: Tributos con check y columnas 1-12 con scroll horizontal */}
                        <Box sx={{ flex: 1, display: 'flex', maxHeight: '160px', overflow: 'hidden', border: '1px solid #e0e0e0', borderRadius: 0 }}>
                          <TableContainer 
                            component={Paper} 
                            elevation={0}
                            sx={{
                              flex: 1,
                              maxHeight: '160px',
                              overflowX: 'auto',
                              overflowY: 'auto',
                              '&::-webkit-scrollbar': {
                                height: '8px',
                                width: '8px',
                              },
                              '&::-webkit-scrollbar-track': {
                                backgroundColor: '#f1f1f1',
                              },
                              '&::-webkit-scrollbar-thumb': {
                                backgroundColor: '#888',
                                borderRadius: '4px',
                                '&:hover': {
                                  backgroundColor: '#555',
                                },
                              },
                            }}
                          >
                            <Table size="small" stickyHeader>
                              <TableHead>
                                <TableRow>
                                  {tributosCoactivos.length > 0 && (
                                    <TableCell 
                                      sx={{ 
                                        backgroundColor: '#f5f5f5', 
                                        fontWeight: 'bold', 
                                        fontSize: '0.75rem',
                                        position: 'sticky',
                                        left: 0,
                                        zIndex: 3,
                                        borderRight: '1px solid #e0e0e0',
                                        width: '30px'
                                      }}
                                    >
                                      {/* Check header */}
                                    </TableCell>
                                  )}
                                  <TableCell 
                                    sx={{ 
                                      backgroundColor: '#f5f5f5', 
                                      fontWeight: 'bold', 
                                      fontSize: '0.75rem',
                                      position: 'sticky',
                                      left: tributosCoactivos.length > 0 ? '30px' : 0,
                                      zIndex: 3,
                                      borderRight: '1px solid #e0e0e0'
                                    }}
                                  >
                                    Tributo
                                  </TableCell>
                                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((mes) => (
                                    <TableCell 
                                      key={mes}
                                      align="right" 
                                      sx={{ 
                                        backgroundColor: '#f5f5f5', 
                                        fontWeight: 'bold', 
                                        fontSize: '0.7rem',
                                        minWidth: '45px'
                                      }}
                                    >
                                      {mes}
                                    </TableCell>
                                  ))}
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {tributosCoactivos.length > 0 ? tributosCoactivos.map((tributo, index) => (
                                  <TableRow key={index}>
                                    <TableCell 
                                      sx={{ 
                                        position: 'sticky',
                                        left: 0,
                                        backgroundColor: 'white',
                                        zIndex: 2,
                                        borderRight: '1px solid #e0e0e0',
                                        p: 0.5,
                                        width: '30px'
                                      }}
                                    >
                                      <Checkbox
                                        size="small"
                                        checked={tributo.checked}
                                        onChange={() => handleTributoCoactivoCheck(index)}
                                        sx={{ p: 0 }}
                                      />
                                    </TableCell>
                                    <TableCell 
                                      sx={{ 
                                        fontSize: '0.7rem',
                                        position: 'sticky',
                                        left: '30px',
                                        backgroundColor: 'white',
                                        zIndex: 2,
                                        borderRight: '1px solid #e0e0e0'
                                      }}
                                    >
                                      {tributo.tributo}
                                    </TableCell>
                                    {tributo.valores.map((valor, mesIndex) => (
                                      <TableCell 
                                        key={mesIndex}
                                        align="right" 
                                        sx={{ 
                                          fontSize: '0.65rem',
                                          minWidth: '45px',
                                          background: getCellColorCoactivo(index, mesIndex),
                                          color: getCellColorCoactivo(index, mesIndex) !== 'transparent' ? 'white' : 'inherit'
                                        }}
                                      >
                                        {valor > 0 ? valor.toFixed(2) : '-'}
                                      </TableCell>
                                    ))}
                                  </TableRow>
                                )) : (
                                  <TableRow>
                                    <TableCell colSpan={14} align="center" sx={{ fontSize: '0.7rem', color: 'text.secondary', py: 2 }}>
                                      Seleccione un año para ver los tributos
                                    </TableCell>
                                  </TableRow>
                                )}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </Box>
                      </Box>

                      {/* TextField Deuda Coactiva */}
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2, mt: 1 }}>
                        <Typography variant="subtitle2" fontWeight="bold">
                          Deuda Coactiva:
                        </Typography>
                        <TextField
                          value={montoCoactivo || 'S/. 0.00'}
                          size="small"
                          disabled
                          sx={{ 
                            width: '150px',
                            '& .MuiInputBase-root': {
                              backgroundColor: 'primary.main',
                              color: 'white',
                            },
                            '& .MuiInputBase-input.Mui-disabled': {
                              WebkitTextFillColor: 'white',
                              color: 'white',
                              fontWeight: 'bold'
                            },
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'primary.dark',
                            }
                          }}
                        />
                      </Box>
                    </Box>
                  )}
                </Box>
              </Paper>
            </Box>
          ) : (
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                No hay datos de contribuyente disponibles
              </Typography>
            </Box>
          )}
        </ContentBox>
      </DialogContent>

      {/* Actions */}

    </StyledDialog>
  );
};

export default DeudaContribuyente;
export type { DatosPagoDeudaOrdinaria, ConceptoPago };
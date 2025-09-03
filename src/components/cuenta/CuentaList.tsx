// src/components/cuenta/CuentaList.tsx
import React, { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Typography, 
  Box, 
  Card, 
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  TextField,
  Button
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';

// Interfaces para los datos
interface EstadoCuentaAnual {
  anio: number;
  fc: number;
  arbitrios: number;
  licFunc: number;
  obras: number;
  predios: number;
  intArbi: number;
  intPred: number;
  interes: number;
  total: number;
  pagado: number;
  saldo: number;
}

interface DetalleConcepto {
  grupo: string;
  tributo: string;
  concepto: string;
  col1: number;
  col2: number;
  col3: number;
  col4: number;
  col5: number;
  col6: number;
  col7: number;
}

interface CuentaListProps {
  contribuyenteId?: number;
  predioId?: number;
  loading?: boolean;
  error?: string;
}

const CuentaList: React.FC<CuentaListProps> = ({ 
  contribuyenteId, 
  predioId, 
  loading = false, 
  error 
}) => {
  // Estados
  const [estadoCuentaAnual, setEstadoCuentaAnual] = useState<EstadoCuentaAnual[]>([]);
  const [detalleConceptos, setDetalleConceptos] = useState<DetalleConcepto[]>([]);
  const [anioSeleccionado, setAnioSeleccionado] = useState<number | null>(null);
  const [deudaSeleccionada, setDeudaSeleccionada] = useState<string>('');
  
  // Estados para búsqueda
  const [contribuyenteSeleccionado, setContribuyenteSeleccionado] = useState<any>(null);
  const [nombreContribuyente, setNombreContribuyente] = useState<string>('');
  const [direccionContribuyente, setDireccionContribuyente] = useState<string>('');
  const [codigoPredio, setCodigoPredio] = useState<string>('');

  // Datos de ejemplo basados en la imagen
  const datosEstadoCuenta: EstadoCuentaAnual[] = [
    {
      anio: 1999,
      fc: 0,
      arbitrios: 0.00,
      licFunc: 2800.00,
      obras: 0.00,
      predios: 7196.04,
      intArbi: 0.00,
      intPred: 0.00,
      interes: 0.00,
      total: 9996.04,
      pagado: 0.00,
      saldo: 9996.04
    },
    {
      anio: 2000,
      fc: 0,
      arbitrios: 0.00,
      licFunc: 0.00,
      obras: 0.00,
      predios: 6764.73,
      intArbi: 0.00,
      intPred: 0.00,
      interes: 0.00,
      total: 6764.73,
      pagado: 0.00,
      saldo: 6764.73
    },
    {
      anio: 2001,
      fc: 0,
      arbitrios: 2295.26,
      licFunc: 0.00,
      obras: 0.00,
      predios: 11390.79,
      intArbi: 0.00,
      intPred: 0.00,
      interes: 0.00,
      total: 13686.05,
      pagado: 0.00,
      saldo: 13686.05
    },
    {
      anio: 2002,
      fc: 0,
      arbitrios: 2133.03,
      licFunc: 0.00,
      obras: 0.00,
      predios: 11218.69,
      intArbi: 0.00,
      intPred: 0.00,
      interes: 0.00,
      total: 13351.72,
      pagado: 0.00,
      saldo: 13351.72
    },
    {
      anio: 2003,
      fc: 0,
      arbitrios: 2090.77,
      licFunc: 0.00,
      obras: 0.00,
      predios: 10361.15,
      intArbi: 0.00,
      intPred: 0.00,
      interes: 0.00,
      total: 12451.92,
      pagado: 0.00,
      saldo: 12451.92
    },
    {
      anio: 2004,
      fc: 0,
      arbitrios: 2106.12,
      licFunc: 0.00,
      obras: 0.00,
      predios: 10775.23,
      intArbi: 0.00,
      intPred: 0.00,
      interes: 0.00,
      total: 12881.35,
      pagado: 0.00,
      saldo: 12881.35
    },
    {
      anio: 2005,
      fc: 0,
      arbitrios: 1583.39,
      licFunc: 0.00,
      obras: 0.00,
      predios: 9056.51,
      intArbi: 0.00,
      intPred: 0.00,
      interes: 0.00,
      total: 10739.90,
      pagado: 0.00,
      saldo: 10739.90
    },
    {
      anio: 2006,
      fc: 0,
      arbitrios: 1760.75,
      licFunc: 0.00,
      obras: 0.00,
      predios: 9206.26,
      intArbi: 0.00,
      intPred: 0.00,
      interes: 0.00,
      total: 10967.01,
      pagado: 0.00,
      saldo: 10967.01
    },
    {
      anio: 2007,
      fc: 0,
      arbitrios: 1978.48,
      licFunc: 0.00,
      obras: 0.00,
      predios: 11553.12,
      intArbi: 0.00,
      intPred: 0.00,
      interes: 0.00,
      total: 13531.60,
      pagado: 12357.76,
      saldo: 1173.84
    }
  ];

  const datosDetalleConceptos: DetalleConcepto[] = [
    {
      grupo: 'Arbitrios',
      tributo: 'Limpieza Pública',
      concepto: 'Cargo',
      col1: 146.73,
      col2: 146.73,
      col3: 146.73,
      col4: 146.73,
      col5: 146.73,
      col6: 146.73,
      col7: 0
    },
    {
      grupo: 'Arbitrios',
      tributo: 'Limpieza Pública',
      concepto: 'Abonos',
      col1: 0.00,
      col2: 0.00,
      col3: 0.00,
      col4: 0.00,
      col5: 0.00,
      col6: 0.00,
      col7: 0
    },
    {
      grupo: 'Arbitrios',
      tributo: 'Limpieza Pública',
      concepto: 'Fecha Abono',
      col1: 0,
      col2: 0,
      col3: 0,
      col4: 0,
      col5: 0,
      col6: 0,
      col7: 0
    },
    {
      grupo: 'Arbitrios',
      tributo: 'Parques y Jardines',
      concepto: 'Cargo',
      col1: 0.00,
      col2: 0.00,
      col3: 0.00,
      col4: 0.00,
      col5: 0.00,
      col6: 0.00,
      col7: 0
    },
    {
      grupo: 'Arbitrios',
      tributo: 'Parques y Jardines',
      concepto: 'Abonos',
      col1: 0.00,
      col2: 0.00,
      col3: 0.00,
      col4: 0.00,
      col5: 0.00,
      col6: 0.00,
      col7: 0
    },
    {
      grupo: 'Arbitrios',
      tributo: 'Parques y Jardines',
      concepto: 'Fecha Abono',
      col1: 0,
      col2: 0,
      col3: 0,
      col4: 0,
      col5: 0,
      col6: 0,
      col7: 0
    },
    {
      grupo: 'Arbitrios',
      tributo: 'Reajuste Limpieza Pública',
      concepto: 'Cargo',
      col1: 0.02,
      col2: 0.51,
      col3: 1.18,
      col4: 1.52,
      col5: 2.45,
      col6: 3.37,
      col7: 0
    },
    {
      grupo: 'Arbitrios',
      tributo: 'Reajuste Limpieza Pública',
      concepto: 'Abonos',
      col1: 0.02,
      col2: 0.51,
      col3: 1.18,
      col4: 1.52,
      col5: 2.45,
      col6: 3.37,
      col7: 0
    },
    {
      grupo: 'Arbitrios',
      tributo: 'Reajuste Limpieza Pública',
      concepto: 'Fecha Abono',
      col1: 18012008,
      col2: 18012008,
      col3: 18012008,
      col4: 18012008,
      col5: 18012008,
      col6: 18012008,
      col7: 18012008
    },
    {
      grupo: 'Obras',
      tributo: 'Contrib. Obras Púb.',
      concepto: 'Cargo',
      col1: 0.00,
      col2: 0.00,
      col3: 0.00,
      col4: 0.00,
      col5: 0.00,
      col6: 0.00,
      col7: 0
    },
    {
      grupo: 'Obras',
      tributo: 'Contrib. Obras Púb.',
      concepto: 'Abonos',
      col1: 0.00,
      col2: 0.00,
      col3: 0.00,
      col4: 0.00,
      col5: 0.00,
      col6: 0.00,
      col7: 0
    }
  ];

  useEffect(() => {
    setEstadoCuentaAnual(datosEstadoCuenta);
    setDetalleConceptos(datosDetalleConceptos);
    // Establecer 2007 como año seleccionado por defecto
    setAnioSeleccionado(2007);
    setDeudaSeleccionada('LIMPIEZA PÚBLICA->2018');
  }, []);

  // Función para manejar clic en fila de estado de cuenta
  const handleFilaClick = (anio: number) => {
    setAnioSeleccionado(anio);
    // Aquí podrías cargar los detalles específicos del año seleccionado
    console.log(`Año seleccionado: ${anio}`);
  };

  // Función para buscar cuenta corriente
  const handleBuscarCuenta = () => {
    if (!contribuyenteSeleccionado) {
      alert('Por favor seleccione un contribuyente');
      return;
    }
    // Aquí implementar la lógica de búsqueda
    console.log('Buscando cuenta corriente para:', {
      contribuyente: contribuyenteSeleccionado,
      predio: codigoPredio
    });
  };

  // Función para abrir selector de contribuyente
  const handleSelectorContribuyente = () => {
    // Aquí implementar la lógica para abrir el modal de selección
    console.log('Abriendo selector de contribuyente');
  };

  // Función para formatear números
  const formatearNumero = (numero: number): string => {
    return numero.toFixed(2);
  };

  // Función para formatear fechas
  const formatearFecha = (fecha: number): string => {
    if (fecha === 0) return '';
    const fechaStr = fecha.toString();
    if (fechaStr.length === 8) {
      return `${fechaStr.substring(0, 2)}/${fechaStr.substring(2, 4)}/${fechaStr.substring(4, 8)}`;
    }
    return fechaStr;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Sección de Búsqueda */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" component="h2" gutterBottom>
            Búsqueda de Cuenta Corriente
          </Typography>
          
          <Box 
            sx={{ 
              display: 'flex', 
              flexWrap: 'wrap',
              gap: 2,
              alignItems: 'center'
            }}
          >
            <Box sx={{ flex: '0 0 200px' }}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<PersonSearchIcon />}
                onClick={handleSelectorContribuyente}
                sx={{ height: '33px' }}
              >
                Seleccionar Contribuyente
              </Button>
            </Box>
            
            <Box sx={{ flex: '1 1 250px',minWidth: '250px' }}>
              <TextField
                fullWidth
                label="Nombre del Contribuyente"
                value={nombreContribuyente}
                
                disabled
                variant="outlined"
                InputProps={{
                  readOnly: true,
                }}
              />
            </Box>
            
            <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
              <TextField
                fullWidth
                label="Dirección del Contribuyente"
                value={direccionContribuyente}
                disabled
                variant="outlined"
                InputProps={{
                  readOnly: true,
                }}
              />
            </Box>
            
            <Box sx={{ flex: '0 0 180px' }}>
              <TextField
                fullWidth
                label="Predio"
                value={codigoPredio}
                disabled
                variant="outlined"
                InputProps={{
                  readOnly: true,
                }}
              />
            </Box>
            
            <Box sx={{ flex: '0 0 120px' }}>
              <Button
                variant="contained"
                fullWidth
                startIcon={<SearchIcon />}
                onClick={handleBuscarCuenta}
                sx={{ height: '33px' }}
                color="primary"
              >
                Buscar
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Tabla de Estado de Cuenta Anual */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" component="h2" gutterBottom>
            ESTADO DE CUENTA
          </Typography>
          
          <TableContainer component={Paper} elevation={0}>
            <Table size="small" sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell><strong>Año</strong></TableCell>
                  <TableCell align="center"><strong>FC</strong></TableCell>
                  <TableCell align="right"><strong>Arbitrios</strong></TableCell>
                  <TableCell align="right"><strong>LicFunc</strong></TableCell>
                  <TableCell align="right"><strong>Obras</strong></TableCell>
                  <TableCell align="right"><strong>Predios</strong></TableCell>
                  <TableCell align="right"><strong>IntArbi</strong></TableCell>
                  <TableCell align="right"><strong>IntPred</strong></TableCell>
                  <TableCell align="right"><strong>Interes</strong></TableCell>
                  <TableCell align="right"><strong>Total</strong></TableCell>
                  <TableCell align="right"><strong>Pagado</strong></TableCell>
                  <TableCell align="right"><strong>Saldo</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {estadoCuentaAnual.map((fila) => (
                  <TableRow 
                    key={fila.anio}
                    onClick={() => handleFilaClick(fila.anio)}
                    sx={{ 
                      cursor: 'pointer',
                      backgroundColor: anioSeleccionado === fila.anio ? '#e3f2fd' : 'inherit',
                      '&:hover': { 
                        backgroundColor: anioSeleccionado === fila.anio ? '#e3f2fd' : '#f5f5f5' 
                      }
                    }}
                  >
                    <TableCell>
                      <strong>{fila.anio}</strong>
                      {fila.anio === 2007 && anioSeleccionado === fila.anio && (
                        <Chip 
                          label="Seleccionado" 
                          size="small" 
                          color="primary" 
                          sx={{ ml: 1 }}
                        />
                      )}
                    </TableCell>
                    <TableCell align="center">{fila.fc}</TableCell>
                    <TableCell 
                      align="right" 
                      sx={{ 
                        color: fila.arbitrios > 0 ? '#000' : '#666',
                        fontWeight: fila.arbitrios > 0 ? 'bold' : 'normal'
                      }}
                    >
                      {formatearNumero(fila.arbitrios)}
                    </TableCell>
                    <TableCell 
                      align="right"
                      sx={{ 
                        color: fila.licFunc > 0 ? '#1976d2' : '#666',
                        fontWeight: fila.licFunc > 0 ? 'bold' : 'normal'
                      }}
                    >
                      {formatearNumero(fila.licFunc)}
                    </TableCell>
                    <TableCell align="right">{formatearNumero(fila.obras)}</TableCell>
                    <TableCell 
                      align="right"
                      sx={{ 
                        color: '#000',
                        fontWeight: 'bold'
                      }}
                    >
                      {formatearNumero(fila.predios)}
                    </TableCell>
                    <TableCell align="right">{formatearNumero(fila.intArbi)}</TableCell>
                    <TableCell align="right">{formatearNumero(fila.intPred)}</TableCell>
                    <TableCell align="right">{formatearNumero(fila.interes)}</TableCell>
                    <TableCell 
                      align="right"
                      sx={{ 
                        backgroundColor: '#fff3e0',
                        fontWeight: 'bold',
                        color: '#e65100'
                      }}
                    >
                      {formatearNumero(fila.total)}
                    </TableCell>
                    <TableCell 
                      align="right"
                      sx={{ 
                        color: fila.pagado > 0 ? '#4caf50' : '#666',
                        fontWeight: fila.pagado > 0 ? 'bold' : 'normal'
                      }}
                    >
                      {formatearNumero(fila.pagado)}
                    </TableCell>
                    <TableCell 
                      align="right"
                      sx={{ 
                        backgroundColor: fila.saldo > 0 ? '#ffebee' : '#e8f5e8',
                        color: fila.saldo > 0 ? '#d32f2f' : '#2e7d32',
                        fontWeight: 'bold'
                      }}
                    >
                      {formatearNumero(fila.saldo)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Información adicional */}
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="error">
              Negativo en: LIMPIEZA PÚBLICA-&gt;2018
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2">
                Deuda Seleccionada:
              </Typography>
              <Box 
                sx={{ 
                  border: '1px solid #ccc', 
                  padding: '4px 8px', 
                  minWidth: '200px',
                  backgroundColor: '#fff9c4'
                }}
              >
                <Typography variant="body2">
                  {deudaSeleccionada}
                </Typography>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Tabla de Detalle de Conceptos */}
      <Card>
        <CardContent>
          <Typography variant="h6" component="h2" gutterBottom>
            ESTADO DE CUENTA - DETALLE POR CONCEPTOS
            {anioSeleccionado && (
              <Chip 
                label={`Año ${anioSeleccionado}`} 
                color="primary" 
                size="small" 
                sx={{ ml: 2 }}
              />
            )}
          </Typography>
          
          <TableContainer component={Paper} elevation={0}>
            <Table size="small" sx={{ minWidth: 800 }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell rowSpan={2}><strong>Grupo</strong></TableCell>
                  <TableCell rowSpan={2}><strong>Tributo</strong></TableCell>
                  <TableCell rowSpan={2}><strong>Concepto</strong></TableCell>
                  <TableCell align="center" colSpan={7}><strong>Períodos</strong></TableCell>
                </TableRow>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell align="center"><strong>1</strong></TableCell>
                  <TableCell align="center"><strong>2</strong></TableCell>
                  <TableCell align="center"><strong>3</strong></TableCell>
                  <TableCell align="center"><strong>4</strong></TableCell>
                  <TableCell align="center"><strong>5</strong></TableCell>
                  <TableCell align="center"><strong>6</strong></TableCell>
                  <TableCell align="center"><strong>7</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {detalleConceptos.map((detalle, index) => (
                  <TableRow 
                    key={index}
                    sx={{ 
                      '&:hover': { backgroundColor: '#f9f9f9' },
                      backgroundColor: detalle.concepto === 'Cargo' ? '#fff3e0' : 
                                     detalle.concepto === 'Abonos' ? '#e8f5e8' : 'inherit'
                    }}
                  >
                    <TableCell align="center">
                      <strong>{detalle.grupo}</strong>
                    </TableCell>
                    <TableCell align="center">{detalle.tributo}</TableCell>
                    <TableCell align="center">
                      <strong>{detalle.concepto}</strong>
                    </TableCell>
                    <TableCell align="center">
                      {detalle.concepto === 'Fecha Abono' 
                        ? formatearFecha(detalle.col1) 
                        : formatearNumero(detalle.col1)
                      }
                    </TableCell>
                    <TableCell align="center">
                      {detalle.concepto === 'Fecha Abono' 
                        ? formatearFecha(detalle.col2) 
                        : formatearNumero(detalle.col2)
                      }
                    </TableCell>
                    <TableCell align="center">
                      {detalle.concepto === 'Fecha Abono' 
                        ? formatearFecha(detalle.col3) 
                        : formatearNumero(detalle.col3)
                      }
                    </TableCell>
                    <TableCell align="center">
                      {detalle.concepto === 'Fecha Abono' 
                        ? formatearFecha(detalle.col4) 
                        : formatearNumero(detalle.col4)
                      }
                    </TableCell>
                    <TableCell align="center">
                      {detalle.concepto === 'Fecha Abono' 
                        ? formatearFecha(detalle.col5) 
                        : formatearNumero(detalle.col5)
                      }
                    </TableCell>
                    <TableCell align="center">
                      {detalle.concepto === 'Fecha Abono' 
                        ? formatearFecha(detalle.col6) 
                        : formatearNumero(detalle.col6)
                      }
                    </TableCell>
                    <TableCell align="center">
                      {detalle.concepto === 'Fecha Abono' 
                        ? formatearFecha(detalle.col7) 
                        : formatearNumero(detalle.col7)
                      }
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CuentaList;
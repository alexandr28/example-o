// src/components/cuenta/CuentaList.tsx
import React, { useState, useMemo } from 'react';
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
  Button,
  IconButton,
  Collapse
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import SelectorContribuyente from '../modal/SelectorContribuyente';
import { useCuentaCorriente } from '../../hooks/useCuentaCorriente';

// Interfaces locales para el componente
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
  // Hook para gestionar cuenta corriente
  const {
    estadoCuentaAnual,
    loadingEstadoCuenta,
    errorEstadoCuenta,
    estadoCuentaDetalle,
    loadingDetalle,
    errorDetalle,
    cargarEstadoCuenta,
    cargarDetalleEstadoCuenta,
    limpiarTodo
  } = useCuentaCorriente();

  // Estados locales
  const [anioSeleccionado, setAnioSeleccionado] = useState<number | null>(null);
  const [deudaSeleccionada, setDeudaSeleccionada] = useState<string>('');

  // Estados para búsqueda
  const [contribuyenteSeleccionado, setContribuyenteSeleccionado] = useState<any>(null);
  const [codigoContribuyente, setCodigoContribuyente] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Estado para controlar tributos expandidos
  const [tributosExpandidos, setTributosExpandidos] = useState<Set<string>>(new Set());

  // Función para manejar clic en fila de estado de cuenta
  const handleFilaClick = async (anio: number) => {
    setAnioSeleccionado(anio);
    // Cargar detalle del año seleccionado
    if (codigoContribuyente) {
      await cargarDetalleEstadoCuenta(codigoContribuyente, anio);
    }
    console.log(`Año seleccionado: ${anio}`);
  };

  // Función para buscar cuenta corriente
  const handleBuscarCuenta = async () => {
    if (!codigoContribuyente) {
      alert('Por favor seleccione un contribuyente');
      return;
    }
    // Cargar estado de cuenta anual
    await cargarEstadoCuenta(codigoContribuyente);
    // Limpiar año seleccionado
    setAnioSeleccionado(null);
    console.log('Buscando cuenta corriente para contribuyente código:', codigoContribuyente);
  };

  // Función para abrir selector de contribuyente
  const handleSelectorContribuyente = () => {
    setIsModalOpen(true);
  };

  // Función para manejar la selección del contribuyente
  const handleSelectContribuyente = (contribuyente: any) => {
    setContribuyenteSeleccionado(contribuyente);
    setCodigoContribuyente(contribuyente.codigo.toString());
    setIsModalOpen(false);
    // Limpiar datos anteriores
    limpiarTodo();
    setAnioSeleccionado(null);
  };

  // Función para toggle expansión de tributo
  const handleToggleTributo = (tributo: string) => {
    setTributosExpandidos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tributo)) {
        newSet.delete(tributo);
      } else {
        newSet.add(tributo);
      }
      return newSet;
    });
  };

  // Convertir estadoCuentaDetalle (API) a formato de tabla de detalle
  const detalleConceptos = useMemo(() => {
    if (!estadoCuentaDetalle || estadoCuentaDetalle.length === 0) return [];

    // Agrupar por tributo y crear filas de Cargo y Pagado
    return estadoCuentaDetalle.flatMap((item) => {
      // Aquí mapeamos los datos de la API a la estructura de la tabla
      // Nota: La API devuelve cargo1-12 y abono1-12, que los mapeamos a col1-col12
      return [
        {
          anio: item.anio,
          grupoTributo: item.grupoTributo,
          tributo: item.grupoTributo,  // Temporal: usando grupoTributo como nombre del tributo
          concepto: 'Cargo',
          col1: item.cargo1 || 0,
          col2: item.cargo2 || 0,
          col3: item.cargo3 || 0,
          col4: item.cargo4 || 0,
          col5: item.cargo5 || 0,
          col6: item.cargo6 || 0,
          col7: item.cargo7 || 0,
          col8: item.cargo8 || 0,
          col9: item.cargo9 || 0,
          col10: item.cargo10 || 0,
          col11: item.cargo11 || 0,
          col12: item.cargo12 || 0,
          totalCargos: item.totalCargos,
          totalPagado: item.totalPagado,
          saldoNeto: item.saldoNeto
        },
        {
          anio: item.anio,
          grupoTributo: item.grupoTributo,
          tributo: item.grupoTributo,
          concepto: 'Pagado',
          col1: item.abono1 || 0,
          col2: item.abono2 || 0,
          col3: item.abono3 || 0,
          col4: item.abono4 || 0,
          col5: item.abono5 || 0,
          col6: item.abono6 || 0,
          col7: item.abono7 || 0,
          col8: item.abono8 || 0,
          col9: item.abono9 || 0,
          col10: item.abono10 || 0,
          col11: item.abono11 || 0,
          col12: item.abono12 || 0,
          totalCargos: item.totalCargos,
          totalPagado: item.totalPagado,
          saldoNeto: item.saldoNeto
        }
      ];
    });
  }, [estadoCuentaDetalle]);

  // Filtrar detalles según el año seleccionado
  const detallesFiltrados = useMemo(() => {
    if (!anioSeleccionado) return [];
    return detalleConceptos.filter(detalle => detalle.anio === anioSeleccionado);
  }, [anioSeleccionado, detalleConceptos]);

  // Agrupar tributos únicos
  const tributosUnicos = useMemo(() => {
    const tributos = new Map<string, typeof detallesFiltrados>();
    detallesFiltrados.forEach((detalle) => {
      if (!tributos.has(detalle.tributo)) {
        tributos.set(detalle.tributo, []);
      }
      tributos.get(detalle.tributo)!.push(detalle);
    });
    return tributos;
  }, [detallesFiltrados]);

  // Función para formatear números
  const formatearNumero = (numero: number | null): string => {
    if (numero === null || numero === undefined) return '0.00';
    return numero.toFixed(2);
  };

  if (loading || loadingEstadoCuenta) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error || errorEstadoCuenta) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error || errorEstadoCuenta}
      </Alert>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Modal de Selección de Contribuyente */}
      <SelectorContribuyente
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectContribuyente={handleSelectContribuyente}
        selectedId={contribuyenteSeleccionado?.codigo}
      />

      {/* Sección de Búsqueda */}
      <Card sx={{ mb: 3, boxShadow: 3 }}>
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              mb: 2,
              pb: 1,
              borderBottom: '2px solid',
              borderImage: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%) 1'
            }}
          >
            <Typography
              variant="h6"
              component="h2"
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '0.5px'
              }}
            >
              Búsqueda de Cuenta Corriente
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 2.5,
              alignItems: 'stretch',
              p: 2.5,
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.03) 0%, rgba(118, 75, 162, 0.03) 100%)',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'rgba(102, 126, 234, 0.15)'
            }}
          >
            {/* Seleccionar Contribuyente*/}
            <Box sx={{ flex: '1 1 280px', minWidth: '280px' }}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<PersonSearchIcon sx={{ fontSize: '1.3rem' }} />}
                onClick={handleSelectorContribuyente}
                sx={{
                  height: 56,
                  borderWidth: 2,
                  borderColor: '#667eea',
                  color: '#667eea',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  textTransform: 'none',
                  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 6px rgba(102, 126, 234, 0.15)',
                  '&:hover': {
                    borderWidth: 2,
                    borderColor: '#764ba2',
                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.25)'
                  }
                }}
              >
                Seleccionar Contribuyente
              </Button>
            </Box>

            {/* Información del Contribuyente Seleccionado */}
            <Box
              sx={{
                flex: '1 1 300px',
                minWidth: '300px',
                display: 'flex',
                flexDirection: 'column',
                gap: 1
              }}
            >
              {contribuyenteSeleccionado ? (
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 1.5,
                    background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.08) 0%, rgba(139, 195, 74, 0.08) 100%)',
                    border: '2px solid rgba(76, 175, 80, 0.3)',
                    boxShadow: '0 2px 6px rgba(76, 175, 80, 0.15)',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#2e7d32',
                      fontWeight: 600,
                      fontSize: '0.7rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      mb: 0.5
                    }}
                  >
                    Contribuyente Seleccionado
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Chip
                      label={`Código: ${codigoContribuyente}`}
                      sx={{
                        background: 'linear-gradient(135deg, #2e7d32 0%, #43a047 100%)',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '0.813rem',
                        height: 28,
                        borderRadius: '14px'
                      }}
                    />
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: '#1b5e20',
                        fontSize: '0.875rem'
                      }}
                    >
                      {contribuyenteSeleccionado.contribuyente || 'Sin nombre'}
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 1.5,
                    background: 'rgba(0,0,0,0.02)',
                    border: '2px dashed rgba(0,0,0,0.15)',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'text.secondary',
                      fontStyle: 'italic',
                      fontSize: '0.875rem'
                    }}
                  >
                    No hay contribuyente seleccionado
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Botón de Buscar */}
            <Box sx={{ flex: '0 1 180px', minWidth: '180px' }}>
              <Button
                variant="contained"
                fullWidth
                startIcon={
                  loadingEstadoCuenta ? (
                    <CircularProgress size={20} sx={{ color: 'white' }} />
                  ) : (
                    <SearchIcon sx={{ fontSize: '1.3rem' }} />
                  )
                }
                onClick={handleBuscarCuenta}
                disabled={!codigoContribuyente || loadingEstadoCuenta}
                sx={{
                  height: 56,
                  background: !codigoContribuyente || loadingEstadoCuenta
                    ? 'rgba(0,0,0,0.12)'
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '1rem',
                  textTransform: 'none',
                  boxShadow: !codigoContribuyente || loadingEstadoCuenta
                    ? 'none'
                    : '0 4px 12px rgba(102, 126, 234, 0.35)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: !codigoContribuyente || loadingEstadoCuenta
                      ? 'rgba(0,0,0,0.12)'
                      : 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                    transform: !codigoContribuyente || loadingEstadoCuenta ? 'none' : 'translateY(-2px)',
                    boxShadow: !codigoContribuyente || loadingEstadoCuenta
                      ? 'none'
                      : '0 6px 16px rgba(102, 126, 234, 0.45)'
                  },
                  '&:disabled': {
                    color: 'rgba(0,0,0,0.26)'
                  }
                }}
              >
                {loadingEstadoCuenta ? 'Buscando...' : 'Buscar'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Tabla de Estado de Cuenta Anual */}
      <Card sx={{ mb: 3, boxShadow: 3 }}>
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              mb: 2,
              pb: 1,
              borderBottom: '2px solid',
              borderImage: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%) 1'
            }}
          >
            <Typography
              variant="h5"
              component="h2"
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '0.5px'
              }}
            >
              ESTADO DE CUENTA
            </Typography>
          </Box>

          {estadoCuentaAnual.length === 0 ? (
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              Seleccione un contribuyente y haga clic en Buscar para ver el estado de cuenta.
            </Alert>
          ) : (
            <>
              <TableContainer
                component={Paper}
                elevation={0}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  overflow: 'hidden'
                }}
              >
                <Table size="small" sx={{ minWidth: 650 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell
                        sx={{
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          color: 'white',
                          fontWeight: 700,
                          fontSize: '0.875rem',
                          borderRight: '1px solid rgba(255,255,255,0.2)'
                        }}
                      >
                        Año
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          color: 'white',
                          fontWeight: 700,
                          fontSize: '0.875rem',
                          borderRight: '1px solid rgba(255,255,255,0.2)'
                        }}
                      >
                        Grupo Tributo
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                          color: 'white',
                          fontWeight: 700,
                          fontSize: '0.875rem',
                          borderRight: '1px solid rgba(255,255,255,0.2)'
                        }}
                      >
                        Total Cargos
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          background: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
                          color: 'white',
                          fontWeight: 700,
                          fontSize: '0.875rem',
                          borderRight: '1px solid rgba(255,255,255,0.2)'
                        }}
                      >
                        Total Pagado
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                          color: '#333',
                          fontWeight: 700,
                          fontSize: '0.875rem'
                        }}
                      >
                        Saldo Neto
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {estadoCuentaAnual.map((fila, index) => (
                      <TableRow
                        key={fila.anio}
                        onClick={() => handleFilaClick(fila.anio)}
                        sx={{
                          cursor: 'pointer',
                          backgroundColor: anioSeleccionado === fila.anio
                            ? 'rgba(102, 126, 234, 0.08)'
                            : index % 2 === 0 ? 'white' : 'rgba(0,0,0,0.02)',
                          transition: 'all 0.2s ease-in-out',
                          borderLeft: anioSeleccionado === fila.anio ? '4px solid #667eea' : '4px solid transparent',
                          '&:hover': {
                            backgroundColor: anioSeleccionado === fila.anio
                              ? 'rgba(102, 126, 234, 0.12)'
                              : 'rgba(102, 126, 234, 0.05)',
                            transform: 'translateX(2px)',
                            boxShadow: '0 2px 8px rgba(102, 126, 234, 0.15)'
                          }
                        }}
                      >
                        <TableCell
                          sx={{
                            fontWeight: 700,
                            fontSize: '0.95rem',
                            color: anioSeleccionado === fila.anio ? '#667eea' : '#1a237e',
                            borderRight: '1px solid rgba(0,0,0,0.06)'
                          }}
                        >
                          {fila.anio}
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            borderRight: '1px solid rgba(0,0,0,0.06)'
                          }}
                        >
                          <Chip
                            label={fila.grupoTributo}
                            sx={{
                              background: fila.grupoTributo === 'Arbitrial'
                                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                              color: 'white',
                              fontWeight: 600,
                              fontSize: '0.75rem',
                              height: 26,
                              borderRadius: '13px',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                              transition: 'transform 0.2s',
                              '&:hover': {
                                transform: 'scale(1.05)'
                              }
                            }}
                            size="small"
                          />
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            background: 'linear-gradient(135deg, rgba(250, 112, 154, 0.08) 0%, rgba(254, 225, 64, 0.08) 100%)',
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            color: '#e65100',
                            borderRight: '1px solid rgba(250, 112, 154, 0.2)',
                            borderLeft: '3px solid rgba(250, 112, 154, 0.3)'
                          }}
                        >
                          {formatearNumero(fila.totalCargos)}
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            background: fila.totalPagado > 0
                              ? 'linear-gradient(135deg, rgba(48, 207, 208, 0.08) 0%, rgba(51, 8, 103, 0.08) 100%)'
                              : 'transparent',
                            color: fila.totalPagado > 0 ? '#2e7d32' : '#9e9e9e',
                            fontWeight: fila.totalPagado > 0 ? 700 : 500,
                            fontSize: '0.9rem',
                            borderRight: '1px solid rgba(48, 207, 208, 0.2)'
                          }}
                        >
                          {formatearNumero(fila.totalPagado)}
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            background: fila.saldoNeto > 0
                              ? 'linear-gradient(135deg, rgba(244, 67, 54, 0.12) 0%, rgba(255, 152, 0, 0.08) 100%)'
                              : 'linear-gradient(135deg, rgba(76, 175, 80, 0.12) 0%, rgba(139, 195, 74, 0.08) 100%)',
                            color: fila.saldoNeto > 0 ? '#d32f2f' : '#2e7d32',
                            fontWeight: 700,
                            fontSize: '0.95rem',
                            borderRadius: '0 4px 4px 0',
                            position: 'relative',
                            '&::before': fila.saldoNeto > 0 ? {
                              content: '""',
                              position: 'absolute',
                              left: 0,
                              top: '50%',
                              transform: 'translateY(-50%)',
                              width: '3px',
                              height: '60%',
                              background: 'linear-gradient(180deg, #f44336 0%, #ff9800 100%)',
                              borderRadius: '0 2px 2px 0'
                            } : {}
                          }}
                        >
                          {formatearNumero(fila.saldoNeto)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Información adicional */}
              <Box
                sx={{
                  mt: 3,
                  p: 2,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'rgba(102, 126, 234, 0.2)'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      animation: 'pulse 2s ease-in-out infinite',
                      '@keyframes pulse': {
                        '0%, 100%': { opacity: 1, transform: 'scale(1)' },
                        '50%': { opacity: 0.6, transform: 'scale(0.9)' }
                      }
                    }}
                  />
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#667eea',
                      fontWeight: 500,
                      fontSize: '0.875rem'
                    }}
                  >
                    Haga clic en una fila para ver el detalle por conceptos
                  </Typography>
                </Box>
                {deudaSeleccionada && (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      px: 2,
                      py: 1,
                      background: 'linear-gradient(135deg, #fff9c4 0%, #fff59d 100%)',
                      borderRadius: 1.5,
                      border: '1px solid #fbc02d',
                      boxShadow: '0 2px 6px rgba(251, 192, 45, 0.2)'
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: '#f57f17',
                        fontSize: '0.813rem'
                      }}
                    >
                      Deuda Seleccionada:
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 700,
                        color: '#e65100',
                        fontSize: '0.875rem'
                      }}
                    >
                      {deudaSeleccionada}
                    </Typography>
                  </Box>
                )}
              </Box>
            </>
          )}
        </CardContent>
      </Card>

      {/* Tabla de Detalle de Conceptos */}
      <Card sx={{ boxShadow: 3 }}>
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 2,
              pb: 1.5,
              borderBottom: '2px solid',
              borderImage: 'linear-gradient(90deg, #4facfe 0%, #00f2fe 100%) 1'
            }}
          >
            <Typography
              variant="h5"
              component="h2"
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '0.5px',
                fontSize: '1.25rem'
              }}
            >
              ESTADO DE CUENTA - DETALLE POR CONCEPTOS
            </Typography>
            {anioSeleccionado && (
              <Chip
                label={`Año ${anioSeleccionado}`}
                sx={{
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  height: 32,
                  borderRadius: '16px',
                  boxShadow: '0 2px 8px rgba(79, 172, 254, 0.3)',
                  px: 2
                }}
              />
            )}
          </Box>

          {loadingDetalle ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : errorDetalle ? (
            <Alert severity="error">{errorDetalle}</Alert>
          ) : (
            <TableContainer
              component={Paper}
              elevation={0}
              sx={{
                maxHeight: 500,
                overflowX: 'auto',
                overflowY: 'auto',
                '&::-webkit-scrollbar': {
                  width: '8px',
                  height: '8px',
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
              <Table size="small" sx={{ minWidth: 1800 }} stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell
                      rowSpan={2}
                      align="center"
                      sx={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '0.875rem',
                        position: 'sticky',
                        left: 0,
                        zIndex: 3,
                        minWidth: 80,
                        borderRight: '2px solid rgba(255,255,255,0.3)'
                      }}
                    >
                      Año
                    </TableCell>
                    <TableCell
                      rowSpan={2}
                      align="center"
                      sx={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '0.875rem',
                        position: 'sticky',
                        left: 80,
                        zIndex: 3,
                        minWidth: 140,
                        borderRight: '2px solid rgba(255,255,255,0.3)'
                      }}
                    >
                      Grupo Tributo
                    </TableCell>
                    <TableCell
                      rowSpan={2}
                      align="center"
                      sx={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '0.875rem',
                        minWidth: 250,
                        borderRight: '2px solid rgba(255,255,255,0.3)'
                      }}
                    >
                      Tributo
                    </TableCell>
                    <TableCell
                      rowSpan={2}
                      align="center"
                      sx={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '0.875rem',
                        minWidth: 100
                      }}
                    >
                      Concepto
                    </TableCell>
                    <TableCell
                      align="center"
                      colSpan={12}
                      sx={{
                        background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '0.875rem',
                        borderLeft: '3px solid rgba(255,255,255,0.5)'
                      }}
                    >
                      Períodos
                    </TableCell>
                    <TableCell
                      rowSpan={2}
                      align="center"
                      sx={{
                        background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '0.875rem',
                        borderLeft: '3px solid rgba(255,255,255,0.5)',
                        minWidth: 120
                      }}
                    >
                      Total Cargos
                    </TableCell>
                    <TableCell
                      rowSpan={2}
                      align="center"
                      sx={{
                        background: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '0.875rem',
                        minWidth: 120
                      }}
                    >
                      Total Pagado
                    </TableCell>
                    <TableCell
                      rowSpan={2}
                      align="center"
                      sx={{
                        background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                        color: '#333',
                        fontWeight: 700,
                        fontSize: '0.875rem',
                        minWidth: 120
                      }}
                    >
                      Saldo Neto
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((periodo) => (
                      <TableCell
                        key={periodo}
                        align="center"
                        sx={{
                          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '0.813rem',
                          minWidth: 80,
                          borderLeft: periodo === 1 ? '3px solid rgba(255,255,255,0.5)' : 'none'
                        }}
                      >
                        {periodo}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tributosUnicos.size === 0 ? (
                    <TableRow>
                      <TableCell colSpan={19} align="center" sx={{ py: 4 }}>
                        <Typography variant="body1" color="text.secondary">
                          {anioSeleccionado
                            ? `No hay datos disponibles para el año ${anioSeleccionado}`
                            : 'Seleccione un año para ver el detalle'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    Array.from(tributosUnicos.entries()).map(([tributo, conceptos]) => {
                      const isExpanded = tributosExpandidos.has(tributo);
                      const primerConcepto = conceptos[0];

                      return (
                        <React.Fragment key={tributo}>
                          {/* Fila principal del tributo */}
                          <TableRow
                            sx={{
                              '&:hover': { backgroundColor: '#f5f5f5' },
                              backgroundColor: '#fafafa',
                              cursor: 'pointer'
                            }}
                            onClick={() => handleToggleTributo(tributo)}
                          >
                            {/* Año */}
                            <TableCell
                              align="center"
                              sx={{
                                fontWeight: 'bold',
                                position: 'sticky',
                                left: 0,
                                backgroundColor: '#fafafa',
                                zIndex: 2,
                                minWidth: 80,
                                borderRight: '1px solid #e0e0e0'
                              }}
                            >
                              {primerConcepto.anio}
                            </TableCell>

                            {/* Grupo Tributo */}
                            <TableCell
                              align="center"
                              sx={{
                                position: 'sticky',
                                left: 80,
                                backgroundColor: '#fafafa',
                                zIndex: 2,
                                minWidth: 140,
                                borderRight: '1px solid #e0e0e0'
                              }}
                            >
                              <Chip
                                label={primerConcepto.grupoTributo}
                                color={primerConcepto.grupoTributo === 'Arbitrial' ? 'primary' : 'secondary'}
                                size="small"
                              />
                            </TableCell>

                            {/* Tributo con botón expandir */}
                            <TableCell
                              align="left"
                              sx={{
                                fontWeight: 'bold',
                                minWidth: 250,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                              }}
                            >
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleTributo(tributo);
                                }}
                                sx={{
                                  transition: 'transform 0.2s',
                                  transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)'
                                }}
                              >
                                {isExpanded ? <ExpandMoreIcon /> : <ChevronRightIcon />}
                              </IconButton>
                              {tributo}
                            </TableCell>

                            {/* Concepto - vacío en la fila principal */}
                            <TableCell>
                              <Typography variant="caption" color="text.secondary">
                                {conceptos.length} concepto(s)
                              </Typography>
                            </TableCell>

                            {/* Períodos - sumas totales */}
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((col, idx) => (
                              <TableCell key={col} align="center" sx={{ borderLeft: idx === 0 ? '3px solid #4facfe' : 'none' }}>
                                <Typography variant="caption" fontWeight={600}>
                                  {formatearNumero(conceptos.reduce((sum, c) => {
                                    const value = c[`col${col}` as keyof typeof c];
                                    return sum + (typeof value === 'number' ? value : 0);
                                  }, 0))}
                                </Typography>
                              </TableCell>
                            ))}

                            {/* Total Cargos */}
                            <TableCell align="center" sx={{ backgroundColor: '#fff3e0', fontWeight: 'bold', borderLeft: '3px solid #fa709a' }}>
                              {formatearNumero(primerConcepto.totalCargos)}
                            </TableCell>

                            {/* Total Pagado */}
                            <TableCell align="center" sx={{ backgroundColor: '#e8f5e9', fontWeight: 'bold' }}>
                              {formatearNumero(primerConcepto.totalPagado)}
                            </TableCell>

                            {/* Saldo Neto */}
                            <TableCell
                              align="center"
                              sx={{
                                backgroundColor: primerConcepto.saldoNeto > 0 ? '#ffebee' : '#e8f5e9',
                                fontWeight: 'bold',
                                color: primerConcepto.saldoNeto > 0 ? '#d32f2f' : '#2e7d32'
                              }}
                            >
                              {formatearNumero(primerConcepto.saldoNeto)}
                            </TableCell>
                          </TableRow>

                          {/* Filas de conceptos expandibles */}
                          {isExpanded && conceptos.map((detalle, idx) => (
                            <TableRow
                              key={`${tributo}-${idx}`}
                              sx={{
                                backgroundColor: detalle.concepto === 'Cargo' ? '#fff8e1' : '#f1f8e9',
                                '&:hover': { backgroundColor: detalle.concepto === 'Cargo' ? '#fff3e0' : '#e8f5e9' }
                              }}
                            >
                              {/* Año - vacío */}
                              <TableCell sx={{ position: 'sticky', left: 0, backgroundColor: 'inherit', zIndex: 2, borderRight: '1px solid #e0e0e0' }} />

                              {/* Grupo Tributo - vacío */}
                              <TableCell sx={{ position: 'sticky', left: 80, backgroundColor: 'inherit', zIndex: 2, borderRight: '1px solid #e0e0e0' }} />

                              {/* Tributo - vacío */}
                              <TableCell />

                              {/* Concepto */}
                              <TableCell>
                                <Chip
                                  label={detalle.concepto}
                                  size="small"
                                  color={detalle.concepto === 'Cargo' ? 'warning' : 'success'}
                                  variant="outlined"
                                />
                              </TableCell>

                              {/* Períodos */}
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((col, colIdx) => {
                                const value = detalle[`col${col}` as keyof typeof detalle];
                                return (
                                  <TableCell key={col} align="center" sx={{ borderLeft: colIdx === 0 ? '3px solid #4facfe' : 'none' }}>
                                    {formatearNumero(typeof value === 'number' ? value : 0)}
                                  </TableCell>
                                );
                              })}

                              {/* Total Cargos */}
                              <TableCell align="center" sx={{ backgroundColor: '#fff3e0', fontWeight: 'bold', borderLeft: '3px solid #fa709a' }}>
                                {formatearNumero(detalle.totalCargos)}
                              </TableCell>

                              {/* Total Pagado */}
                              <TableCell align="center" sx={{ backgroundColor: '#e8f5e9', fontWeight: 'bold', color: detalle.totalPagado > 0 ? '#2e7d32' : 'inherit' }}>
                                {formatearNumero(detalle.totalPagado)}
                              </TableCell>

                              {/* Saldo Neto */}
                              <TableCell
                                align="center"
                                sx={{
                                  backgroundColor: detalle.saldoNeto > 0 ? '#ffebee' : '#e8f5e9',
                                  fontWeight: 'bold',
                                  color: detalle.saldoNeto > 0 ? '#d32f2f' : '#2e7d32'
                                }}
                              >
                                {formatearNumero(detalle.saldoNeto)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </React.Fragment>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default CuentaList;

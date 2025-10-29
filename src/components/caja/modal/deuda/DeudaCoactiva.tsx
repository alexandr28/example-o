// src/components/caja/modal/deuda/DeudaCoactiva.tsx
import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Checkbox
} from '@mui/material';

// Interfaces
export interface TributoCoactivo {
  tributo: string;
  valores: number[]; // 12 valores para los 12 meses
  checked: boolean;
}

export interface AñoCoactivo {
  año: number;
  tributos: TributoCoactivo[];
}

export interface ExpedienteCoactivo {
  añoExpediente: number;
  nroExpediente: string;
  años: AñoCoactivo[];
}

interface DeudaCoactivaProps {
  expedientesCoactivos: ExpedienteCoactivo[];
  añosCoactivos: AñoCoactivo[];
  tributosCoactivos: TributoCoactivo[];
  selectedExpediente: number | null;
  selectedAñoCoactivo: number | null;
  montoCoactivo: string;
  onExpedienteClick: (añoExpediente: number) => void;
  onAñoCoactivoClick: (año: number) => void;
  onTributoCoactivoCheck: (index: number) => void;
  getCellColorCoactivo: (rowIndex: number, mesIndex: number) => string;
}

const DeudaCoactiva: React.FC<DeudaCoactivaProps> = ({
  expedientesCoactivos,
  añosCoactivos,
  tributosCoactivos,
  selectedExpediente,
  selectedAñoCoactivo,
  montoCoactivo,
  onExpedienteClick,
  onAñoCoactivoClick,
  onTributoCoactivoCheck,
  getCellColorCoactivo
}) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Contenedor de las tres tablas */}
      <Box sx={{ display: 'flex', gap: 0, flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {/* Primera tabla: Año Expediente y N° Expediente */}
        <TableContainer
          component={Paper}
          variant="outlined"
          sx={{
            width: '180px',
            minWidth: '180px',
            height: '100%',
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
                    onClick={() => onExpedienteClick(expediente.añoExpediente)}
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
            height: '100%',
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
                    onClick={() => onAñoCoactivoClick(añoData.año)}
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
        <Box sx={{ flex: 1, display: 'flex', height: '100%', overflow: 'hidden', border: '1px solid #e0e0e0', borderRadius: 0 }}>
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              flex: 1,
              height: '100%',
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
                        onChange={() => onTributoCoactivoCheck(index)}
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
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2, flex: 0, pt: 1 }}>
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
  );
};

export default DeudaCoactiva;

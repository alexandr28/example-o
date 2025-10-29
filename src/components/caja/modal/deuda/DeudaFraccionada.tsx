// src/components/caja/modal/deuda/DeudaFraccionada.tsx
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
export interface CuotaFraccionamiento {
  nCuota: number;
  deuda: number;
  im: number;
  cuota: number;
  fVenc: string;
  checked: boolean;
}

export interface ResolucionFraccionamiento {
  año: number;
  resolucion: string;
  cuotas: CuotaFraccionamiento[];
}

export interface TributoFraccionado {
  tributo: string;
  valores: number[]; // 12 valores para los 12 meses
}

interface DeudaFraccionadaProps {
  resolucionesFraccionamiento: ResolucionFraccionamiento[];
  cuotasFraccionamiento: CuotaFraccionamiento[];
  tributosFraccionados: TributoFraccionado[];
  tributosFraccionadosBase: TributoFraccionado[];
  selectedAño: number | null;
  montoFraccionado: string;
  onAñoClick: (año: number) => void;
  onCuotaCheck: (nCuota: number) => void;
  getCellColorFraccionamiento: (rowIndex: number, mesIndex: number) => string;
}

const DeudaFraccionada: React.FC<DeudaFraccionadaProps> = ({
  resolucionesFraccionamiento,
  cuotasFraccionamiento,
  tributosFraccionados,
  tributosFraccionadosBase,
  selectedAño,
  montoFraccionado,
  onAñoClick,
  onCuotaCheck,
  getCellColorFraccionamiento
}) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Contenedor de las tres tablas */}
      <Box sx={{ display: 'flex', gap: 0, flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {/* Primera tabla: Año y Res */}
        <TableContainer
          component={Paper}
          variant="outlined"
          sx={{
            width: '120px',
            minWidth: '120px',
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
                    onClick={() => onAñoClick(item.año)}
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
                      onChange={() => onCuotaCheck(cuota.nCuota)}
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
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2, flex: 0, pt: 1 }}>
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
  );
};

export default DeudaFraccionada;

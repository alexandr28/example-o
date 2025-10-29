// src/components/caja/modal/deuda/DeudaOrdinaria.tsx
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

// Interface para los items de deuda
export interface DeudaOrdinaria {
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

interface DeudaOrdinariaProps {
  data: DeudaOrdinaria[];
  tipoMonto: string;
  selectedRows: string[];
  onRowSelection: (itemId: string) => void;
  getCellColor: (itemId: string, mesKey: string, deudaMes: number) => string;
  calcularDeudaTotal: () => number;
}

const DeudaOrdinariaComponent: React.FC<DeudaOrdinariaProps> = ({
  data,
  tipoMonto,
  selectedRows,
  onRowSelection,
  getCellColor,
  calcularDeudaTotal
}) => {
  return (
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
              {data.map((item) => (
                <TableRow key={item.id} hover>
                  {tipoMonto === 'seleccionar' && (
                    <TableCell sx={{ p: 0.25 }}>
                      <Checkbox
                        size="small"
                        checked={selectedRows.includes(item.id)}
                        onChange={() => onRowSelection(item.id)}
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
          value={`S/. ${calcularDeudaTotal().toFixed(2)}`}
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
  );
};

export default DeudaOrdinariaComponent;

// src/components/caja/modal/deuda/DeudaGlobal.tsx
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
  TableContainer
} from '@mui/material';

// Interfaces
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

interface DeudaGlobalProps {
  data: DeudaGlobalItem[];
}

const DeudaGlobal: React.FC<DeudaGlobalProps> = ({ data }) => {
  // Calcular deuda global total
  const calcularDeudaGlobalTotal = () => {
    return data.reduce((sum, item) => sum + item.deuda, 0);
  };

  return (
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
              {data.map((item) => (
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
  );
};

export default DeudaGlobal;

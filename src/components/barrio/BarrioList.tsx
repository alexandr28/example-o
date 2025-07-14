// src/components/barrio/BarrioList.tsx
import React, { useMemo, useState } from 'react';
import { Barrio } from '../../models/Barrio';
import { Sector } from '../../models/Sector';

// Material-UI imports
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Box,
  Typography,
  CircularProgress,
  Tooltip
} from '@mui/material';
import {
  Edit as EditIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';

interface BarrioListProps {
  barrios: Barrio[];
  sectores?: Sector[];
  onEdit?: (barrio: Barrio) => void;
  onDelete?: (barrio: Barrio) => void;
  onView?: (barrio: Barrio) => void;
  loading?: boolean;
  searchTerm?: string;
}

const BarrioList: React.FC<BarrioListProps> = ({
  barrios = [],
  sectores = [],
  onEdit,
  onDelete,
  onView,
  loading = false,
  searchTerm = ''
}) => {
  // Estados para paginación
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5); // 5 filas por página

  // Crear un mapa de sectores para búsqueda eficiente
  const sectoresMap = useMemo(() => {
    const map = new Map<number, Sector>();
    if (Array.isArray(sectores)) {
      sectores.forEach(sector => {
        map.set(sector.id, sector);
      });
    }
    return map;
  }, [sectores]);

  // Obtener el nombre del sector
  const getNombreSector = (codSector: number | undefined): string => {
    if (!codSector) return 'Sin sector';
    const sector = sectoresMap.get(codSector);
    return sector?.nombre || `Sector ${codSector}`;
  };

  // Manejar cambio de página
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Manejar cambio de filas por página
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Calcular los barrios a mostrar en la página actual
  const barriosPaginados = useMemo(() => {
    const inicio = page * rowsPerPage;
    const fin = inicio + rowsPerPage;
    return barrios.slice(inicio, fin);
  }, [barrios, page, rowsPerPage]);

  // Verificar si el array es válido
  if (!Array.isArray(barrios)) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">
          Error: No se pudieron cargar los barrios
        </Typography>
      </Box>
    );
  }

  // Estado de carga
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Lista vacía
  if (barrios.length === 0) {
    return (
      <Box sx={{ p: 5, textAlign: 'center' }}>
        <LocationIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No hay barrios
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {searchTerm
            ? `No se encontraron barrios que coincidan con "${searchTerm}"`
            : 'Comience creando un nuevo barrio'}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell width="50%">Nombre</TableCell>
              <TableCell width="40%">Sector</TableCell>
              <TableCell width="10%" align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {barriosPaginados.map((barrio) => (
              <TableRow 
                key={barrio.id}
                hover
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {barrio.nombre}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <LocationIcon fontSize="small" color="action" sx={{ fontSize: 16 }} />
                    <Typography variant="body2" fontSize="0.875rem">
                      {getNombreSector(barrio.codSector)}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell align="center">
                  {onEdit && (
                    <Tooltip title="Editar">
                      <IconButton
                        size="small"
                        onClick={() => onEdit(barrio)}
                        color="primary"
                        sx={{ padding: '4px' }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {/* Filas vacías para mantener altura consistente */}
            {barriosPaginados.length < rowsPerPage && (
              Array.from({ length: rowsPerPage - barriosPaginados.length }).map((_, index) => (
                <TableRow key={`empty-${index}`} sx={{ height: 41 }}>
                  <TableCell colSpan={3} />
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 15]}
        component="div"
        count={barrios.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Filas por página:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        sx={{ borderTop: 1, borderColor: 'divider' }}
      />
    </Box>
  );
};

export default BarrioList;
// src/pages/contribuyente/ConsultaContribuyente.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Stack,
  Button,
  useTheme
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon
} from '@mui/icons-material';
import { MainLayout } from '../../layout';
import { Breadcrumb } from '../../components';
import FiltroContribuyenteFormMUI from '../../components/contribuyentes/FiltroContribuyenteForm';
import ContribuyenteListMUI from '../../components/contribuyentes/ContribuyenteList';
import { NotificationContainer } from '../../components';
import { BreadcrumbItem } from '../../components/utils/Breadcrumb';
import { useContribuyentes } from '../../hooks';

/**
 * Página para consultar y listar contribuyentes con diseño compacto
 */
const ConsultaContribuyente: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  // Hook personalizado para manejar contribuyentes
  const { 
    contribuyentes, 
    loading, 
    error, 
    buscarContribuyentes,
    cargarContribuyentes
  } = useContribuyentes();

  // Migas de pan para la navegación
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Módulo', path: '/' },
    { label: 'Contribuyente', path: '/contribuyente' },
    { label: 'Consulta contribuyente', active: true }
  ];

  // Cargar contribuyentes al montar el componente
  useEffect(() => {
    cargarContribuyentes();
  }, [cargarContribuyentes]);

  // Manejar la búsqueda de contribuyentes
  const handleBuscar = (filtro: any) => {
    console.log('🔍 Buscando con filtros:', filtro);
    buscarContribuyentes(filtro);
  };

  // Manejar la navegación a nuevo contribuyente
  const handleNuevo = () => {
    navigate('/contribuyente/nuevo');
  };

  // Manejar la edición de un contribuyente
  const handleEditar = (codigo: string | number) => {
    console.log('Editar contribuyente:', codigo);
    navigate(`/contribuyente/editar/${codigo}`);
  };

  // Manejar ver detalles de un contribuyente
  const handleVer = (codigo: string | number) => {
    console.log('Ver contribuyente:', codigo);
    navigate(`/contribuyente/ver/${codigo}`);
  };

  return (
    <MainLayout title="Consulta de Contribuyentes">
      <Box sx={{ p: 3 }}>
        {/* Navegación de migas de pan */}
        <Box sx={{ mb: 3 }}>
          <Breadcrumb items={breadcrumbItems} />
        </Box>

        {/* Contenedor principal centrado */}
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Box sx={{ width: '100%', maxWidth: '900px' }}>
            <Stack spacing={3}>
              {/* Botón de nuevo contribuyente */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  startIcon={<PersonAddIcon />}
                  onClick={handleNuevo}
                  sx={{
                    textTransform: 'none',
                    backgroundColor: theme.palette.primary.main,
                    '&:hover': {
                      backgroundColor: theme.palette.primary.dark,
                    }
                  }}
                >
                  Nuevo Contribuyente
                </Button>
              </Box>

              {/* Filtros de búsqueda */}
              <FiltroContribuyenteFormMUI
                onBuscar={handleBuscar}
                loading={loading}
              />

              {/* Lista de contribuyentes */}
              <ContribuyenteListMUI
                contribuyentes={contribuyentes}
                onEditar={handleEditar}
                onVer={handleVer}
                loading={loading}
              />
            </Stack>
          </Box>
        </Box>

        {/* Contenedor de notificaciones */}
        <NotificationContainer />
      </Box>
    </MainLayout>
  );
};

export default ConsultaContribuyente;
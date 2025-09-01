// src/pages/cuenta/CuentaConsultaPage.tsx
import React from 'react';
import {
  Box,
  Container,
  Paper,
  Breadcrumbs,
  Link,
  Typography,
  Chip,
  Stack,
  useTheme,
  alpha
} from '@mui/material';
import {
  NavigateNext as NavigateNextIcon,
  Home as HomeIcon,
  AccountBalance as AccountIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import MainLayout from '../../layout/MainLayout';
import CuentaList from '../../components/cuenta/CuentaList';

/**
 * Página de consulta de cuentas corrientes con Material-UI
 */
const CuentaConsultaPage: React.FC = () => {
  const theme = useTheme();

  // Items del breadcrumb
  const breadcrumbItems = [
    { label: 'Inicio', path: '/', icon: <HomeIcon sx={{ fontSize: 20 }} /> },
    { label: 'Cuenta Corriente', path: '/cuenta', icon: <AccountIcon sx={{ fontSize: 20 }} /> },
    { label: 'Consulta', active: true, icon: <SearchIcon sx={{ fontSize: 20 }} /> }
  ];

  return (
    <MainLayout>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Breadcrumbs */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 3,
            bgcolor: alpha(theme.palette.grey[50], 0.8),
            borderRadius: 2
          }}
        >
          <Breadcrumbs
            separator={<NavigateNextIcon fontSize="small" />}
            aria-label="breadcrumb"
          >
            {breadcrumbItems.map((item, index) => {
              const isLast = index === breadcrumbItems.length - 1;
              
              return isLast || item.active ? (
                <Stack 
                  key={item.label}
                  direction="row" 
                  alignItems="center" 
                  spacing={0.5}
                >
                  {item.icon}
                  <Typography 
                    variant="body2" 
                    color="text.primary"
                    fontWeight={500}
                  >
                    {item.label}
                  </Typography>
                  {item.active && (
                    <Chip 
                      label="Actual" 
                      size="small" 
                      color="primary" 
                      variant="filled"
                      sx={{ 
                        height: 20,
                        fontSize: '0.688rem',
                        fontWeight: 500
                      }}
                    />
                  )}
                </Stack>
              ) : (
                <Link
                  key={item.label}
                  component={RouterLink}
                  to={item.path || '#'}
                  underline="hover"
                  color="inherit"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    textDecoration: 'none',
                    '&:hover': {
                      color: 'primary.main'
                    }
                  }}
                >
                  {item.icon}
                  <Typography variant="body2">
                    {item.label}
                  </Typography>
                </Link>
              );
            })}
          </Breadcrumbs>
        </Paper>

        {/* Contenido principal */}
        <Box>
          <CuentaList 
            showActions={true}
            onView={(cuenta) => {
              console.log('Ver cuenta:', cuenta);
              // TODO: Implementar modal de detalles o navegación
            }}
            onEdit={(cuenta) => {
              console.log('Editar cuenta:', cuenta);
              // TODO: Implementar navegación a formulario de edición
            }}
            onDelete={async (codCuenta) => {
              console.log('Eliminar cuenta:', codCuenta);
              // TODO: La eliminación ya está manejada en el componente
            }}
          />
        </Box>
      </Container>
    </MainLayout>
  );
};

export default CuentaConsultaPage;
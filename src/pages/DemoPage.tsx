// src/pages/DemoPage.tsx - Versión mejorada con Material-UI
import React, { FC, memo } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  useTheme,
  alpha,
  IconButton,
  Divider,
  Container,
  Stack,
  LinearProgress,
  Tooltip,
  Badge
} from '@mui/material';
import {
  People,
  Home,
  Assessment,
  TrendingUp,
  Assignment,
  AttachMoney,
  Dashboard,
  Brightness4,
  Brightness7,
  MenuOpen,
  Menu as MenuIcon,
  CheckCircle,
  PendingActions,
  Error as ErrorIcon,
  Info,
  Groups,
  HomeWork,
  Receipt
} from '@mui/icons-material';
import MainLayout from '../layout/MainLayout';
import { useTheme as useCustomTheme } from '../context/ThemeContext';
import { useSidebar } from '../context/SidebarContext';
import { useAuthContext } from '../context/AuthContext';


// Datos de ejemplo para las estadísticas
const stats = [
  { 
    title: 'Contribuyentes', 
    value: '2,345', 
    change: '+12%', 
    icon: People, 
    color: '#3B82F6',
    bgColor: 'rgba(59, 130, 246, 0.1)'
  },
  { 
    title: 'Predios Registrados', 
    value: '1,890', 
    change: '+8%', 
    icon: Home, 
    color: '#10B981',
    bgColor: 'rgba(16, 185, 129, 0.1)'
  },
  { 
    title: 'Recaudación Mensual', 
    value: 'S/ 125,450', 
    change: '+23%', 
    icon: AttachMoney, 
    color: '#8B5CF6',
    bgColor: 'rgba(139, 92, 246, 0.1)'
  },
  { 
    title: 'Reportes Generados', 
    value: '145', 
    change: '+5%', 
    icon: Assessment, 
    color: '#F59E0B',
    bgColor: 'rgba(245, 158, 11, 0.1)'
  }
];

// Actividades recientes
const recentActivities = [
  { id: 1, text: 'Nuevo contribuyente registrado', time: 'Hace 5 minutos', type: 'success' },
  { id: 2, text: 'Reporte de predios generado', time: 'Hace 1 hora', type: 'info' },
  { id: 3, text: 'Pago pendiente por verificar', time: 'Hace 2 horas', type: 'warning' },
  { id: 4, text: 'Actualización de datos completada', time: 'Hace 3 horas', type: 'success' },
];

// Accesos rápidos
const quickActions = [
  { title: 'Nuevo Contribuyente', icon: Groups, path: '/contribuyente/nuevo', color: '#3B82F6' },
  { title: 'Registrar Predio', icon: HomeWork, path: '/predio/nuevo', color: '#10B981' },
  { title: 'Generar Reporte', icon: Receipt, path: '/reportes', color: '#8B5CF6' },
  { title: 'Ver Dashboard', icon: Dashboard, path: '/dashboard', color: '#F59E0B' },
];

/**
 * Página de demostración con diseño mejorado usando Material-UI
 */
const DemoPage: FC = memo(() => {
  const muiTheme = useTheme();
  const { theme, toggleTheme } = useCustomTheme();
  const { isExpanded, toggleSidebar } = useSidebar();
  const { user } = useAuthContext();

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle sx={{ color: '#10B981' }} />;
      case 'warning':
        return <PendingActions sx={{ color: '#F59E0B' }} />;
      case 'error':
        return <ErrorIcon sx={{ color: '#EF4444' }} />;
      default:
        return <Info sx={{ color: '#3B82F6' }} />;
    }
  };

  return (
    <MainLayout title="Dashboard" disablePadding>
      <Box sx={{ 
        bgcolor: '#F4F7FA',
        minHeight: 'calc(100vh - 64px)',
        p: 0
      }}>
        <Box sx={{ p: 3 }}>
          {/* Header con bienvenida */}
          <Box sx={{ mb: 4 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" spacing={2}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#1F2937', mb: 1 }}>
                Bienvenido, {user?.nombreCompleto || user?.username || 'Usuario'} 👋
              </Typography>
              <Typography variant="body1" sx={{ color: '#6B7280' }}>
                Este es tu panel de control del Sistema de Gestión Tributaria
              </Typography>
            </Box>
            <Stack direction="row" spacing={2}>
              <Tooltip title={`Cambiar a modo ${theme === 'dark' ? 'claro' : 'oscuro'}`}>
                <IconButton 
                  onClick={toggleTheme}
                  sx={{ 
                    bgcolor: 'rgba(0, 0, 0, 0.04)',
                    '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.08)' }
                  }}
                >
                  {theme === 'dark' ? <Brightness7 /> : <Brightness4 />}
                </IconButton>
              </Tooltip>
              <Tooltip title={isExpanded ? 'Colapsar menú' : 'Expandir menú'}>
                <IconButton 
                  onClick={toggleSidebar}
                  sx={{ 
                    bgcolor: 'rgba(0, 0, 0, 0.04)',
                    '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.08)' }
                  }}
                >
                  {isExpanded ? <MenuOpen /> : <MenuIcon />}
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
        </Box>

        {/* Estadísticas principales */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {stats.map((stat) => (
            <Grid item xs={12} sm={6} md={3} key={stat.title}>
              <Card 
                elevation={0}
                sx={{ 
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 24px rgba(0, 0, 0, 0.1)',
                  }
                }}
              >
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    <Avatar
                      sx={{
                        bgcolor: stat.bgColor,
                        color: stat.color,
                        width: 56,
                        height: 56,
                      }}
                    >
                      <stat.icon fontSize="medium" />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ color: '#6B7280', mb: 0.5 }}>
                        {stat.title}
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: '#1F2937', mb: 0.5 }}>
                        {stat.value}
                      </Typography>
                      <Chip
                        label={stat.change}
                        size="small"
                        sx={{
                          bgcolor: alpha(stat.color, 0.1),
                          color: stat.color,
                          fontWeight: 600,
                          fontSize: '0.75rem',
                        }}
                        icon={<TrendingUp sx={{ fontSize: '1rem' }} />}
                      />
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3}>
          {/* Accesos rápidos */}
          <Grid item xs={12} md={8}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                height: '100%',
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Accesos Rápidos
              </Typography>
              <Grid container spacing={2}>
                {quickActions.map((action) => (
                  <Grid item xs={12} sm={6} key={action.title}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<action.icon />}
                      sx={{
                        py: 2,
                        borderColor: alpha(action.color, 0.3),
                        color: action.color,
                        bgcolor: alpha(action.color, 0.05),
                        '&:hover': {
                          borderColor: action.color,
                          bgcolor: alpha(action.color, 0.1),
                        },
                      }}
                    >
                      {action.title}
                    </Button>
                  </Grid>
                ))}
              </Grid>

              {/* Información del sistema */}
              <Box sx={{ mt: 4, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                  Información del Sistema
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Tema actual
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {theme === 'dark' ? 'Oscuro' : 'Claro'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Menú lateral
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {isExpanded ? 'Expandido' : 'Colapsado'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Usuario
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {user?.username || 'No identificado'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Roles
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {user?.roles?.join(', ') || 'Sin roles'}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </Grid>

          {/* Actividad reciente */}
          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                height: '100%',
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Actividad Reciente
                </Typography>
                <Badge badgeContent={4} color="primary">
                  <PendingActions color="action" />
                </Badge>
              </Stack>
              
              <List sx={{ py: 0 }}>
                {recentActivities.map((activity, index) => (
                  <React.Fragment key={activity.id}>
                    <ListItem
                      sx={{
                        px: 0,
                        py: 2,
                        '&:hover': {
                          bgcolor: 'grey.50',
                          borderRadius: 1,
                        },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        {getActivityIcon(activity.type)}
                      </ListItemIcon>
                      <ListItemText
                        primary={activity.text}
                        secondary={activity.time}
                        primaryTypographyProps={{
                          fontSize: '0.875rem',
                          fontWeight: 500,
                        }}
                        secondaryTypographyProps={{
                          fontSize: '0.75rem',
                        }}
                      />
                    </ListItem>
                    {index < recentActivities.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>

              <Button
                fullWidth
                variant="text"
                sx={{ mt: 2 }}
              >
                Ver toda la actividad
              </Button>
            </Paper>
          </Grid>
        </Grid>

        {/* Progreso del período */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mt: 3,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
            Progreso del Período Actual
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Meta de Recaudación
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    75%
                  </Typography>
                </Stack>
                <LinearProgress 
                  variant="determinate" 
                  value={75} 
                  sx={{ 
                    height: 8, 
                    borderRadius: 4,
                    bgcolor: 'grey.200',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: '#10B981',
                    }
                  }}
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Predios Actualizados
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    60%
                  </Typography>
                </Stack>
                <LinearProgress 
                  variant="determinate" 
                  value={60} 
                  sx={{ 
                    height: 8, 
                    borderRadius: 4,
                    bgcolor: 'grey.200',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: '#3B82F6',
                    }
                  }}
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Cobranza del Mes
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    85%
                  </Typography>
                </Stack>
                <LinearProgress 
                  variant="determinate" 
                  value={85} 
                  sx={{ 
                    height: 8, 
                    borderRadius: 4,
                    bgcolor: 'grey.200',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: '#8B5CF6',
                    }
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Paper>
        </Box>
      </Box>
    </MainLayout>
  );
});

// Nombre para DevTools
DemoPage.displayName = 'DemoPage';

export default DemoPage;
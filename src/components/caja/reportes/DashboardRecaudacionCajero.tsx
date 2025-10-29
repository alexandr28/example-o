// src/components/caja/reportes/DashboardRecaudacionCajero.tsx
import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Stack,
  Chip,
  Button,
  MenuItem,
  TextField
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  Assessment as AssessmentIcon,
  Download as DownloadIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

// Colores para gráficos
const COLORS = ['#1976d2', '#dc004e', '#f57c00', '#388e3c', '#7b1fa2'];

const DashboardRecaudacionCajero: React.FC = () => {
  const [periodo, setPeriodo] = useState('semana');

  // Datos de recaudación por cajero
  const datosRecaudacionCajero = useMemo(() => [
    { cajero: 'María G.', lunes: 3200, martes: 3500, miercoles: 3100, jueves: 3800, viernes: 4200, total: 17800 },
    { cajero: 'Juan P.', lunes: 2800, martes: 3200, miercoles: 2900, jueves: 3400, viernes: 3900, total: 16200 },
    { cajero: 'Carlos L.', lunes: 2500, martes: 2800, miercoles: 2600, jueves: 3100, viernes: 3500, total: 14500 },
    { cajero: 'Ana M.', lunes: 2900, martes: 3300, miercoles: 3000, jueves: 3600, viernes: 4000, total: 16800 }
  ], []);

  // Datos de forma de pago por cajero
  const datosFormaPago = useMemo(() => [
    { nombre: 'Efectivo', valor: 28500 },
    { nombre: 'Tarjeta', valor: 18200 },
    { nombre: 'Transferencia', valor: 14500 },
    { nombre: 'Yape/Plin', valor: 4100 }
  ], []);

  // Datos de rendimiento horario
  const datosRendimientoHorario = useMemo(() => [
    { hora: '08:00', transacciones: 5, monto: 1200 },
    { hora: '09:00', transacciones: 8, monto: 2100 },
    { hora: '10:00', transacciones: 12, monto: 3500 },
    { hora: '11:00', transacciones: 15, monto: 4200 },
    { hora: '12:00', transacciones: 10, monto: 2800 },
    { hora: '14:00', transacciones: 11, monto: 3100 },
    { hora: '15:00', transacciones: 13, monto: 3800 },
    { hora: '16:00', transacciones: 9, monto: 2500 },
    { hora: '17:00', transacciones: 6, monto: 1800 }
  ], []);

  // Datos de rendimiento por cajero (radar)
  const datosRendimiento = useMemo(() => [
    { indicador: 'Velocidad', Maria: 85, Juan: 78, Carlos: 72, Ana: 82 },
    { indicador: 'Exactitud', Maria: 92, Juan: 88, Carlos: 85, Ana: 90 },
    { indicador: 'Atención', Maria: 88, Juan: 85, Carlos: 82, Ana: 87 },
    { indicador: 'Productividad', Maria: 90, Juan: 82, Carlos: 78, Ana: 86 },
    { indicador: 'Puntualidad', Maria: 95, Juan: 90, Carlos: 88, Ana: 93 }
  ], []);

  // Calcular totales
  const totales = useMemo(() => {
    const totalRecaudado = datosRecaudacionCajero.reduce((sum, c) => sum + c.total, 0);
    const mejorCajero = datosRecaudacionCajero.reduce((max, c) => c.total > max.total ? c : max);
    const promedioRecaudacion = totalRecaudado / datosRecaudacionCajero.length;

    return { totalRecaudado, mejorCajero, promedioRecaudacion };
  }, [datosRecaudacionCajero]);

  return (
    <Stack spacing={3}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AssessmentIcon color="primary" />
            Dashboard de Recaudación por Cajero
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Análisis de rendimiento y recaudación por cajero
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            select
            label="Periodo"
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            size="small"
            sx={{ minWidth: 120 }}
          >
            <MenuItem value="semana">Esta Semana</MenuItem>
            <MenuItem value="mes">Este Mes</MenuItem>
            <MenuItem value="anio">Este Año</MenuItem>
          </TextField>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            size="small"
          >
            Exportar
          </Button>
        </Box>
      </Box>

      {/* Cards de resumen */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent>
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Recaudado
                  </Typography>
                  <MoneyIcon />
                </Box>
                <Typography variant="h4" fontWeight={700}>
                  S/ {totales.totalRecaudado.toLocaleString('es-PE')}
                </Typography>
                <Chip label="+8.5% vs semana anterior" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <CardContent>
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Mejor Cajero
                  </Typography>
                  <PersonIcon />
                </Box>
                <Typography variant="h5" fontWeight={700}>
                  {totales.mejorCajero.cajero}
                </Typography>
                <Chip label={`S/ ${totales.mejorCajero.total.toLocaleString('es-PE')}`} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
            <CardContent>
              <Stack spacing={1}>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Promedio por Cajero
                </Typography>
                <Typography variant="h4" fontWeight={700}>
                  S/ {totales.promedioRecaudacion.toLocaleString('es-PE', { maximumFractionDigits: 0 })}
                </Typography>
                <Chip label="4 cajeros activos" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}>
            <CardContent>
              <Stack spacing={1}>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Transacciones
                </Typography>
                <Typography variant="h4" fontWeight={700}>
                  289
                </Typography>
                <Chip label="Esta semana" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Gráficos principales */}
      <Grid container spacing={3}>
        {/* Recaudación por cajero */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingUpIcon color="primary" />
              Recaudación por Cajero (Semanal)
            </Typography>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={datosRecaudacionCajero}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="cajero" />
                <YAxis />
                <Tooltip formatter={(value: any) => `S/ ${value.toLocaleString('es-PE')}`} />
                <Legend />
                <Bar dataKey="lunes" fill="#1976d2" name="Lunes" />
                <Bar dataKey="martes" fill="#dc004e" name="Martes" />
                <Bar dataKey="miercoles" fill="#f57c00" name="Miércoles" />
                <Bar dataKey="jueves" fill="#388e3c" name="Jueves" />
                <Bar dataKey="viernes" fill="#7b1fa2" name="Viernes" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Distribución por forma de pago */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Formas de Pago
            </Typography>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={datosFormaPago}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.nombre}: ${((entry.valor / datosFormaPago.reduce((sum, d) => sum + d.valor, 0)) * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="valor"
                >
                  {datosFormaPago.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => `S/ ${value.toLocaleString('es-PE')}`} />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Rendimiento horario */}
        <Grid item xs={12} lg={7}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Rendimiento por Hora
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={datosRendimientoHorario}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hora" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="transacciones" stroke="#1976d2" strokeWidth={2} name="Transacciones" />
                <Line yAxisId="right" type="monotone" dataKey="monto" stroke="#dc004e" strokeWidth={2} name="Monto (S/)" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Radar de rendimiento */}
        <Grid item xs={12} lg={5}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Indicadores de Rendimiento
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={datosRendimiento}>
                <PolarGrid />
                <PolarAngleAxis dataKey="indicador" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar name="María" dataKey="Maria" stroke="#1976d2" fill="#1976d2" fillOpacity={0.6} />
                <Radar name="Juan" dataKey="Juan" stroke="#dc004e" fill="#dc004e" fillOpacity={0.6} />
                <Radar name="Ana" dataKey="Ana" stroke="#388e3c" fill="#388e3c" fillOpacity={0.6} />
                <Legend />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Stack>
  );
};

export default DashboardRecaudacionCajero;

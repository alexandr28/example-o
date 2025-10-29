// src/components/reportes/ReportesRecaudacion.tsx
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
  Download as DownloadIcon
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
  AreaChart,
  Area
} from 'recharts';

// Colores para gráficos
const COLORS = ['#1976d2', '#dc004e', '#f57c00', '#388e3c', '#7b1fa2', '#0288d1'];

const ReportesRecaudacion: React.FC = () => {
  const [periodo, setPeriodo] = useState('2024');

  // Datos de ejemplo - En producción vendrían de la API
  const datosRecaudacionMensual = useMemo(() => [
    { mes: 'Ene', impPredial: 45000, arbitrios: 12000, alcabala: 8000, multas: 3500 },
    { mes: 'Feb', impPredial: 48000, arbitrios: 13500, alcabala: 9500, multas: 4200 },
    { mes: 'Mar', impPredial: 52000, arbitrios: 14000, alcabala: 11000, multas: 4800 },
    { mes: 'Abr', impPredial: 47000, arbitrios: 13800, alcabala: 9800, multas: 4100 },
    { mes: 'May', impPredial: 55000, arbitrios: 15000, alcabala: 12000, multas: 5500 },
    { mes: 'Jun', impPredial: 58000, arbitrios: 16200, alcabala: 13500, multas: 6000 },
    { mes: 'Jul', impPredial: 61000, arbitrios: 17000, alcabala: 14000, multas: 6500 },
    { mes: 'Ago', impPredial: 59000, arbitrios: 16500, alcabala: 13200, multas: 6200 },
    { mes: 'Sep', impPredial: 62000, arbitrios: 17500, alcabala: 15000, multas: 7000 },
    { mes: 'Oct', impPredial: 64000, arbitrios: 18000, alcabala: 15500, multas: 7200 },
    { mes: 'Nov', impPredial: 66000, arbitrios: 18500, alcabala: 16000, multas: 7500 },
    { mes: 'Dic', impPredial: 70000, arbitrios: 20000, alcabala: 18000, multas: 8000 }
  ], []);

  const datosDistribucion = useMemo(() => [
    { nombre: 'Impuesto Predial', valor: 687000 },
    { nombre: 'Arbitrios', valor: 192000 },
    { nombre: 'Alcabala', valor: 155500 },
    { nombre: 'Multas', valor: 70500 }
  ], []);

  const datosTendencia = useMemo(() => [
    { periodo: '2020', total: 850000 },
    { periodo: '2021', total: 920000 },
    { periodo: '2022', total: 980000 },
    { periodo: '2023', total: 1050000 },
    { periodo: '2024', total: 1105000 }
  ], []);

  // Calcular totales
  const totales = useMemo(() => {
    const total = datosRecaudacionMensual.reduce((acc, mes) => ({
      impPredial: acc.impPredial + mes.impPredial,
      arbitrios: acc.arbitrios + mes.arbitrios,
      alcabala: acc.alcabala + mes.alcabala,
      multas: acc.multas + mes.multas
    }), { impPredial: 0, arbitrios: 0, alcabala: 0, multas: 0 });

    const totalGeneral = total.impPredial + total.arbitrios + total.alcabala + total.multas;

    return { ...total, totalGeneral };
  }, [datosRecaudacionMensual]);

  const handleExportarDashboard = () => {
    alert('Funcionalidad de exportación en desarrollo');
  };

  return (
    <Stack spacing={3}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AssessmentIcon color="primary" />
            Dashboard Analítico de Recaudación
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Análisis gráfico de la recaudación tributaria del sistema
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
            <MenuItem value="2024">2024</MenuItem>
            <MenuItem value="2023">2023</MenuItem>
            <MenuItem value="2022">2022</MenuItem>
          </TextField>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExportarDashboard}
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
                  S/ {totales.totalGeneral.toLocaleString('es-PE')}
                </Typography>
                <Chip label="+12.5% vs año anterior" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <CardContent>
              <Stack spacing={1}>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Impuesto Predial
                </Typography>
                <Typography variant="h4" fontWeight={700}>
                  S/ {totales.impPredial.toLocaleString('es-PE')}
                </Typography>
                <Chip label="62.2% del total" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
            <CardContent>
              <Stack spacing={1}>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Arbitrios
                </Typography>
                <Typography variant="h4" fontWeight={700}>
                  S/ {totales.arbitrios.toLocaleString('es-PE')}
                </Typography>
                <Chip label="17.4% del total" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}>
            <CardContent>
              <Stack spacing={1}>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Alcabala y Multas
                </Typography>
                <Typography variant="h4" fontWeight={700}>
                  S/ {(totales.alcabala + totales.multas).toLocaleString('es-PE')}
                </Typography>
                <Chip label="20.4% del total" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Gráficos principales */}
      <Grid container spacing={3}>
        {/* Gráfico de barras - Recaudación mensual */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingUpIcon color="primary" />
              Recaudación Mensual por Concepto
            </Typography>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={datosRecaudacionMensual}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip formatter={(value: any) => `S/ ${value.toLocaleString('es-PE')}`} />
                <Legend />
                <Bar dataKey="impPredial" fill="#1976d2" name="Imp. Predial" />
                <Bar dataKey="arbitrios" fill="#dc004e" name="Arbitrios" />
                <Bar dataKey="alcabala" fill="#f57c00" name="Alcabala" />
                <Bar dataKey="multas" fill="#388e3c" name="Multas" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Gráfico de torta - Distribución */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Distribución de Ingresos
            </Typography>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={datosDistribucion}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.nombre}: ${((entry.valor / totales.totalGeneral) * 100).toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="valor"
                >
                  {datosDistribucion.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => `S/ ${value.toLocaleString('es-PE')}`} />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Gráfico de líneas - Tendencia anual */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Tendencia de Recaudación Anual
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={datosTendencia}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="periodo" />
                <YAxis />
                <Tooltip formatter={(value: any) => `S/ ${value.toLocaleString('es-PE')}`} />
                <Legend />
                <Line type="monotone" dataKey="total" stroke="#1976d2" strokeWidth={3} name="Total Recaudado" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Gráfico de área - Acumulado */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recaudación Acumulada {periodo}
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart
                data={datosRecaudacionMensual.map((item, index) => ({
                  ...item,
                  acumulado: datosRecaudacionMensual
                    .slice(0, index + 1)
                    .reduce((sum, m) => sum + m.impPredial + m.arbitrios + m.alcabala + m.multas, 0)
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip formatter={(value: any) => `S/ ${value.toLocaleString('es-PE')}`} />
                <Area type="monotone" dataKey="acumulado" stroke="#1976d2" fill="#1976d2" fillOpacity={0.6} name="Acumulado" />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Stack>
  );
};

export default ReportesRecaudacion;

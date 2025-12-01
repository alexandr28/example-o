// src/pages/predio/puhr/ConsultaPUHRPage.tsx
import React, { useState } from 'react';
import {
  Box,
  Paper,
  Tabs,
  Tab,
  Typography
} from '@mui/material';
import {
  Person as PersonIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import MainLayout from '../../../layout/MainLayout';
import PU from '../../../components/predio/pu/PU';
import HR from '../../../components/predio/hr/HR';

const ConsultaPUHRPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <MainLayout title="Consulta PU / HR">
      <Box sx={{ p: 3 }}>
        {/* Título de la página */}
        <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
          Consulta PU / Hoja de Resumen
        </Typography>

        {/* Tabs principales: PU y HR */}
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              '& .MuiTab-root': {
                fontWeight: 600,
                fontSize: '1rem'
              }
            }}
          >
            <Tab
              label="PU (Predio Urbano)"
              icon={<PersonIcon />}
              iconPosition="start"
            />
            <Tab
              label="HR (Hoja de Resumen)"
              icon={<DescriptionIcon />}
              iconPosition="start"
            />
          </Tabs>
        </Paper>

        {/* Panel de PU */}
        {activeTab === 0 && (
          <Box>
            <PU />
          </Box>
        )}

        {/* Panel de HR */}
        {activeTab === 1 && (
          <Box>
            <HR />
          </Box>
        )}
      </Box>
    </MainLayout>
  );
};

export default ConsultaPUHRPage;

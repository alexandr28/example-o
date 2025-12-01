// src/pages/usuarios/UsersPage.tsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Container, Tabs, Tab, Paper } from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  Search as SearchIcon,
  VpnKey as VpnKeyIcon,
  MoreHoriz as MoreIcon
} from '@mui/icons-material';
import MainLayout from '../../layout/MainLayout';
import CrearUsers from '../../components/usuarios/CrearUsers';
import ConsultaUsers from '../../components/usuarios/ConsultaUsers';
import RePassword from '../../components/usuarios/RePassword';
import Options from '../../components/usuarios/Options';

// Interface para TabPanel
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`users-tabpanel-${index}`}
      aria-labelledby={`users-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `users-tab-${index}`,
    'aria-controls': `users-tabpanel-${index}`,
  };
}

const UsersPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);

  // Determinar tab segun la ruta actual
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('crear-cuenta')) {
      setTabValue(0);
    } else if (path.includes('consulta')) {
      setTabValue(1);
    } else if (path.includes('recuperar-password')) {
      setTabValue(2);
    } else if (path.includes('otras-opciones')) {
      setTabValue(3);
    }
  }, [location.pathname]);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);

    // Navegar a la ruta correspondiente
    if (newValue === 0) {
      navigate('/usuarios/crear-cuenta');
    } else if (newValue === 1) {
      navigate('/usuarios/consulta');
    } else if (newValue === 2) {
      navigate('/usuarios/recuperar-password');
    } else if (newValue === 3) {
      navigate('/usuarios/otras-opciones');
    }
  };

  return (
    <MainLayout>
      <Container maxWidth="lg">
        <Box sx={{ py: 3 }}>
          <Paper elevation={2}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs
                value={tabValue}
                onChange={handleChange}
                variant="fullWidth"
                sx={{
                  '& .MuiTab-root': {
                    minHeight: 64,
                    textTransform: 'none',
                    fontSize: '1rem',
                    fontWeight: 500,
                  }
                }}
              >
                <Tab
                  icon={<PersonAddIcon />}
                  iconPosition="start"
                  label="Registro Usuarios"
                  {...a11yProps(0)}
                />
                <Tab
                  icon={<SearchIcon />}
                  iconPosition="start"
                  label="Consulta Usuarios"
                  {...a11yProps(1)}
                />
                <Tab
                  icon={<VpnKeyIcon />}
                  iconPosition="start"
                  label="Cambiar Password"
                  {...a11yProps(2)}
                />
                <Tab
                  icon={<MoreIcon />}
                  iconPosition="start"
                  label="Otras Opciones"
                  {...a11yProps(3)}
                />
              </Tabs>
            </Box>

            <TabPanel value={tabValue} index={0}>
              <CrearUsers />
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <ConsultaUsers />
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <RePassword />
            </TabPanel>

            <TabPanel value={tabValue} index={3}>
              <Options />
            </TabPanel>
          </Paper>
        </Box>
      </Container>
    </MainLayout>
  );
};

export default UsersPage;

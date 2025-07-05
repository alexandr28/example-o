// src/pages/contribuyente/NuevoContribuyente.tsx - Versión con Material-UI
import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Alert,
  Collapse,
  LinearProgress
} from '@mui/material';
import { MainLayout } from '../../layout';
import { Breadcrumb, NotificationContainer } from '../../components';
import { BreadcrumbItem } from '../../components/utils/Breadcrumb';
import ContribuyenteFormMUI from '../../components/contribuyentes/ContribuyenteForm';
import { useContribuyenteAPI } from '../../hooks/useContribuyenteApi';
import { NotificationService } from '../../components/utils/Notification';

/**
 * Página para crear un nuevo contribuyente con Material-UI
 */
const NuevoContribuyente: React.FC = () => {
  const navigate = useNavigate();
  const { guardarContribuyente } = useContribuyenteAPI();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Definir las migas de pan para la navegación
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Módulo', path: '/' },
    { label: 'Contribuyente', path: '/contribuyente' },
    { label: 'Nuevo contribuyente', active: true }
  ];

  // Función para mostrar mensaje temporal
  const showMessage = (message: string, type: 'success' | 'error' = 'success', duration = 5000) => {
    if (type === 'success') {
      setSuccessMessage(message);
      setError(null);
    } else {
      setError(message);
      setSuccessMessage(null);
    }
    
    setTimeout(() => {
      setSuccessMessage(null);
      setError(null);
    }, duration);
  };

  // Manejar el guardado del contribuyente
  const handleSubmit = useCallback(async (formData: any) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📤 [NuevoContribuyente] Guardando contribuyente:', formData);
      
      await guardarContribuyente(formData);
      
      showMessage('✅ Contribuyente guardado exitosamente', 'success');
      
      // Redirigir después de un breve delay
      setTimeout(() => {
        navigate('/contribuyente/consulta');
      }, 2000);
      
    } catch (error: any) {
      console.error('❌ [NuevoContribuyente] Error al guardar:', error);
      showMessage(
        `❌ Error al guardar: ${error.message || 'Error desconocido'}`,
        'error'
      );
    } finally {
      setLoading(false);
    }
  }, [guardarContribuyente, navigate]);

  // Manejar edición (por implementar)
  const handleEdit = useCallback(() => {
    NotificationService.info('Función de edición en desarrollo');
  }, []);

  // Manejar nuevo (limpiar formulario)
  const handleNew = useCallback(() => {
    setError(null);
    setSuccessMessage(null);
    NotificationService.info('Formulario limpiado');
  }, []);

  return (
    <MainLayout title="Nuevo Contribuyente">
      <Box sx={{ p: 3 }}>
        {/* Navegación de migas de pan */}
        <Box sx={{ mb: 3 }}>
          <Breadcrumb items={breadcrumbItems} />
        </Box>

        {/* Progress bar */}
        {loading && (
          <Box sx={{ width: '100%', mb: 2 }}>
            <LinearProgress />
          </Box>
        )}

        {/* Mensaje de éxito */}
        <Collapse in={!!successMessage}>
          <Alert 
            severity="success" 
            sx={{ mb: 2 }}
            onClose={() => setSuccessMessage(null)}
          >
            {successMessage}
          </Alert>
        </Collapse>

        {/* Mensaje de error */}
        <Collapse in={!!error}>
          <Alert 
            severity="error" 
            sx={{ mb: 2 }}
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        </Collapse>

        {/* Formulario de contribuyente */}
        <ContribuyenteFormMUI
          onSubmit={handleSubmit}
          onEdit={handleEdit}
          onNew={handleNew}
          loading={loading}
        />
        
        {/* Contenedor de notificaciones */}
        <NotificationContainer />
      </Box>
    </MainLayout>
  );
};

export default NuevoContribuyente;
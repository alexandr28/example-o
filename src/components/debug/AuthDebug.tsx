// src/components/debug/AuthDebug.tsx
import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Alert,
  Stack,
  Chip,
  IconButton,
  Collapse
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  ContentCopy as CopyIcon,
  Refresh as RefreshIcon,
  Login as LoginIcon,
  Check as CheckIcon
} from '@mui/icons-material';

const AuthDebug: React.FC = () => {
  const [showToken, setShowToken] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(true);
  
  // Obtener información de autenticación
  const token = localStorage.getItem('auth_token');
  const userId = localStorage.getItem('userId');
  const userName = localStorage.getItem('userName');
  
  // Decodificar token JWT (básico)
  const decodeToken = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (error) {
      return null;
    }
  };
  
  const tokenData = token ? decodeToken(token) : null;
  const isExpired = tokenData && tokenData.exp ? new Date(tokenData.exp * 1000) < new Date() : false;
  
  // Copiar token
  const copyToken = () => {
    if (token) {
      navigator.clipboard.writeText(token);
      alert('Token copiado al portapapeles');
    }
  };
  
  // Test de API
  const testApiCall = async () => {
    setTestResult({ loading: true });
    
    try {
      const response = await fetch('/api/contribuyente?codigoContribuyente=1&codigoPersona=0', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        credentials: 'include'
      });
      
      const data = response.ok ? await response.json() : null;
      
      setTestResult({
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        data: data,
        headers: Object.fromEntries(response.headers.entries())
      });
    } catch (error: any) {
      setTestResult({
        error: error.message,
        stack: error.stack
      });
    }
  };
  
  // Login manual
  const doManualLogin = async () => {
    try {
      const response = await fetch('/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: 'admin',
          password: 'admin123'
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.token) {
          localStorage.setItem('auth_token', data.token);
          window.location.reload();
        }
      }
    } catch (error) {
      console.error('Error en login:', error);
    }
  };
  
  if (!isVisible) {
    return (
      <Box sx={{ position: 'fixed', bottom: 20, right: 20, zIndex: 9999 }}>
        <Button 
          variant="contained" 
          size="small"
          onClick={() => setIsVisible(true)}
        >
          Auth Debug
        </Button>
      </Box>
    );
  }
  
  return (
    <Box sx={{ position: 'fixed', bottom: 20, right: 20, zIndex: 9999, maxWidth: 500 }}>
      <Paper elevation={4} sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">🔐 Auth Debug</Typography>
          <IconButton size="small" onClick={() => setIsVisible(false)}>
            ×
          </IconButton>
        </Box>
        
        <Stack spacing={2}>
          {/* Estado de autenticación */}
          <Alert severity={token ? (isExpired ? 'warning' : 'success') : 'error'}>
            {token 
              ? (isExpired ? 'Token expirado' : 'Autenticado')
              : 'No autenticado'
            }
          </Alert>
          
          {/* Info del usuario */}
          {userName && (
            <Box>
              <Typography variant="body2" color="text.secondary">Usuario:</Typography>
              <Typography variant="body1">{userName}</Typography>
            </Box>
          )}
          
          {/* Token */}
          {token && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="body2" color="text.secondary">Token:</Typography>
                <IconButton size="small" onClick={() => setShowToken(!showToken)}>
                  {showToken ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
                <IconButton size="small" onClick={copyToken}>
                  <CopyIcon />
                </IconButton>
              </Box>
              
              {showToken && (
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  value={token}
                  size="small"
                  InputProps={{ readOnly: true }}
                />
              )}
              
              {tokenData && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Expira: {new Date(tokenData.exp * 1000).toLocaleString()}
                  </Typography>
                  {isExpired && (
                    <Chip 
                      label="EXPIRADO" 
                      color="error" 
                      size="small" 
                      sx={{ ml: 1 }}
                    />
                  )}
                </Box>
              )}
            </Box>
          )}
          
          {/* Botones de acción */}
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<RefreshIcon />}
              onClick={testApiCall}
            >
              Test API
            </Button>
            
            {!token && (
              <Button
                variant="contained"
                size="small"
                startIcon={<LoginIcon />}
                onClick={doManualLogin}
              >
                Login (admin)
              </Button>
            )}
          </Stack>
          
          {/* Resultado del test */}
          {testResult && (
            <Collapse in={true}>
              <Alert 
                severity={testResult.ok ? 'success' : 'error'}
                sx={{ mt: 1 }}
              >
                <Typography variant="body2">
                  Status: {testResult.status} {testResult.statusText}
                </Typography>
                {testResult.error && (
                  <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                    Error: {testResult.error}
                  </Typography>
                )}
              </Alert>
              
              {testResult.data && (
                <Box sx={{ mt: 1, p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
                  <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                    {JSON.stringify(testResult.data, null, 2).substring(0, 200)}...
                  </Typography>
                </Box>
              )}
            </Collapse>
          )}
        </Stack>
      </Paper>
    </Box>
  );
};

export default AuthDebug;
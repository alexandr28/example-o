// src/components/modal/SelectorDireccionArancel.tsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  useTheme,
  alpha,
  Stack,
  Divider
} from '@mui/material';
import {
  Close as CloseIcon,
  LocationOn as LocationIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';

import { ListaArancelesPorDireccion } from '../aranceles/ListaArancelesPorDireccion';
import { ArancelData } from '../../services/arancelService';

interface SelectorDireccionArancelProps {
  open: boolean;
  onClose: () => void;
  onSelectArancel?: (arancel: ArancelData) => void;
  title?: string;
}

const SelectorDireccionArancel: React.FC<SelectorDireccionArancelProps> = ({
  open,
  onClose,
  onSelectArancel,
  title = "Selector de Dirección con Arancel"
}) => {
  const theme = useTheme();
  const [selectedArancel, setSelectedArancel] = useState<ArancelData | null>(null);

  const handleSelectArancel = (arancel: ArancelData) => {
    setSelectedArancel(arancel);
  };

  const handleConfirmSelection = () => {
    if (selectedArancel && onSelectArancel) {
      onSelectArancel(selectedArancel);
    }
    onClose();
  };

  const handleClose = () => {
    setSelectedArancel(null);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          minHeight: '70vh',
          maxHeight: '90vh',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          boxShadow: theme.shadows[20],
        }
      }}
    >
    

      {/* Contenido */}
      <DialogContent 
        sx={{ 
          p: 0,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflow: 'hidden'
        }}
      >
        {/* Informaci�n adicional */}
        <Box sx={{ 
          p: 3, 
          pb: 2,
          background: alpha(theme.palette.primary.main, 0.02),
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Box sx={{
              p: 1,
              borderRadius: 1,
              backgroundColor: theme.palette.primary.main,
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: 36,
              height: 36
            }}>
              <AssignmentIcon fontSize="small" />
            </Box>
            <Box>
              <Typography variant="subtitle2" fontWeight={600} color="primary.main">
                Lista de Aranceles
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Los aranceles se cargan por año y muestran los costos por dirección
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* Contenido principal - Lista de aranceles */}
        <Box sx={{ 
          flex: 1, 
          overflow: 'auto',
          p: 2
        }}>
          <ListaArancelesPorDireccion 
            onSelectArancel={handleSelectArancel}
            selectedArancelId={selectedArancel?.codArancel || null}
            selectionMode={true}
          />
        </Box>
      </DialogContent>

      {/* Footer */}
      <DialogActions
        sx={{
          p: 3,
          borderTop: '1px solid',
          borderColor: 'divider',
          background: alpha(theme.palette.grey[50], 0.8),
          justifyContent: 'space-between'
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Tip: Seleccione un a�o para ver los aranceles disponibles
        </Typography>
        
        <Stack direction="row" spacing={2}>
          <Button
            onClick={handleClose}
            variant="outlined"
            sx={{
              textTransform: 'none',
              borderRadius: 2,
              minWidth: 100
            }}
          >
            Cancelar
          </Button>
          
          <Button
            onClick={handleConfirmSelection}
            variant="contained"
            disabled={!selectedArancel}
            sx={{
              textTransform: 'none',
              borderRadius: 2,
              minWidth: 120
            }}
          >
            Seleccionar
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export default SelectorDireccionArancel;
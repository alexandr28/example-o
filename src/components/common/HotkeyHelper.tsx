// src/components/common/HotkeyHelper.tsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Fab,
  Chip,
  Typography,
  Box
} from '@mui/material';
import {
  Help as HelpIcon,
  Close as CloseIcon,
  Keyboard as KeyboardIcon
} from '@mui/icons-material';
import { useCommands } from '../../context/CommandContext';
import { formatHotkey } from '../../hooks/useHotkeys';

interface HotkeyHelperProps {
  showButton?: boolean;
}

const HotkeyHelper: React.FC<HotkeyHelperProps> = ({ showButton = true }) => {
  const [open, setOpen] = useState(false);
  const { activeModule, getModuleCommands } = useCommands();

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const commands = activeModule ? getModuleCommands(activeModule) : [];

  return (
    <>
      {/* Botón flotante para abrir la ayuda */}
      {showButton && (
        <Fab
          color="primary"
          aria-label="atajos de teclado"
          onClick={handleOpen}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: 1000
          }}
          size="small"
        >
          <KeyboardIcon />
        </Fab>
      )}

      {/* Dialog con la tabla de atajos */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex" alignItems="center" gap={1}>
              <KeyboardIcon color="primary" />
              <Typography variant="h6">
                Atajos de Teclado
              </Typography>
              {activeModule && (
                <Chip
                  label={activeModule}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              )}
            </Box>
            <IconButton onClick={handleClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          {commands.length === 0 ? (
            <Box py={4} textAlign="center">
              <Typography color="text.secondary">
                No hay atajos de teclado disponibles para este módulo
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell><strong>Atajo</strong></TableCell>
                    <TableCell><strong>Comando</strong></TableCell>
                    <TableCell><strong>Descripción</strong></TableCell>
                    <TableCell align="center"><strong>Estado</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {commands.map((command) => (
                    <TableRow key={command.id} hover>
                      <TableCell>
                        <Chip
                          label={formatHotkey(command.hotkey)}
                          size="small"
                          variant="outlined"
                          sx={{
                            fontFamily: 'monospace',
                            fontWeight: 'bold'
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {command.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {command.description}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={command.enabled === false ? 'Deshabilitado' : 'Activo'}
                          size="small"
                          color={command.enabled === false ? 'default' : 'success'}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          <Box mt={2} p={2} bgcolor="#f5f5f5" borderRadius={1}>
            <Typography variant="caption" color="text.secondary">
              <strong>Tip:</strong> Estos atajos están activos solo cuando este módulo está en foco.
              Presiona <Chip label="?" size="small" /> en cualquier momento para ver esta ayuda.
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default HotkeyHelper;

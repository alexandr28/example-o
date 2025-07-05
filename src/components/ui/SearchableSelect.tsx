// src/components/ui/SearchableSelect.tsx
import React from 'react';
import {
  Autocomplete,
  TextField,
  Box,
  Typography,
  Chip,
  CircularProgress,
  AutocompleteProps,
  TextFieldProps
} from '@mui/material';

export interface SearchableOption {
  id: number | string;
  label: string;
  [key: string]: any; // Para propiedades adicionales
}

interface SearchableSelectProps<T extends SearchableOption> {
  // Propiedades básicas
  id?: string;
  label: string;
  options: T[];
  value: T | null;
  onChange: (value: T | null) => void;
  
  // Propiedades de estado
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
  loading?: boolean;
  required?: boolean;
  
  // Personalización
  placeholder?: string;
  noOptionsText?: string;
  startIcon?: React.ReactNode;
  
  // Funciones de renderizado personalizadas
  getOptionLabel?: (option: T) => string;
  renderOption?: (props: React.HTMLAttributes<HTMLLIElement>, option: T) => React.ReactNode;
  
  // Props adicionales
  textFieldProps?: Partial<TextFieldProps>;
  autocompleteProps?: Partial<AutocompleteProps<T, false, false, false>>;
}

/**
 * Componente SearchableSelect reutilizable
 * Permite búsqueda y filtrado en tiempo real
 */
function SearchableSelect<T extends SearchableOption>({
  id,
  label,
  options,
  value,
  onChange,
  error = false,
  helperText,
  disabled = false,
  loading = false,
  required = false,
  placeholder = "Buscar...",
  noOptionsText = "No se encontraron opciones",
  startIcon,
  getOptionLabel,
  renderOption,
  textFieldProps = {},
  autocompleteProps = {}
}: SearchableSelectProps<T>) {
  
  // Función por defecto para obtener el label
  const defaultGetOptionLabel = (option: T) => option.label || '';
  
  // Función por defecto para renderizar opciones
  const defaultRenderOption = (props: React.HTMLAttributes<HTMLLIElement>, option: T) => (
    <Box component="li" {...props}>
      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
        <Typography>{option.label}</Typography>
        {/* Renderizar chips de estado si existen */}
        {option.estado !== undefined && (
          <Chip
            label={option.estado ? 'Activo' : 'Inactivo'}
            size="small"
            color={option.estado ? 'success' : 'error'}
            variant="outlined"
          />
        )}
        {option.status && (
          <Chip
            label={option.status}
            size="small"
            color="info"
            variant="outlined"
          />
        )}
      </Box>
    </Box>
  );
  
  return (
    <Autocomplete
      id={id}
      options={options}
      getOptionLabel={getOptionLabel || defaultGetOptionLabel}
      value={value}
      onChange={(event, newValue) => onChange(newValue)}
      disabled={disabled}
      loading={loading}
      renderInput={(params) => (
        <TextField
          {...params}
          {...textFieldProps}
          label={label + (required ? ' *' : '')}
          error={error}
          helperText={helperText}
          placeholder={placeholder}
          InputProps={{
            ...params.InputProps,
            ...(textFieldProps.InputProps || {}),
            startAdornment: (
              <>
                {startIcon && (
                  <Box sx={{ display: 'flex', alignItems: 'center', ml: 1, mr: -0.5 }}>
                    {startIcon}
                  </Box>
                )}
                {params.InputProps.startAdornment}
              </>
            ),
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      renderOption={renderOption || defaultRenderOption}
      isOptionEqualToValue={(option, value) => option.id === value?.id}
      noOptionsText={noOptionsText}
      // Habilitar filtrado insensible a mayúsculas y con acentos
      filterOptions={(options, params) => {
        const filtered = options.filter((option) => {
          const label = (getOptionLabel || defaultGetOptionLabel)(option).toLowerCase();
          const inputValue = params.inputValue.toLowerCase();
          
          // Normalizar texto (quitar acentos)
          const normalizeText = (text: string) => {
            return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          };
          
          return normalizeText(label).includes(normalizeText(inputValue));
        });
        
        return filtered;
      }}
      // Props adicionales del Autocomplete
      {...autocompleteProps}
    />
  );
}

export default SearchableSelect;

// Exportar tipos para uso externo
export type { SearchableSelectProps };
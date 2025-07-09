// src/components/common/SearchableSelect.tsx
import React, { useState, useMemo } from 'react';
import {
  Autocomplete,
  TextField,
  Box,
  Typography,
  Chip,
  CircularProgress
} from '@mui/material';
import { Check as CheckIcon } from '@mui/icons-material';

interface Option {
  id?: any;
  value: any;
  label: string;
  description?: string;
  disabled?: boolean;
}

interface SearchableSelectProps {
  label: string;
  options: Option[];
  value: Option | Option[] | null;
  onChange: (value: Option | Option[] | null) => void;
  placeholder?: string;
  error?: boolean;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  loading?: boolean;
  multiple?: boolean;
  fullWidth?: boolean;
  size?: 'small' | 'medium';
  renderOption?: (props: React.HTMLAttributes<HTMLLIElement>, option: Option) => React.ReactNode;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder = 'Seleccione...',
  error = false,
  helperText,
  required = false,
  disabled = false,
  loading = false,
  multiple = false,
  fullWidth = true,
  size = 'small',
  renderOption
}) => {
  const [inputValue, setInputValue] = useState('');

  // Encontrar la opción seleccionada
  const selectedOption = useMemo(() => {
    if (!value) return null;
    
    if (multiple) {
      return value as Option[];
    }
    return value as Option;
  }, [value, multiple]);

  const handleChange = (_: any, newValue: Option | Option[] | null) => {
    onChange(newValue);
  };

  const defaultRenderOption = (props: React.HTMLAttributes<HTMLLIElement>, option: Option) => {
    const isSelected = multiple 
      ? (value as Option[])?.some(v => v.value === option.value)
      : (value as Option)?.value === option.value;

    return (
      <Box component="li" {...props}>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="body2">{option.label}</Typography>
          {option.description && (
            <Typography variant="caption" color="text.secondary">
              {option.description}
            </Typography>
          )}
        </Box>
        {isSelected && (
          <CheckIcon fontSize="small" color="primary" />
        )}
      </Box>
    );
  };

  return (
    <Autocomplete
      value={selectedOption}
      onChange={handleChange}
      inputValue={inputValue}
      onInputChange={(event, newInputValue) => setInputValue(newInputValue)}
      options={options}
      getOptionLabel={(option) => option.label}
      isOptionEqualToValue={(option, value) => option.value === value?.value}
      disabled={disabled || loading}
      multiple={multiple}
      fullWidth={fullWidth}
      size={size}
      loading={loading}
      loadingText="Cargando..."
      noOptionsText="Sin opciones"
      renderOption={renderOption || defaultRenderOption}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          error={error}
          helperText={helperText}
          required={required}
          slotProps={{
            input: {
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading ? <CircularProgress color="inherit" size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            },
          }}
        />
      )}
      // Para selección múltiple, renderizar chips personalizados
      renderValue={multiple ? (selected) => (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {(selected as Option[]).map((option) => (
            <Chip
              key={option.value}
              label={option.label}
              size="small"
              onDelete={() => {
                const newValue = (value as Option[]).filter(v => v.value !== option.value);
                onChange(newValue.length > 0 ? newValue : null);
              }}
            />
          ))}
        </Box>
      ) : undefined}
      sx={{
        '& .MuiAutocomplete-inputRoot': {
          paddingRight: '39px !important',
        }
      }}
    />
  );
};

export default SearchableSelect;
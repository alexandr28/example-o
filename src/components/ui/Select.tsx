import React from 'react';
import classNames from 'classnames';

interface Option {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: Option[];
  error?: string;
  placeholder?: string;
  fullWidth?: boolean;
}

const Select: React.FC<SelectProps> = ({
  label,
  options,
  error,
  placeholder = 'Seleccione',
  fullWidth = true,
  className,
  ...props
}) => {
  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && <label className="label">{label}</label>}
      <select
        className={classNames(
          'input',
          {
            'input-error': !!error,
          },
          className
        )}
        {...props}
        onChange={(e) => {
          console.log(`Select ${label} - value selected:`, e.target.value);
          props.onChange && props.onChange(e);
        }}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default Select;
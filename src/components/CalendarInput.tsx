import React from 'react';
import classNames from 'classnames';

interface CalendarInputProps {
  label?: string;
  value: string | null;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  className?: string;
}

const CalendarInput: React.FC<CalendarInputProps> = ({
  label,
  value,
  onChange,
  error,
  disabled = false,
  className,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="w-full">
      {label && <label className="label">{label}</label>}
      <div className="relative">
        <input
          type="date"
          title="calendar"
          value={value || ''}
          onChange={handleChange}
          disabled={disabled}
          className={classNames(
            'input pr-10',
            {
              'input-error': !!error,
              'bg-gray-100 cursor-not-allowed': disabled,
            },
            className
          )}
        />
       
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default CalendarInput;
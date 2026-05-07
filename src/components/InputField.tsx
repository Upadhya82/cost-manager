import { useId } from 'react';
import type { LucideIcon } from 'lucide-react';

interface InputFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'number' | 'text';
  icon?: LucideIcon;
  placeholder?: string;
  step?: string;
  min?: string;
  error?: string;
}

export const InputField = ({
  label,
  value,
  onChange,
  type = 'number',
  icon: Icon,
  placeholder = '0.00',
  step = '0.01',
  min,
  error,
}: InputFieldProps) => {
  const inputId = useId();

  return (
    <div className="mb-4 text-left">
      <label htmlFor={inputId} className="mb-1 flex items-center gap-2 text-sm font-semibold text-gray-700">
        {Icon ? <Icon size={16} className="text-blue-500" /> : null}
        {label}
      </label>
      <input
        id={inputId}
        type={type}
        step={step}
        min={min}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 font-medium text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
      />
      {error ? <p className="mt-1 text-xs font-medium text-red-600">{error}</p> : null}
    </div>
  );
};

'use client';

import { useFormContext } from 'react-hook-form';

import { Input, Textarea } from '@/components/ui/Input';

// ============================================================================
// FormInput - Connected to React Hook Form
// ============================================================================

export interface FormInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'name'> {
  name: string;
  label?: string;
  hint?: string;
}

export function FormInput({ name, label, hint, ...props }: FormInputProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const error = errors[name]?.message as string | undefined;

  return (
    <Input
      {...register(name)}
      label={label}
      error={error}
      hint={hint}
      {...props}
    />
  );
}

// ============================================================================
// FormTextarea - Connected to React Hook Form
// ============================================================================

export interface FormTextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'name'> {
  name: string;
  label?: string;
  hint?: string;
}

export function FormTextarea({ name, label, hint, ...props }: FormTextareaProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const error = errors[name]?.message as string | undefined;

  return (
    <Textarea
      {...register(name)}
      label={label}
      error={error}
      hint={hint}
      {...props}
    />
  );
}

// ============================================================================
// FormSelect - Connected to React Hook Form
// ============================================================================

export interface FormSelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'name'> {
  name: string;
  label?: string;
  hint?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export function FormSelect({
  name,
  label,
  hint,
  options,
  placeholder,
  className = '',
  ...props
}: FormSelectProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const error = errors[name]?.message as string | undefined;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-900 mb-1"
        >
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <select
        {...register(name)}
        id={name}
        className={`
          w-full px-3 py-2 border rounded-lg transition-colors
          text-gray-900 bg-white
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed
          ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}
          ${className}
        `}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      {hint && !error && <p className="mt-1 text-sm text-gray-600">{hint}</p>}
    </div>
  );
}

// ============================================================================
// FormCheckbox - Connected to React Hook Form
// ============================================================================

export interface FormCheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'name' | 'type'> {
  name: string;
  label: string;
}

export function FormCheckbox({ name, label, className = '', ...props }: FormCheckboxProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const error = errors[name]?.message as string | undefined;

  return (
    <div className="flex items-start">
      <div className="flex items-center h-5">
        <input
          {...register(name)}
          type="checkbox"
          id={name}
          className={`
            w-4 h-4 border rounded transition-colors
            text-blue-600 focus:ring-blue-500
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-red-500' : 'border-gray-300'}
            ${className}
          `}
          {...props}
        />
      </div>
      <div className="ml-3">
        <label htmlFor={name} className="text-sm text-gray-900">
          {label}
        </label>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
}

// ============================================================================
// FormRadioGroup - Connected to React Hook Form
// ============================================================================

export interface FormRadioGroupProps {
  name: string;
  label?: string;
  options: { value: string; label: string; description?: string }[];
  orientation?: 'horizontal' | 'vertical';
}

export function FormRadioGroup({
  name,
  label,
  options,
  orientation = 'vertical',
}: FormRadioGroupProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const error = errors[name]?.message as string | undefined;

  return (
    <fieldset>
      {label && (
        <legend className="block text-sm font-medium text-gray-900 mb-2">
          {label}
        </legend>
      )}

      <div
        className={`
          ${orientation === 'horizontal' ? 'flex flex-wrap gap-4' : 'space-y-2'}
        `}
      >
        {options.map((option) => (
          <div key={option.value} className="flex items-start">
            <div className="flex items-center h-5">
              <input
                {...register(name)}
                type="radio"
                id={`${name}-${option.value}`}
                value={option.value}
                className="w-4 h-4 border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>
            <div className="ml-3">
              <label
                htmlFor={`${name}-${option.value}`}
                className="text-sm text-gray-900"
              >
                {option.label}
              </label>
              {option.description && (
                <p className="text-sm text-gray-600">{option.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </fieldset>
  );
}

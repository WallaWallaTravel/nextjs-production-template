'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ReactNode } from 'react';
import {
  useForm,
  UseFormReturn,
  FieldValues,
  DefaultValues,
  UseFormProps,
  SubmitHandler,
  SubmitErrorHandler,
  FormProvider,
} from 'react-hook-form';
import { ZodSchema } from 'zod';

// ============================================================================
// Form Component
// ============================================================================

export interface FormProps<T extends FieldValues>
  extends Omit<React.FormHTMLAttributes<HTMLFormElement>, 'onSubmit' | 'onError' | 'children'> {
  schema: ZodSchema<T>;
  onSubmit: SubmitHandler<T>;
  onError?: SubmitErrorHandler<T>;
  defaultValues?: DefaultValues<T>;
  formOptions?: Omit<UseFormProps<T>, 'resolver' | 'defaultValues'>;
  children: ReactNode | ((form: UseFormReturn<T>) => ReactNode);
}

export function Form<T extends FieldValues>({
  schema,
  onSubmit,
  onError,
  defaultValues,
  formOptions,
  children,
  className,
  ...props
}: FormProps<T>) {
  const form = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues,
    ...formOptions,
  });

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, onError)}
        className={className}
        {...props}
      >
        {typeof children === 'function' ? children(form) : children}
      </form>
    </FormProvider>
  );
}

// ============================================================================
// useFormContext Hook (re-export for convenience)
// ============================================================================

export { useFormContext, useWatch, useFieldArray } from 'react-hook-form';

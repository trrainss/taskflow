import type { InputHTMLAttributes } from 'react';
import { cn } from '@/utils/helpers';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function TextField({ label, error, className, id, ...rest }: TextFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-slate-700 dark:text-slate-200">
          {label}
        </label>
      )}
      <input
        id={id}
        className={cn(
          'rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white',
          error && 'border-rose-500',
          className,
        )}
        {...rest}
      />
      {error && <span className="text-xs text-rose-600">{error}</span>}
    </div>
  );
}

import React from 'react';
import { motion } from 'framer-motion';
import { calculatorFieldShell, calculatorIconBadge } from './tailwind';

const InputField = ({
  label,
  icon,
  error,
  helper,
  children,
  tooltip,
  fieldKey,
  required = false,
  className = '',
}) => (
  <motion.label
    layout
    data-error-field={fieldKey}
    className={`calculator-input-field w-full ${calculatorFieldShell} ${className}`}
    title={tooltip}
    whileHover={{ y: -1 }}
  >
    <div className="calculator-input-field-header flex items-start justify-between gap-3">
      <div className="calculator-input-field-meta flex items-start gap-3">
        <span className={`calculator-input-field-icon ${calculatorIconBadge} h-10 w-10 rounded-xl text-[0.72rem]`}>
          {icon}
        </span>
        <div className="min-w-0 grid gap-1">
          <span className="calculator-input-field-label text-sm font-extrabold text-[#111111] dark:text-slate-50">
            {label}{' '}
            <span className={required ? 'required text-emerald-600 dark:text-emerald-300' : 'optional text-[#666666] dark:text-slate-400'}>
              {required ? 'Required' : 'Optional'}
            </span>
          </span>
          {helper ? <span className="calculator-input-field-helper text-xs leading-5 text-[#666666] dark:text-slate-400">{helper}</span> : null}
        </div>
      </div>
      {error ? (
        <span className="calculator-input-field-error rounded-full bg-rose-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-rose-700 dark:bg-rose-500/15 dark:text-rose-300">
          {error}
        </span>
      ) : null}
    </div>
    {children}
  </motion.label>
);

export default InputField;

import React from 'react';

export function Label({ children, className = "", ...rest }) {
  return (
    <label className={`text-sm font-medium text-slate-700 ${className}`} {...rest}>
      {children}
    </label>
  );
}

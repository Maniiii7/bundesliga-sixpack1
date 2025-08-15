import React from 'react';

export function Button({ children, onClick, variant = "default", size="md", className="" , ...rest}) {
  const base = "inline-flex items-center justify-center rounded-md border text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  const variants = {
    default: "bg-slate-900 text-white hover:bg-slate-800 border-transparent",
    outline: "bg-white text-slate-900 border-slate-200 hover:bg-slate-50",
    secondary: "bg-slate-100 text-slate-900 border-slate-200 hover:bg-slate-200",
    ghost: "bg-transparent border-transparent hover:bg-slate-100",
    destructive: "bg-red-600 text-white border-transparent hover:bg-red-700"
  };
  const sizes = {
    sm: "h-8 px-3",
    md: "h-9 px-4",
    lg: "h-10 px-6",
    icon: "h-9 w-9 p-0"
  };
  return (
    <button onClick={onClick} className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...rest}>
      {children}
    </button>
  );
}

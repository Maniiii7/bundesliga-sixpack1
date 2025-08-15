import React from 'react';

export function Input({ className = "", ...props }) {
  return <input className={`h-9 w-full rounded-md border border-slate-300 bg-white px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 ${className}`} {...props} />;
}
export function Textarea({ className = "", ...props }) {
  return <textarea className={`w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 ${className}`} {...props} />;
}
export function Label({ className = "", children }) {
  return <label className={`text-sm font-medium ${className}`}>{children}</label>;
}

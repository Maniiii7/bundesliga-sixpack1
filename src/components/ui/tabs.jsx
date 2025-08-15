
import React from 'react';

export function Tabs({ value, onValueChange, children }) {
  return <div data-tabs>{React.Children.map(children, child => child)}</div>;
}
export function TabsList({ className="", children }) {
  return <div className={`flex gap-2 flex-wrap ${className}`}>{children}</div>;
}
export function TabsTrigger({ value, className="", children, onClick }) {
  return (
    <button
      onClick={onClick}
      data-value={value}
      className={`px-3 h-9 rounded-md border text-sm ${className}`}
    >
      {children}
    </button>
  );
}
export function TabsContent({ value, children, activeValue }) {
  if (value !== activeValue) return null;
  return <div className="mt-4">{children}</div>;
}

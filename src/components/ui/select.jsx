import React, { useState } from 'react';

export function Select({ value, onValueChange, children }) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="relative">
      <div 
        className="flex items-center justify-between w-full px-3 py-2 border border-slate-200 rounded-md bg-white cursor-pointer hover:bg-slate-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        {children}
      </div>
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-md shadow-lg z-10">
          {React.Children.map(children, child => {
            if (React.isValidElement(child) && child.type === SelectContent) {
              return React.cloneElement(child, { onValueChange, value, onClose: () => setIsOpen(false) });
            }
            return null;
          })}
        </div>
      )}
    </div>
  );
}

export function SelectTrigger({ children }) { 
  return <div className="flex items-center justify-between w-full">{children}</div>; 
}

export function SelectValue({ placeholder, value }) { 
  return <span className={value ? "text-slate-900" : "text-slate-500"}>{value || placeholder}</span>; 
}

export function SelectContent({ children, onValueChange, onClose }) { 
  return (
    <div className="py-1">
      {React.Children.map(children, child => {
        if (React.isValidElement(child) && child.type === SelectItem) {
          return React.cloneElement(child, { onSelect: (value) => { onValueChange?.(value); onClose?.(); } });
        }
        return child;
      })}
    </div>
  ); 
}

export function SelectItem({ value, children, onSelect }) {
  return (
    <div 
      className="px-3 py-2 hover:bg-slate-100 cursor-pointer text-sm" 
      onClick={() => onSelect?.(value)}
    >
      {children}
    </div>
  );
}

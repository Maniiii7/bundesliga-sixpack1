
import React, { useState } from 'react';

export function Dialog({ open, onOpenChange, children }) {
  const [internalOpen, setInternalOpen] = useState(!!open);
  const isOpen = open !== undefined ? open : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;
  return (
    <div data-dialog>
      {React.Children.map(children, child => {
        if (!React.isValidElement(child)) return child;
        return React.cloneElement(child, { isOpen, setOpen });
      })}
    </div>
  );
}
export function DialogTrigger({ asChild, children, setOpen }) {
  const trigger = React.cloneElement(children, { onClick: ()=> setOpen(true) });
  return asChild ? trigger : <button onClick={()=>setOpen(true)}>{children}</button>;
}
export function DialogContent({ children, isOpen, setOpen }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={()=>setOpen(false)} />
      <div className="relative z-10 w-full max-w-lg rounded-xl border bg-white p-4 shadow-lg">
        {React.Children.map(children, child => React.isValidElement(child) ? React.cloneElement(child, { setOpen }) : child)}
      </div>
    </div>
  );
}
export function DialogHeader({ children }) { return <div className="mb-3">{children}</div>; }
export function DialogTitle({ children }) { return <h4 className="text-lg font-semibold">{children}</h4>; }
export function DialogFooter({ children }) { return <div className="mt-4 flex justify-end gap-2">{children}</div>; }

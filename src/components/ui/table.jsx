import React from 'react';

export function Table({ children }) { 
  return <div className="overflow-auto rounded-lg border bg-white"><table className="w-full">{children}</table></div>; 
}

export function TableHeader({ children }) { 
  return <thead className="bg-slate-50">{children}</thead>; 
}

export function TableBody({ children }) { 
  return <tbody>{children}</tbody>; 
}

export function TableRow({ children }) { 
  return <tr className="border-b last:border-0">{children}</tr>; 
}

export function TableHead({ className="", children }) { 
  return <th className={`px-3 py-2 text-left text-xs font-semibold text-slate-600 ${className}`}>{children}</th>; 
}

export function TableCell({ className="", children }) { 
  return <td className={`px-3 py-2 text-sm ${className}`}>{children}</td>; 
}

export function TableCaption({ children }) { 
  return <caption className="p-2 text-xs text-slate-500">{children}</caption>; 
}

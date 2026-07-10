import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function Input({ label, ...rest }: InputProps) {
  return (
    <div className="flex flex-col w-full mb-4">
      <label className="text-sm font-medium text-gray-800 mb-1">
        {label}
      </label>
      <input 
        className="w-full border border-gray-400 rounded-md px-3 py-2 text-sm text-gray-800 shadow-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        {...rest}
      />
    </div>
  );
}
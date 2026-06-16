import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
}

export function Button({ children, variant = 'primary', ...rest }: ButtonProps) {
  let baseClass = "w-full py-2 rounded-md font-medium text-sm transition-colors duration-200 focus:outline-none flex justify-center items-center";
  
  if (variant === 'primary') {
    // Azul claro do Figma
    baseClass += " bg-[#78A8D1] hover:bg-[#6393BC] text-white shadow-sm"; 
  } else if (variant === 'secondary') {
    // Botão preto da tela de recuperar senha
    baseClass += " bg-black hover:bg-gray-800 text-white shadow-sm";
  } else if (variant === 'outline') {
    // Botão com borda da tela de confirmação
    baseClass += " bg-transparent border border-gray-300 hover:bg-gray-50 text-gray-800";
  }

  return (
    <button className={baseClass} {...rest}>
      {children}
    </button>
  );
}
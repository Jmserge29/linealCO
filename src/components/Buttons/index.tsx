import React from 'react';

interface ButtonProps {
  // Contenido del botón
  text?: string;
  children?: React.ReactNode;
  
  // Eventos
  onClick?: () => void;
  
  // Estilos y variantes
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  
  // Estados
  disabled?: boolean;
  loading?: boolean;
  
  // Personalización
  className?: string;
  fullWidth?: boolean;
  
  // Atributos HTML
  type?: 'button' | 'submit' | 'reset';
  id?: string;
  
  // Iconos
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  text,
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  fullWidth = false,
  type = 'button',
  id,
  leftIcon,
  rightIcon,
}) => {
  // Estilos base
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 transform focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none';

  // Variantes de estilo
  const variants = {
    primary: 'bg-gradient-to-r from-rose-500 to-black text-white hover:from-rose-600 hover:to-gray-900 focus:ring-rose-500 hover:scale-105',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500 hover:scale-105',
    outline: 'border-2 border-rose-500 text-rose-500 hover:bg-rose-500 hover:text-white focus:ring-rose-500 hover:scale-105',
    ghost: 'text-rose-500 hover:bg-rose-50 focus:ring-rose-500 hover:scale-105',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500 hover:scale-105'
  };

  // Tamaños
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-6 py-2.5 text-base',
    lg: 'px-8 py-3 text-lg',
    xl: 'px-10 py-4 text-xl'
  };

  // Combinar clases
  const buttonClasses = `
    ${baseStyles}
    ${variants[variant]}
    ${sizes[size]}
    ${fullWidth ? 'w-full' : ''}
    ${disabled || loading ? 'hover:scale-100' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  // Contenido del botón
  const buttonContent = children || text || 'Button';

  return (
    <button
      type={type}
      id={id}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {/* Icono izquierdo */}
      {leftIcon && !loading && (
        <span className="mr-2 flex items-center">
          {leftIcon}
        </span>
      )}

      {/* Spinner de carga */}
      {loading && (
        <span className="mr-2 flex items-center">
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </span>
      )}

      {/* Texto del botón */}
      <span>{buttonContent}</span>

      {/* Icono derecho */}
      {rightIcon && !loading && (
        <span className="ml-2 flex items-center">
          {rightIcon}
        </span>
      )}
    </button>
  );
};
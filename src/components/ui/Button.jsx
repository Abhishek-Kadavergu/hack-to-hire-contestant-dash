import React from 'react';
import { motion } from 'framer-motion';

const Button = ({ 
  children, 
  variant = 'primary', 
  onClick, 
  type = 'button',
  className = '',
  disabled = false,
  fullWidth = false,
  icon,
  ...props 
}) => {
  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.5rem',
    borderRadius: 'var(--radius-lg)',
    fontFamily: 'inherit',
    fontWeight: 600,
    fontSize: '1rem',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.7 : 1,
    border: 'none',
    transition: 'all 0.2s ease',
    width: fullWidth ? '100%' : 'auto',
  };

  const variants = {
    primary: {
      background: 'var(--primary)',
      color: '#ffffff',
      boxShadow: '0 4px 14px 0 rgba(79, 70, 229, 0.39)',
    },
    secondary: {
      background: 'rgba(255, 255, 255, 0.8)',
      color: 'var(--text-primary)',
      border: '1px solid var(--border-color)',
      backdropFilter: 'blur(10px)',
    },
    outline: {
      background: 'transparent',
      color: 'var(--primary)',
      border: '2px solid var(--primary)',
    }
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={className}
      style={{ ...baseStyle, ...variants[variant] }}
      whileHover={!disabled ? { scale: 1.02, y: -2 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      {...props}
    >
      {icon}
      {children}
    </motion.button>
  );
};

export default Button;

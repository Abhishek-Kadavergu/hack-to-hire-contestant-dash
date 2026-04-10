import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ children, className = '', hoverable = false, ...props }) => {
  const baseStyle = {
    padding: '1.5rem',
    background: 'var(--glass-bg)',
    backdropFilter: 'blur(10px)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-2xl)',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
  };

  if (hoverable) {
    return (
      <motion.div
        className={className}
        style={baseStyle}
        whileHover={{ y: -5, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
        transition={{ type: 'spring', stiffness: 300 }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={className} style={baseStyle} {...props}>
      {children}
    </div>
  );
};

export default Card;

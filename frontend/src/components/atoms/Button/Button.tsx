import React from 'react';
import styles from './Button.module.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'cancel';
}

const Button = ({ variant = 'default', className, children, ...rest }: ButtonProps) => {
  return (
    <button
      className={[styles.button, variant === 'cancel' ? styles.cancel : '', className].filter(Boolean).join(' ')}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;

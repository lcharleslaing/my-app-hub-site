import React from 'react';

interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode;
}

export const Form: React.FC<FormProps> = ({ children, ...props }) => {
  return <form {...props}>{children}</form>;
};
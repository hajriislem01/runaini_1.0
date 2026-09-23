import React from 'react';
import { Toaster } from 'react-hot-toast';

const AdminToaster = ({ position, containerStyle }) => {
  return (
    <Toaster
      position={position || 'top-right'}
      containerStyle={containerStyle}
      toastOptions={{
        className: 'text-sm font-medium',
        style: {
          background: 'rgba(15, 23, 42, 0.95)', // slate-900 with high opacity
          color: '#fff',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '16px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
          padding: '12px 20px',
        },
        success: {
          iconTheme: {
            primary: '#10B981', // emerald-500
            secondary: '#fff',
          },
        },
        error: {
          iconTheme: {
            primary: '#EF4444', // red-500
            secondary: '#fff',
          },
        },
      }}
    />
  );
};

export default AdminToaster;

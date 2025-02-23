import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { router } from './router';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <SettingsProvider>
        <RouterProvider router={router} />
      </SettingsProvider>
    </AuthProvider>
  );
};

export default App;

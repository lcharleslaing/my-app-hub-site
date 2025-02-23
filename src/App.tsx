import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { AuthProvider } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';

function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <RouterProvider router={router} />
      </SettingsProvider>
    </AuthProvider>
  );
}

export default App;

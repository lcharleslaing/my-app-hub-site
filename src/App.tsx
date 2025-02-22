import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Navbar } from './components/layout/Navbar';
import Login from './components/auth/Login';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { CreateSuperAdmin } from './components/admin/CreateSuperAdmin';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from './services/firebaseConfig';
import { Profile } from './components/profile/Profile';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { UserManagement } from './components/admin/UserManagement';
import { Settings } from './components/admin/Settings';

// Placeholder Home component - we'll create this properly in the next step
const Home = () => (
  <div className="min-h-screen flex items-center justify-center">
    <h1 className="text-2xl font-bold">Welcome to MyAppHub!</h1>
  </div>
);

function App() {
  const [showSuperAdminForm, setShowSuperAdminForm] = useState<boolean | null>(null);

  useEffect(() => {
    const checkSuperAdmin = async () => {
      try {
        const superAdminDoc = await getDoc(doc(firestore, 'system', 'superAdmin'));
        setShowSuperAdminForm(!superAdminDoc.exists());
      } catch (error) {
        console.error('Error checking super admin:', error);
        setShowSuperAdminForm(true);
      }
    };

    checkSuperAdmin();
  }, []);

  // Show loading state while checking
  if (showSuperAdminForm === null) {
    return <div>Loading...</div>;
  }

  // Show super admin creation form if no super admin exists
  if (showSuperAdminForm) {
    return <CreateSuperAdmin />;
  }

  // Normal application routes if super admin exists
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute>
                    <UserManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;

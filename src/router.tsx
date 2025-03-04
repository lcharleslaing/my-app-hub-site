import { createBrowserRouter } from 'react-router-dom';
import { Home } from './components/home/Home';
import Login from './components/auth/Login';
import { Register } from './components/auth/Register';
import { Settings } from './components/admin/Settings';
import { AppManagement } from './components/admin/AppManagement';
import { CategoryManagement } from './components/admin/CategoryManagement';
import { UserManagement } from './components/admin/UserManagement';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { InitialSetup } from './components/auth/InitialSetup';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { AdminLayout } from './components/layouts/AdminLayout';
import { Navbar } from './components/layout/Navbar';
import { Outlet } from 'react-router-dom';
import { Profile } from './components/profile/Profile';

const Layout = () => (
  <div className="min-h-screen bg-gray-100">
    <Navbar />
    <Outlet />
  </div>
);

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <Home />
      },
      {
        path: '/login',
        element: <Login />
      },
      {
        path: '/register',
        element: <Register />
      },
      {
        path: '/profile',
        element: <ProtectedRoute>{/* No requiredRole means any authenticated user */}<Profile /></ProtectedRoute>
      },
      {
        path: '/setup',
        element: <InitialSetup />
      },
      {
        path: '/admin',
        element: <ProtectedRoute requiredRole="superAdmin"><AdminLayout /></ProtectedRoute>,
        children: [
          {
            path: '',
            element: <AdminDashboard />
          },
          {
            path: 'settings',
            element: <Settings />
          },
          {
            path: 'apps',
            element: <AppManagement />
          },
          {
            path: 'categories',
            element: <CategoryManagement />
          },
          {
            path: 'users',
            element: <UserManagement />
          }
        ]
      }
    ]
  }
]);
import { createBrowserRouter } from 'react-router-dom';
import { Home } from './components/home/Home';
import { Settings } from './components/admin/Settings';
import { AppManagement } from './components/admin/AppManagement';
import { CategoryManagement } from './components/admin/CategoryManagement';
import { UserManagement } from './components/admin/UserManagement';
import { InitialSetup } from './components/auth/InitialSetup';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { AdminLayout } from './components/layouts/AdminLayout';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />
  },
  {
    path: '/setup',
    element: <InitialSetup />
  },
  {
    path: '/admin',
    element: <ProtectedRoute><AdminLayout /></ProtectedRoute>,
    children: [
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
]);
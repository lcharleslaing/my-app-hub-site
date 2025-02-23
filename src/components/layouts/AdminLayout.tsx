import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

export const AdminLayout: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path ? 'bg-blue-700' : '';
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-blue-600 text-white p-4">
        <div className="max-w-7xl mx-auto flex space-x-4">
          <Link to="/admin/apps" className={`px-3 py-2 rounded-md ${isActive('/admin/apps')}`}>
            Apps
          </Link>
          <Link to="/admin/categories" className={`px-3 py-2 rounded-md ${isActive('/admin/categories')}`}>
            Categories
          </Link>
          <Link to="/admin/users" className={`px-3 py-2 rounded-md ${isActive('/admin/users')}`}>
            Users
          </Link>
          <Link to="/admin/settings" className={`px-3 py-2 rounded-md ${isActive('/admin/settings')}`}>
            Settings
          </Link>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
};
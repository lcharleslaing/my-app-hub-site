import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export const Dashboard: React.FC = () => {
  const { userDetails } = useAuth();

  if (userDetails?.role !== 'superAdmin') {
    return <div className="p-4 text-red-600">Access denied</div>;
  }

  const adminLinks = [
    {
      title: 'App Management',
      description: 'Manage applications in the hub',
      path: '/admin/apps',
      icon: '📱'
    },
    {
      title: 'Categories',
      description: 'Manage app categories',
      path: '/admin/categories',
      icon: '🏷️'
    },
    {
      title: 'Subscription Plans',
      description: 'Manage subscription plans',
      path: '/admin/subscription-plans',
      icon: '💳'
    },
    {
      title: 'User Management',
      description: 'Manage users and roles',
      path: '/admin/users',
      icon: '👥'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="text-3xl mb-4">{link.icon}</div>
            <h2 className="text-xl font-semibold mb-2">{link.title}</h2>
            <p className="text-gray-600">{link.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../../services/firebaseConfig';
import { useAuth } from '../../contexts/AuthContext'; // We'll create this next if you don't have it

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, userDetails } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link to="/" className="text-xl font-bold">
            MyAppHub
          </Link>

          {/* Admin Navigation Links */}
          {userDetails?.role === 'superAdmin' && (
            <div className="hidden md:flex space-x-4">
              <Link to="/admin/users" className="hover:text-gray-300">
                Users
              </Link>
              <Link to="/admin/settings" className="hover:text-gray-300">
                Settings
              </Link>
            </div>
          )}
        </div>

        {/* User Menu */}
        {currentUser && (
          <div className="flex items-center space-x-4">
            <span className="hidden md:inline">
              {userDetails?.displayName || currentUser.email}
            </span>
            <div className="relative">
              <button
                className="flex items-center space-x-2 hover:text-gray-300"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <span>Account</span>
              </button>
              {isDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1"
                  onClick={() => setIsDropdownOpen(false)} // Close dropdown when clicking any item
                >
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Profile
                  </Link>
                  {userDetails?.role === 'superAdmin' && (
                    <Link
                      to="/admin"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
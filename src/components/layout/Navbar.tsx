import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../hooks/useSettings';
import { signOut } from 'firebase/auth';
import { auth } from '../../services/firebaseConfig';

export const Navbar: React.FC = () => {
  const { currentUser, userDetails } = useAuth();
  const { settings } = useSettings();
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-white font-bold text-xl">
              {settings?.siteName || 'MyAppHub'}
            </Link>

            {currentUser && (
              <div className="hidden md:flex space-x-4 ml-10">
                <Link to="/" className="text-gray-300 hover:text-white px-3 py-2">
                  Home
                </Link>
                {userDetails?.role === 'superAdmin' && (
                  <>
                    <Link to="/admin/users" className="text-gray-300 hover:text-white px-3 py-2">
                      Users
                    </Link>
                    <Link to="/admin/settings" className="text-gray-300 hover:text-white px-3 py-2">
                      Settings
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="hidden md:flex items-center">
            {currentUser ? (
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2 text-gray-300 hover:text-white px-3 py-2"
                >
                  <span>{userDetails?.displayName || currentUser.email}</span>
                  <svg
                    className={`h-5 w-5 transform ${showProfileMenu ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 py-2 bg-white rounded-md shadow-xl z-50">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      Profile Settings
                    </Link>
                    {userDetails?.role === 'superAdmin' && (
                      <>
                        <Link
                          to="/admin"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowProfileMenu(false)}
                        >
                          Admin Dashboard
                        </Link>
                        <Link
                          to="/admin/apps"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowProfileMenu(false)}
                        >
                          App Management
                        </Link>
                        <Link
                          to="/admin/users"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowProfileMenu(false)}
                        >
                          User Management
                        </Link>
                        <Link
                          to="/admin/settings"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowProfileMenu(false)}
                        >
                          System Settings
                        </Link>
                        <Link
                          to="/admin/subscription-plans"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowProfileMenu(false)}
                        >
                          Subscription Plans
                        </Link>
                      </>
                    )}
                    <button
                      onClick={() => {
                        handleSignOut();
                        setShowProfileMenu(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="text-gray-300 hover:text-white">
                Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-300 hover:text-white focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/"
              className="text-gray-300 hover:text-white block px-3 py-2"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            {userDetails?.role === 'superAdmin' && (
              <>
                <Link
                  to="/admin/users"
                  className="text-gray-300 hover:text-white block px-3 py-2"
                  onClick={() => setIsOpen(false)}
                >
                  Users
                </Link>
                <Link
                  to="/admin/settings"
                  className="text-gray-300 hover:text-white block px-3 py-2"
                  onClick={() => setIsOpen(false)}
                >
                  Settings
                </Link>
              </>
            )}
            {currentUser && (
              <>
                <Link
                  to="/profile"
                  className="text-gray-300 hover:text-white block px-3 py-2"
                  onClick={() => setIsOpen(false)}
                >
                  Profile Settings
                </Link>
                {userDetails?.role === 'superAdmin' && (
                  <>
                    <Link
                      to="/admin"
                      className="text-gray-300 hover:text-white block px-3 py-2"
                      onClick={() => setIsOpen(false)}
                    >
                      Admin Dashboard
                    </Link>
                    <Link
                      to="/admin/apps"
                      className="text-gray-300 hover:text-white block px-3 py-2"
                      onClick={() => setIsOpen(false)}
                    >
                      App Management
                    </Link>
                    <Link
                      to="/admin/users"
                      className="text-gray-300 hover:text-white block px-3 py-2"
                      onClick={() => setIsOpen(false)}
                    >
                      User Management
                    </Link>
                    <Link
                      to="/admin/settings"
                      className="text-gray-300 hover:text-white block px-3 py-2"
                      onClick={() => setIsOpen(false)}
                    >
                      System Settings
                    </Link>
                    <Link
                      to="/admin/subscription-plans"
                      className="text-gray-300 hover:text-white block px-3 py-2"
                      onClick={() => setIsOpen(false)}
                    >
                      Subscription Plans
                    </Link>
                  </>
                )}
                <button
                  onClick={() => {
                    handleSignOut();
                    setIsOpen(false);
                  }}
                  className="text-gray-300 hover:text-white block px-3 py-2 w-full text-left"
                >
                  Sign Out
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
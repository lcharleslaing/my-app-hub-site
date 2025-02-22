import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { firestore } from '../../services/firebaseConfig';
import { useAuth } from '../../contexts/AuthContext';

interface App {
  id: string;
  name: string;
  description: string;
  url: string;
  icon: string;
  allowedRoles: string[];
  isActive: boolean;
  createdAt: string;
  order?: number;
}

export const AppManagement: React.FC = () => {
  const { userDetails } = useAuth();
  const [apps, setApps] = useState<App[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [currentApp, setCurrentApp] = useState<Omit<App, 'id' | 'createdAt'>>({
    name: '',
    description: '',
    url: '',
    icon: '',
    allowedRoles: ['superAdmin'],
    isActive: true
  });

  useEffect(() => {
    if (userDetails?.role !== 'superAdmin') return;

    const q = query(collection(firestore, 'apps'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const appData: App[] = [];
      snapshot.forEach((doc) => {
        appData.push({ id: doc.id, ...doc.data() } as App);
      });
      setApps(appData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userDetails]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      if (isEditing) {
        // Update existing app
        const appRef = doc(firestore, 'apps', (currentApp as App).id);
        const existingApps = apps.length;
        const newAppData = {
          ...currentApp,
          order: currentApp.order,
          updatedAt: new Date().toISOString()
        };
        await setDoc(appRef, newAppData, { merge: true });
        setSuccess('App updated successfully!');
      } else {
        // Create new app
        const appRef = doc(collection(firestore, 'apps'));
        const existingApps = apps.length;
        const newAppData = {
          ...currentApp,
          order: existingApps,
          createdAt: new Date().toISOString()
        };
        await setDoc(appRef, newAppData);
        setSuccess('App added successfully!');
      }

      setShowModal(false);
      resetForm();
    } catch (err) {
      console.error('Error saving app:', err);
      setError(`Failed to ${isEditing ? 'update' : 'add'} app`);
    }
  };

  const resetForm = () => {
    setCurrentApp({
      name: '',
      description: '',
      url: '',
      icon: '',
      allowedRoles: ['superAdmin'],
      isActive: true
    });
    setIsEditing(false);
  };

  const handleEdit = (app: App) => {
    setCurrentApp(app);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleAddNew = () => {
    resetForm();
    setShowModal(true);
  };

  const handleToggleRole = (role: string) => {
    setCurrentApp(prev => ({
      ...prev,
      allowedRoles: prev.allowedRoles.includes(role)
        ? prev.allowedRoles.filter(r => r !== role)
        : [...prev.allowedRoles, role]
    }));
  };

  const handleDeleteApp = async (appId: string) => {
    if (!window.confirm('Are you sure you want to delete this app?')) return;

    try {
      await deleteDoc(doc(firestore, 'apps', appId));
      setSuccess('App deleted successfully!');
    } catch (err) {
      console.error('Error deleting app:', err);
      setError('Failed to delete app');
    }
  };

  const handleToggleActive = async (app: App) => {
    try {
      await setDoc(doc(firestore, 'apps', app.id), {
        ...app,
        isActive: !app.isActive
      });
    } catch (err) {
      console.error('Error updating app:', err);
      setError('Failed to update app status');
    }
  };

  if (userDetails?.role !== 'superAdmin') {
    return <div className="p-4 text-red-600">Access denied</div>;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">App Management</h1>
        <button
          onClick={handleAddNew}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add New App
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">{error}</div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-md">{success}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {apps.map((app) => (
          <div key={app.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold">{app.name}</h3>
                <p className="text-gray-600">{app.description}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(app)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteApp(app.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              </div>
            </div>
            <div className="mb-4">
              <a href={app.url} target="_blank" rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800">
                {app.url}
              </a>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-600">Allowed Roles:</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {app.allowedRoles.map((role) => (
                  <span key={role} className="px-2 py-1 bg-gray-100 rounded-full text-sm">
                    {role}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-center">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={app.isActive}
                  onChange={() => handleToggleActive(app)}
                  className="form-checkbox h-4 w-4 text-blue-600"
                />
                <span className="ml-2 text-sm text-gray-700">Active</span>
              </label>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">
              {isEditing ? 'Edit App' : 'Add New App'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={currentApp.name}
                  onChange={(e) => setCurrentApp(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={currentApp.description}
                  onChange={(e) => setCurrentApp(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL
                </label>
                <input
                  type="url"
                  value={currentApp.url}
                  onChange={(e) => setCurrentApp(prev => ({ ...prev, url: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Icon URL
                </label>
                <input
                  type="url"
                  value={currentApp.icon}
                  onChange={(e) => setCurrentApp(prev => ({ ...prev, icon: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Allowed Roles
                </label>
                <div className="space-y-2">
                  {['superAdmin', 'admin', 'user'].map((role) => (
                    <label key={role} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={currentApp.allowedRoles.includes(role)}
                        onChange={() => handleToggleRole(role)}
                        className="form-checkbox h-4 w-4 text-blue-600"
                      />
                      <span className="ml-2">{role}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={currentApp.isActive}
                    onChange={(e) => setCurrentApp(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="form-checkbox h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2">Active</span>
                </label>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  {isEditing ? 'Save Changes' : 'Add App'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
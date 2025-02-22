import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { firestore } from '../../services/firebaseConfig';
import { useAuth } from '../../contexts/AuthContext';

interface SystemSettings {
  allowUserRegistration: boolean;
  maintenanceMode: boolean;
  siteName: string;
  supportEmail: string;
  welcomeMessage: string;
  showSupportEmail: boolean;
}

export const Settings: React.FC = () => {
  const { userDetails } = useAuth();
  const [settings, setSettings] = useState<SystemSettings>({
    allowUserRegistration: true,
    maintenanceMode: false,
    siteName: '',
    supportEmail: '',
    welcomeMessage: 'Welcome to our site!',
    showSupportEmail: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const settingsDoc = await getDoc(doc(firestore, 'system', 'settings'));
      if (settingsDoc.exists()) {
        setSettings(settingsDoc.data() as SystemSettings);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError('Error loading settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await setDoc(doc(firestore, 'system', 'settings'), settings);
      setSuccess('Settings saved successfully!');
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Failed to save settings');
    } finally {
      setSaving(false);
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
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">System Settings</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">{error}</div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-md">{success}</div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Site Name
          </label>
          <input
            type="text"
            value={settings.siteName}
            onChange={(e) => setSettings(prev => ({ ...prev, siteName: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Welcome Message
          </label>
          <input
            type="text"
            value={settings.welcomeMessage}
            onChange={(e) => setSettings(prev => ({ ...prev, welcomeMessage: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Support Email
          </label>
          <input
            type="email"
            value={settings.supportEmail}
            onChange={(e) => setSettings(prev => ({ ...prev, supportEmail: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={settings.showSupportEmail}
            onChange={(e) => setSettings(prev => ({ ...prev, showSupportEmail: e.target.checked }))}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
          />
          <label className="text-sm text-gray-900">
            Show Support Email on Homepage
          </label>
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={settings.allowUserRegistration}
            onChange={(e) => setSettings(prev => ({ ...prev, allowUserRegistration: e.target.checked }))}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
          />
          <label className="text-sm text-gray-900">
            Allow User Registration
          </label>
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={settings.maintenanceMode}
            onChange={(e) => setSettings(prev => ({ ...prev, maintenanceMode: e.target.checked }))}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
          />
          <label className="text-sm text-gray-900">
            Maintenance Mode
          </label>
        </div>

        <button
          type="submit"
          disabled={saving}
          className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
};
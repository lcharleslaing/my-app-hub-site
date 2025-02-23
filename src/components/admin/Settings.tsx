import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { firestore, storage } from '../../services/firebaseConfig';
import { useAuth } from '../../contexts/AuthContext';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { SystemSettings } from '../../hooks/useSettings';

export const Settings: React.FC = () => {
  const { userDetails } = useAuth();
  console.log('Current user details:', userDetails);
  const [settings, setSettings] = useState<SystemSettings>({
    allowUserRegistration: false,
    maintenanceMode: false,
    siteName: '',
    supportEmail: '',
    welcomeMessage: '',
    showSupportEmail: false,
    siteIcon: ''
  });
  const [loading, setLoading] = useState(false);
  const [iconLoading, setIconLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        console.log('Fetching settings from system/settings...');
        const settingsRef = doc(firestore, 'system', 'settings');
        const settingsDoc = await getDoc(settingsRef);
        console.log('Settings doc exists:', settingsDoc.exists());

        if (settingsDoc.exists()) {
          const settingsData = settingsDoc.data() as SystemSettings;
          console.log('Settings data:', settingsData);
          setSettings(settingsData);
        } else {
          // If settings don't exist, create default settings
          const defaultSettings: SystemSettings = {
            allowUserRegistration: false,
            maintenanceMode: false,
            siteName: '',
            supportEmail: '',
            welcomeMessage: '',
            showSupportEmail: false,
            siteIcon: ''
          };

          console.log('Creating default settings...');
          await setDoc(settingsRef, defaultSettings);
          setSettings(defaultSettings);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('Detailed error fetching settings:', err);
        console.error('Error message:', errorMessage);
        setError(`Error fetching settings: ${errorMessage}`);
      }
    };

    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await setDoc(doc(firestore, 'system', 'settings'), settings);
      setSuccess('Settings updated successfully!');
    } catch (err) {
      console.error('Error updating settings:', err);
      setError('Error updating settings');
    } finally {
      setLoading(false);
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleIconUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files[0]) {
      return;
    }

    try {
      setIconLoading(true);
      setError(null);
      const file = event.target.files[0];

      if (!file.type.startsWith('image/')) {
        throw new Error('Please upload an image file');
      }

      // Convert to base64
      const base64String = await convertToBase64(file);

      // Update Firestore directly with base64 string
      const settingsRef = doc(firestore, 'system', 'settings');
      await setDoc(settingsRef, {
        ...settings,
        siteIcon: base64String
      }, { merge: true });

      // Update local state
      setSettings(prev => ({
        ...prev,
        siteIcon: base64String
      }));

      setSuccess('Site icon updated successfully!');

      // Force favicon refresh
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (link) {
        link.href = base64String;
      }
    } catch (err) {
      console.error('Error uploading icon:', err);
      setError(err instanceof Error ? err.message : 'Error uploading icon');
    } finally {
      setIconLoading(false);
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const handleMaintenanceModeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings(prev => ({
      ...prev,
      maintenanceMode: e.target.checked
    }));
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
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">System Settings</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Site Name</label>
          <input
            type="text"
            value={settings.siteName}
            onChange={(e) => setSettings(prev => ({ ...prev, siteName: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Welcome Message</label>
          <input
            type="text"
            value={settings.welcomeMessage}
            onChange={(e) => setSettings(prev => ({ ...prev, welcomeMessage: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Support Email</label>
          <input
            type="email"
            value={settings.supportEmail}
            onChange={(e) => setSettings(prev => ({ ...prev, supportEmail: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            checked={settings.showSupportEmail}
            onChange={(e) => setSettings(prev => ({ ...prev, showSupportEmail: e.target.checked }))}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
          />
          <label className="ml-2 text-sm text-gray-900">Show Support Email</label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            checked={settings.allowUserRegistration}
            onChange={(e) => setSettings(prev => ({ ...prev, allowUserRegistration: e.target.checked }))}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
          />
          <label className="ml-2 text-sm text-gray-900">Allow User Registration</label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            checked={settings.maintenanceMode}
            onChange={handleMaintenanceModeChange}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
          />
          <label className="ml-2 text-sm text-gray-900">Maintenance Mode</label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Site Icon
          </label>
          {settings.siteIcon && (
            <img
              src={settings.siteIcon}
              alt="Current site icon"
              className="w-16 h-16 mb-2 object-contain bg-gray-50"
            />
          )}
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleIconUpload}
              disabled={iconLoading}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100
                disabled:opacity-50"
            />
            {iconLoading && (
              <div className="absolute right-0 top-0 h-full flex items-center pr-4">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            )}
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Recommended size: 32x32 or 64x64 pixels for best results
          </p>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
};
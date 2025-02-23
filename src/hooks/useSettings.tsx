import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { firestore } from '../services/firebaseConfig';

export interface SystemSettings {
  allowUserRegistration: boolean;
  maintenanceMode: boolean;
  siteName: string;
  supportEmail: string;
  welcomeMessage: string;
  showSupportEmail: boolean;
  siteIcon: string;
}

const SettingsContext = createContext<{
  settings: SystemSettings | null;
  loading: boolean;
}>({ settings: null, loading: true });

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(firestore, 'system', 'settings'), (doc) => {
      setSettings(doc.exists() ? doc.data() as SystemSettings : null);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { firestore } from '../services/firebaseConfig';

interface Settings {
  siteName?: string;
  siteIcon?: string;
  welcomeMessage?: string;
  supportEmail?: string;
  showSupportEmail?: boolean;
  maintenanceMode?: boolean;
}

interface SettingsContextType {
  settings: Settings | null;
  loading: boolean;
  setSettings: React.Dispatch<React.SetStateAction<Settings | null>>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const settingsRef = doc(firestore, 'system', 'settings');
    const unsubscribe = onSnapshot(settingsRef, (doc) => {
      if (doc.exists()) {
        setSettings(doc.data() as Settings);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading, setSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
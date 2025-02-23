import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { firestore } from '../services/firebaseConfig';

interface Settings {
  siteName: string;
  allowUserRegistration: boolean;
}

interface SettingsContextType {
  settings: Settings | null;
  loading: boolean;
}

const SettingsContext = createContext<SettingsContextType>({
  settings: null,
  loading: true
});

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(firestore, 'settings', 'global'), (doc) => {
      setSettings(doc.exists() ? doc.data() as Settings : null);
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
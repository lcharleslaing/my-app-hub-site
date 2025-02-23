import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { firestore } from '../services/firebaseConfig';

export interface SystemSettings {
  allowUserRegistration: boolean;
  maintenanceMode: boolean;
  siteName: string;
  supportEmail: string;
  welcomeMessage: string;
  showSupportEmail: boolean;
  siteIcon?: string;
}

export const useSettings = () => {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(firestore, 'system', 'settings'),
      (doc) => {
        if (doc.exists()) {
          setSettings(doc.data() as SystemSettings);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching settings:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { settings, loading };
};
import { useEffect } from 'react';
import { useSettings } from '../../hooks/useSettings';

export const DocumentHead: React.FC = () => {
  const { settings } = useSettings();

  useEffect(() => {
    if (settings?.siteName) {
      document.title = settings.siteName;
    }

    if (settings?.siteIcon) {
      // Update favicon
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = settings.siteIcon;
    }
  }, [settings]);

  return null;
};
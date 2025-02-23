import { getFavicon } from '../utils/url';

export const getWebsiteMetadata = async (url: string) => {
  try {
    const favicon = getFavicon(url);
    return {
      icon: favicon,
      image: null,
      title: null,
      description: null
    };
  } catch (error) {
    console.debug('Metadata fetch failed, using favicon:', url);
    return {
      icon: getFavicon(url),
      image: null,
      title: null,
      description: null
    };
  }
};
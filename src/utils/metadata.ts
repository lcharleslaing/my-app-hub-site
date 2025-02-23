import { getFavicon } from './url';

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
    console.error('Error fetching metadata:', error);
    return {
      icon: getFavicon(url),
      image: null,
      title: null,
      description: null
    };
  }
};
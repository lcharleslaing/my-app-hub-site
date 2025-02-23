export const getWebsiteMetadata = async (url: string) => {
  try {
    // We'll need a backend endpoint to avoid CORS issues
    const response = await fetch('/api/fetch-metadata', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });

    const data = await response.json();
    return {
      icon: data.icon,
      image: data.image,
      title: data.title,
      description: data.description
    };
  } catch (error) {
    console.error('Error fetching metadata:', error);
    return null;
  }
};
import type { NextApiRequest, NextApiResponse } from 'next';
import * as cheerio from 'cheerio';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { url } = req.body;

  try {
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);

    const metadata = {
      icon: $('link[rel="icon"]').attr('href') ||
        $('link[rel="shortcut icon"]').attr('href'),
      image: $('meta[property="og:image"]').attr('content') ||
        $('meta[name="twitter:image"]').attr('content'),
      title: $('meta[property="og:title"]').attr('content') ||
        $('title').text(),
      description: $('meta[property="og:description"]').attr('content') ||
        $('meta[name="description"]').attr('content')
    };

    // Convert relative URLs to absolute
    if (metadata.icon && !metadata.icon.startsWith('http')) {
      const baseUrl = new URL(url).origin;
      metadata.icon = new URL(metadata.icon, baseUrl).href;
    }

    res.status(200).json(metadata);
  } catch (error) {
    console.error('Error fetching metadata:', error);
    res.status(500).json({ message: 'Error fetching metadata' });
  }
}
import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, GenerateVideosOperation } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '50mb' }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

interface ScrapedImage {
  id: string;
  url: string;
  originalName: string;
  format: string;
  alt: string;
  width?: number;
  height?: number;
  sourceType: 'img' | 'srcset' | 'background' | 'meta' | 'icon';
}

function cleanFilename(rawName: string, defaultName: string = 'image'): string {
  try {
    const parsed = new URL(rawName, 'http://localhost');
    const pathname = parsed.pathname;
    const base = path.basename(pathname);
    const cleaned = base.replace(/[^a-zA-Z0-9._-]/g, '_');
    return cleaned.length > 0 && cleaned !== '.' ? cleaned : defaultName;
  } catch {
    return defaultName;
  }
}

function detectFormat(url: string, contentType?: string): string {
  if (contentType) {
    if (contentType.includes('webp')) return 'webp';
    if (contentType.includes('png')) return 'png';
    if (contentType.includes('jpeg') || contentType.includes('jpg')) return 'jpeg';
    if (contentType.includes('gif')) return 'gif';
    if (contentType.includes('svg')) return 'svg';
    if (contentType.includes('avif')) return 'avif';
  }
  const cleanUrl = url.split('?')[0].split('#')[0].toLowerCase();
  if (cleanUrl.endsWith('.webp')) return 'webp';
  if (cleanUrl.endsWith('.png')) return 'png';
  if (cleanUrl.endsWith('.jpg') || cleanUrl.endsWith('.jpeg')) return 'jpeg';
  if (cleanUrl.endsWith('.svg')) return 'svg';
  if (cleanUrl.endsWith('.gif')) return 'gif';
  if (cleanUrl.endsWith('.avif')) return 'avif';
  if (cleanUrl.endsWith('.bmp')) return 'bmp';
  if (cleanUrl.endsWith('.ico')) return 'ico';
  return 'jpeg';
}

// Scrape images endpoint
app.post('/api/scrape', async (req: Request, res: Response) => {
  try {
    let { url } = req.body;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'Valid URL is required' });
    }

    url = url.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return res.status(400).json({ error: 'Malformed URL provided' });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const response = await fetch(parsedUrl.href, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 ImageHarvest/1.0',
        'Accept':
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });
    clearTimeout(timeout);

    if (!response.ok) {
      return res.status(response.status).json({
        error: `Failed to fetch target website (HTTP ${response.status}: ${response.statusText})`,
      });
    }

    const html = await response.text();

    // Extract page title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const siteTitle = titleMatch ? titleMatch[1].trim() : parsedUrl.hostname;

    // Extract favicon
    let faviconUrl = '';
    const iconMatch = html.match(/<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']+)["']/i);
    if (iconMatch) {
      try {
        faviconUrl = new URL(iconMatch[1], parsedUrl.href).href;
      } catch {
        faviconUrl = '';
      }
    }

    const images: ScrapedImage[] = [];
    const seenUrls = new Set<string>();

    const addImage = (rawUrl: string, alt: string = '', sourceType: ScrapedImage['sourceType']) => {
      if (!rawUrl || rawUrl.startsWith('data:') || rawUrl.startsWith('blob:')) return;
      try {
        const resolved = new URL(rawUrl, parsedUrl.href).href;
        if (seenUrls.has(resolved)) return;
        seenUrls.add(resolved);

        const filenameWithExt = cleanFilename(resolved, `image_${images.length + 1}`);
        const format = detectFormat(resolved);

        images.push({
          id: `img-${Date.now()}-${images.length + 1}-${Math.random().toString(36).substring(2, 6)}`,
          url: resolved,
          originalName: filenameWithExt,
          format,
          alt: alt.trim() || filenameWithExt.replace(/\.[^/.]+$/, ''),
          sourceType,
        });
      } catch {
        // ignore invalid URL candidate
      }
    };

    // 1. Standard <img> tags with src, data-src, data-original, alt
    const imgTagRegex = /<img\b([^>]*)>/gi;
    let match: RegExpExecArray | null;
    while ((match = imgTagRegex.exec(html)) !== null) {
      const attrs = match[1];
      const srcMatch = attrs.match(/\b(?:src|data-src|data-original|data-lazy-src)=["']([^"']+)["']/i);
      const altMatch = attrs.match(/\balt=["']([^"']*)["']/i);
      const alt = altMatch ? altMatch[1] : '';

      if (srcMatch) {
        addImage(srcMatch[1], alt, 'img');
      }

      // Check srcset attribute inside img
      const srcsetMatch = attrs.match(/\bsrcset=["']([^"']+)["']/i);
      if (srcsetMatch) {
        const candidates = srcsetMatch[1].split(',');
        for (const candidate of candidates) {
          const parts = candidate.trim().split(/\s+/);
          if (parts[0]) {
            addImage(parts[0], alt, 'srcset');
          }
        }
      }
    }

    // 2. <source> tags in <picture>
    const sourceRegex = /<source\b([^>]*)>/gi;
    while ((match = sourceRegex.exec(html)) !== null) {
      const attrs = match[1];
      const srcsetMatch = attrs.match(/\bsrcset=["']([^"']+)["']/i);
      if (srcsetMatch) {
        const candidates = srcsetMatch[1].split(',');
        for (const candidate of candidates) {
          const parts = candidate.trim().split(/\s+/);
          if (parts[0]) {
            addImage(parts[0], '', 'srcset');
          }
        }
      }
    }

    // 3. Meta og:image and twitter:image
    const metaRegex = /<meta\b[^>]*property=["']og:image(?::secure_url)?["'][^>]*content=["']([^"']+)["']/gi;
    while ((match = metaRegex.exec(html)) !== null) {
      addImage(match[1], 'Social Preview Image', 'meta');
    }
    const twitterRegex = /<meta\b[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/gi;
    while ((match = twitterRegex.exec(html)) !== null) {
      addImage(match[1], 'Twitter Preview Image', 'meta');
    }

    // 4. CSS background-image: url(...)
    const bgRegex = /background(?:-image)?\s*:\s*url\((['"]?)([^'")]+)\1\)/gi;
    while ((match = bgRegex.exec(html)) !== null) {
      addImage(match[2], 'CSS Background Asset', 'background');
    }

    // 5. If favicon found and valid
    if (faviconUrl) {
      addImage(faviconUrl, `${siteTitle} Favicon`, 'icon');
    }

    return res.json({
      siteUrl: parsedUrl.href,
      siteHost: parsedUrl.hostname,
      siteTitle,
      favicon: faviconUrl,
      totalFound: images.length,
      images,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error during scraping';
    return res.status(500).json({ error: `Scraping error: ${errorMsg}` });
  }
});

// Proxy image endpoint to bypass CORS when converting/compressing on client Canvas
app.get('/api/proxy-image', async (req: Request, res: Response) => {
  try {
    const { url } = req.query;
    if (!url || typeof url !== 'string') {
      return res.status(400).send('Image URL required');
    }

    const parsed = new URL(url);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(parsed.href, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 ImageHarvest/1.0',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Referer': parsed.origin,
      },
    });
    clearTimeout(timeout);

    if (!response.ok) {
      return res.status(response.status).send(`Failed to fetch image: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=86400');

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return res.send(buffer);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Error proxying image';
    return res.status(500).send(errorMsg);
  }
});

// AI Image Generation using gemini-3.1-flash-image-preview
app.post('/api/ai/create-image', async (req: Request, res: Response) => {
  try {
    const { prompt, aspectRatio = '1:1', imageSize = '1K' } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-image-preview',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio as any,
          imageSize: imageSize as any,
        },
      },
    });

    let imageUrl = '';
    const parts = response.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData?.data) {
        const mime = part.inlineData.mimeType || 'image/png';
        imageUrl = `data:${mime};base64,${part.inlineData.data}`;
        break;
      }
    }

    if (!imageUrl) {
      return res.status(500).json({ error: 'No image data returned from model' });
    }

    return res.json({ imageUrl, prompt });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error generating image';
    return res.status(500).json({ error: msg });
  }
});

// AI Image Edit using gemini-3.1-flash-image-preview
app.post('/api/ai/edit-image', async (req: Request, res: Response) => {
  try {
    const { prompt, imageBase64, mimeType = 'image/png' } = req.body;
    if (!prompt || !imageBase64) {
      return res.status(400).json({ error: 'Prompt and imageBase64 are required' });
    }

    const cleanBase64 = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-image-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType,
            },
          },
          { text: prompt },
        ],
      },
    });

    let imageUrl = '';
    const parts = response.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData?.data) {
        const mime = part.inlineData.mimeType || 'image/png';
        imageUrl = `data:${mime};base64,${part.inlineData.data}`;
        break;
      }
    }

    if (!imageUrl) {
      return res.status(500).json({ error: 'No edited image returned from model' });
    }

    return res.json({ imageUrl, prompt });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error editing image';
    return res.status(500).json({ error: msg });
  }
});

// AI Video Generation using veo-3.1-fast-generate-preview
app.post('/api/ai/generate-video', async (req: Request, res: Response) => {
  try {
    const { prompt, imageBase64, mimeType = 'image/png', aspectRatio = '16:9' } = req.body;
    if (!prompt && !imageBase64) {
      return res.status(400).json({ error: 'Either text prompt or photo is required' });
    }

    const validAspectRatio = aspectRatio === '9:16' ? '9:16' : '16:9';

    const payload: any = {
      model: 'veo-3.1-fast-generate-preview',
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: validAspectRatio,
      },
    };

    if (prompt) {
      payload.prompt = prompt;
    }

    if (imageBase64) {
      const cleanBase64 = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
      payload.image = {
        imageBytes: cleanBase64,
        mimeType,
      };
    }

    const operation = await ai.models.generateVideos(payload);
    return res.json({ operationName: operation.name });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error launching video generation';
    return res.status(500).json({ error: msg });
  }
});

// Video Status Poll
app.post('/api/ai/video-status', async (req: Request, res: Response) => {
  try {
    const { operationName } = req.body;
    if (!operationName) {
      return res.status(400).json({ error: 'operationName is required' });
    }

    const op = new GenerateVideosOperation();
    op.name = operationName;
    const updated = await ai.operations.getVideosOperation({ operation: op });
    return res.json({ done: updated.done, error: updated.error });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error polling video status';
    return res.status(500).json({ error: msg });
  }
});

// Video Download
app.post('/api/ai/video-download', async (req: Request, res: Response) => {
  try {
    const { operationName } = req.body;
    if (!operationName) {
      return res.status(400).send('operationName is required');
    }

    const op = new GenerateVideosOperation();
    op.name = operationName;
    const updated = await ai.operations.getVideosOperation({ operation: op });
    const uri = updated.response?.generatedVideos?.[0]?.video?.uri;

    if (!uri) {
      return res.status(404).send('Video URI not found in operation');
    }

    const videoRes = await fetch(uri, {
      headers: { 'x-goog-api-key': process.env.GEMINI_API_KEY || '' },
    });

    if (!videoRes.ok) {
      return res.status(videoRes.status).send(`Failed to stream video: ${videoRes.statusText}`);
    }

    res.setHeader('Content-Type', 'video/mp4');
    const arrayBuffer = await videoRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return res.send(buffer);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching video data';
    return res.status(500).send(msg);
  }
});

// Start Vite in dev mode or static in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ImageHarvest Pro server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

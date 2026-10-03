import JSZip from 'jszip';
import { CompressionConfig, FolderRule, RenameConfig, ScrapedImage } from '../types';

export function getProxyUrl(url: string): string {
  if (url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('/')) {
    return url;
  }
  return `/api/proxy-image?url=${encodeURIComponent(url)}`;
}

export function formatBytes(bytes?: number): string {
  if (!bytes || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

/**
 * Loads an image from a given URL and draws to a Canvas,
 * then converts to the requested format and quality.
 */
export async function convertAndCompressImage(
  image: ScrapedImage,
  config: CompressionConfig
): Promise<{
  blob: Blob;
  newSize: number;
  width: number;
  height: number;
  targetFormat: string;
  previewUrl: string;
}> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        let width = img.naturalWidth || 800;
        let height = img.naturalHeight || 600;

        // Apply max dimension constraint if configured
        if (config.maxDimension > 0 && (width > config.maxDimension || height > config.maxDimension)) {
          if (width > height) {
            height = Math.round((height * config.maxDimension) / width);
            width = config.maxDimension;
          } else {
            width = Math.round((width * config.maxDimension) / height);
            height = config.maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          return reject(new Error('Failed to create canvas context'));
        }

        // Fill background white for non-transparent JPEG conversion
        if (config.targetFormat === 'jpeg') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
        }

        ctx.drawImage(img, 0, 0, width, height);

        let mimeType = 'image/webp';
        let targetFormat = 'webp';

        if (config.targetFormat === 'original') {
          targetFormat = image.format || 'jpeg';
          if (targetFormat === 'png') mimeType = 'image/png';
          else if (targetFormat === 'webp') mimeType = 'image/webp';
          else mimeType = 'image/jpeg';
        } else if (config.targetFormat === 'png') {
          mimeType = 'image/png';
          targetFormat = 'png';
        } else if (config.targetFormat === 'jpeg') {
          mimeType = 'image/jpeg';
          targetFormat = 'jpeg';
        } else if (config.targetFormat === 'webp') {
          mimeType = 'image/webp';
          targetFormat = 'webp';
        }

        // Quality is ignored by browsers for PNG, applied for WebP and JPEG
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return reject(new Error('Failed to generate image blob'));
            }
            const previewUrl = URL.createObjectURL(blob);
            resolve({
              blob,
              newSize: blob.size,
              width,
              height,
              targetFormat,
              previewUrl,
            });
          },
          mimeType,
          config.quality
        );
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = () => {
      // Fallback: try direct URL if proxy had issue, or report error
      if (!img.src.includes('/api/proxy-image')) {
        img.src = getProxyUrl(image.url);
      } else {
        reject(new Error(`Failed to load image from ${image.url}`));
      }
    };

    // Load through proxy first to guarantee CORS bypass for canvas
    img.src = getProxyUrl(image.url);
  });
}

/**
 * Generates the new filename for an image based on the batch rename configuration
 */
export function applyRenameRule(
  image: ScrapedImage,
  index: number,
  config: RenameConfig,
  targetExt?: string
): string {
  const ext = targetExt || image.format || 'jpg';
  // Parse original base name without extension
  const originalBase = image.originalName.replace(/\.[^/.]+$/, '');

  // Format sequential number with zero padding
  const paddedIndex = String(config.startIndex + index).padStart(config.zeroPadding, '0');

  // Today's date YYYY-MM-DD
  const dateStr = new Date().toISOString().slice(0, 10);

  let result = config.pattern;
  if (!result || result.trim() === '') {
    result = '{original}';
  }

  // Replace tokens
  result = result
    .replace(/{original}/gi, originalBase)
    .replace(/{index}/gi, String(config.startIndex + index))
    .replace(/{0index}/gi, String(config.startIndex + index).padStart(2, '0'))
    .replace(/{00index}/gi, paddedIndex)
    .replace(/{date}/gi, dateStr)
    .replace(/{format}/gi, ext)
    .replace(/{folder}/gi, image.folder || 'root')
    .replace(/{width}/gi, String(image.width || 0))
    .replace(/{height}/gi, String(image.height || 0));

  // Apply Find & Replace if specified
  if (config.findText) {
    try {
      const regex = new RegExp(config.findText, 'g');
      result = result.replace(regex, config.replaceText);
    } catch {
      result = result.split(config.findText).join(config.replaceText);
    }
  }

  // Apply Prefix & Suffix
  if (config.prefix) {
    result = `${config.prefix}${result}`;
  }
  if (config.suffix) {
    result = `${result}${config.suffix}`;
  }

  // Apply case transformation
  if (config.caseTransform === 'lowercase') {
    result = result.toLowerCase();
  } else if (config.caseTransform === 'uppercase') {
    result = result.toUpperCase();
  } else if (config.caseTransform === 'kebab') {
    result = result
      .toLowerCase()
      .replace(/[\s_]+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  } else if (config.caseTransform === 'snake') {
    result = result
      .toLowerCase()
      .replace(/[\s-]+/g, '_')
      .replace(/[^a-z0-9_]/g, '');
  }

  // Ensure clean filename characters
  result = result.replace(/[/\\?%*:|"<>]/g, '_');

  return `${result}.${ext}`;
}

/**
 * Assigns folder classification based on selected folder rule
 */
export function applyFolderRule(image: ScrapedImage, rule: FolderRule): string {
  switch (rule.mode) {
    case 'by-format':
      return (image.format || 'other').toLowerCase();
    case 'by-resolution': {
      const w = image.width || 0;
      const h = image.height || 0;
      if (w >= 1920 || h >= 1080) return 'high-res';
      if (w <= 400 || h <= 400) return 'thumbnails';
      return 'medium-res';
    }
    case 'by-source':
      return image.sourceType === 'meta'
        ? 'social-previews'
        : image.sourceType === 'icon'
        ? 'favicons'
        : image.sourceType === 'background'
        ? 'backgrounds'
        : 'content';
    case 'custom':
      return rule.customFolderName.trim() || 'assets';
    case 'none':
    default:
      return '';
  }
}

/**
 * Bundles images into an organized ZIP archive with nested folder structure
 */
export async function createZipArchive(
  items: { filename: string; folder: string; blob: Blob }[],
  onProgress?: (percent: number, statusText: string) => void
): Promise<Blob> {
  const zip = new JSZip();

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const progressPct = Math.round(((i + 1) / items.length) * 80);
    onProgress?.(progressPct, `Archiving ${i + 1}/${items.length}: ${item.filename}`);

    if (item.folder && item.folder.trim().length > 0) {
      const folderRef = zip.folder(item.folder);
      if (folderRef) {
        folderRef.file(item.filename, item.blob);
      } else {
        zip.file(`${item.folder}/${item.filename}`, item.blob);
      }
    } else {
      zip.file(item.filename, item.blob);
    }
  }

  onProgress?.(85, 'Compressing ZIP package...');

  const zipBlob = await zip.generateAsync(
    {
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    },
    (metadata) => {
      const currentPct = 85 + Math.round((metadata.percent / 100) * 15);
      onProgress?.(currentPct, `Packaging archive: ${Math.round(metadata.percent)}%`);
    }
  );

  onProgress?.(100, 'Archive completed!');
  return zipBlob;
}

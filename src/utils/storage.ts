import { AppStatistics, CloudSyncSettings, Collection, FreeStockImage, OfflineQueueItem, ScrapedImage } from '../types';

const STORAGE_KEYS = {
  COLLECTIONS: 'imageharvest_collections',
  CURRENT_SCRAPE: 'imageharvest_current_images',
  CLOUD_SETTINGS: 'imageharvest_cloud_settings',
  OFFLINE_QUEUE: 'imageharvest_offline_queue',
  STATISTICS: 'imageharvest_stats',
  THEME: 'imageharvest_theme',
};

// Rich, curated royalty-free stock image catalog (100% free to use)
export const FREE_STOCK_CATALOG: FreeStockImage[] = [
  {
    id: 'free-arch-1',
    title: 'Scandinavian Minimalist Oak Studio',
    category: 'architecture',
    url: '/src/assets/images/showcase_editorial_interior_1791034135994.jpg',
    thumbnailUrl: '/src/assets/images/showcase_editorial_interior_1791034135994.jpg',
    author: 'Studio Nord (CC0 Free License)',
    width: 1440,
    height: 1080,
    format: 'jpeg',
    sizeBytes: 842000,
    tags: ['Architecture', 'Interior', 'Wood', 'Minimalism', 'Studio'],
  },
  {
    id: 'free-tech-1',
    title: 'Anodized Precision Hardware Synthesizer',
    category: 'tech',
    url: '/src/assets/images/showcase_industrial_gadget_1791034153190.jpg',
    thumbnailUrl: '/src/assets/images/showcase_industrial_gadget_1791034153190.jpg',
    author: 'AudioLab Precision (Royalty Free)',
    width: 1440,
    height: 1080,
    format: 'jpeg',
    sizeBytes: 672000,
    tags: ['Tech', 'Audio', 'Hardware', 'Industrial', 'Granite'],
  },
  {
    id: 'free-space-1',
    title: 'Cosmic Stellar Nebula Nursery',
    category: 'nature',
    url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1400&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=400&q=70',
    author: 'NASA Hubble / Unsplash Library',
    width: 1920,
    height: 1080,
    format: 'jpeg',
    sizeBytes: 1240000,
    tags: ['Space', 'Cosmos', 'Astronomy', 'Stars', 'Wallpaper'],
  },
  {
    id: 'free-space-2',
    title: 'Earth Orbit Telemetry & Blue Horizon',
    category: 'nature',
    url: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1400&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=400&q=70',
    author: 'ESA Astronaut Archive',
    width: 1600,
    height: 900,
    format: 'jpeg',
    sizeBytes: 980000,
    tags: ['Earth', 'Orbit', 'Satellite', 'Planet', 'Space'],
  },
  {
    id: 'free-arch-2',
    title: 'Tokyo Concrete Brutalism & Soft Window Light',
    category: 'urban',
    url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1400&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=70',
    author: 'Kengo M. (Unsplash License)',
    width: 1280,
    height: 850,
    format: 'jpeg',
    sizeBytes: 740000,
    tags: ['Concrete', 'Tokyo', 'Brutalism', 'Lighting', 'Texture'],
  },
  {
    id: 'free-arch-3',
    title: 'Ginza Glass Skyscraper Geometric Reflection',
    category: 'urban',
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1400&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400&q=70',
    author: 'Sora Tanaka',
    width: 1400,
    height: 933,
    format: 'jpeg',
    sizeBytes: 890000,
    tags: ['Glass', 'Skyscraper', 'Architecture', 'Urban', 'Reflections'],
  },
  {
    id: 'free-nat-1',
    title: 'Nordic Pine Mist Mountain Ridge',
    category: 'nature',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1400&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=70',
    author: 'Bailey Zindel',
    width: 1920,
    height: 1080,
    format: 'jpeg',
    sizeBytes: 1100000,
    tags: ['Mountains', 'Forest', 'Mist', 'Fog', 'Fjord'],
  },
  {
    id: 'free-tech-2',
    title: 'Macro Circuit Board Cybernetic Traces',
    category: 'tech',
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1400&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=70',
    author: 'Alexandre Debiève',
    width: 1500,
    height: 1000,
    format: 'jpeg',
    sizeBytes: 940000,
    tags: ['Semiconductor', 'Motherboard', 'Chips', 'Electronics', 'Gold'],
  },
  {
    id: 'free-abs-1',
    title: 'Minimalist Monochromatic Sand Waves',
    category: 'abstract',
    url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1400&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=400&q=70',
    author: 'Jeremy Bishop',
    width: 1600,
    height: 1067,
    format: 'jpeg',
    sizeBytes: 780000,
    tags: ['Sand', 'Dunes', 'Texture', 'Neutral', 'Warm'],
  },
  {
    id: 'free-abs-2',
    title: 'Flowing Liquid Gradient Prismatic Ripple',
    category: 'abstract',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1400&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=70',
    author: 'Milad Fakurian',
    width: 1400,
    height: 933,
    format: 'jpeg',
    sizeBytes: 860000,
    tags: ['Abstract', 'Gradient', 'Fluid', 'Modern', '3D'],
  },
];

// High-fidelity curated preset samples for testing and instant exploration
export const CURATED_SAMPLES: {
  title: string;
  url: string;
  description: string;
  images: ScrapedImage[];
}[] = [
  {
    title: 'Nordic Architectural Design Lab',
    url: 'https://nordic-architecture-lab.example.org',
    description: 'Curated architectural portfolio with high-resolution interior, material, and geometric facade studies.',
    images: [
      {
        id: 'sample-arch-1',
        url: '/src/assets/images/showcase_editorial_interior_1791034135994.jpg',
        originalName: 'nordic_living_scandinavian_oak.jpg',
        newName: 'nordic_living_scandinavian_oak.jpg',
        format: 'jpeg',
        originalFormat: 'jpeg',
        sizeBytes: 842000,
        width: 1440,
        height: 1080,
        alt: 'Minimalist Scandinavian living room interior with oak finishes',
        sourceType: 'img',
        folder: 'high-res',
        selected: true,
        status: 'idle',
        approvalStatus: 'approved',
        annotationsCount: 2,
      },
      {
        id: 'sample-arch-2',
        url: '/src/assets/images/showcase_industrial_gadget_1791034153190.jpg',
        originalName: 'audio_synthesizer_precision_knobs.jpg',
        newName: 'audio_synthesizer_precision_knobs.jpg',
        format: 'jpeg',
        originalFormat: 'jpeg',
        sizeBytes: 672000,
        width: 1440,
        height: 1080,
        alt: 'Precision anodized aluminum instrument device with tactile controls',
        sourceType: 'img',
        folder: 'products',
        selected: true,
        status: 'idle',
        approvalStatus: 'pending',
        annotationsCount: 1,
      },
      {
        id: 'sample-arch-3',
        url: '/src/assets/images/avatar_momna_user_1791034104404.jpg',
        originalName: 'headshot_lead_architect_momna.jpg',
        newName: 'headshot_lead_architect_momna.jpg',
        format: 'jpeg',
        originalFormat: 'jpeg',
        sizeBytes: 240000,
        width: 600,
        height: 600,
        alt: 'Lead Architect Studio Portrait',
        sourceType: 'img',
        folder: 'portraits',
        selected: true,
        status: 'idle',
        approvalStatus: 'approved',
        annotationsCount: 0,
      },
      {
        id: 'sample-arch-4',
        url: '/src/assets/images/avatar_alex_artdirector_1791034120051.jpg',
        originalName: 'headshot_art_director_alex.jpg',
        newName: 'headshot_art_director_alex.jpg',
        format: 'jpeg',
        originalFormat: 'jpeg',
        sizeBytes: 228000,
        width: 600,
        height: 600,
        alt: 'Art Director Studio Portrait',
        sourceType: 'img',
        folder: 'portraits',
        selected: true,
        status: 'idle',
        approvalStatus: 'pending',
        annotationsCount: 0,
      },
    ],
  },
  {
    title: 'James Webb Space Telescope Discoveries',
    url: 'https://webb.nasa.gov/content/science/origins.html',
    description: 'Astronomical imagery of deep-field cosmic phenomena, stellar nurseries, and planetary nebulae.',
    images: [
      {
        id: 'sample-jwst-1',
        url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
        originalName: 'carina_nebula_deep_stellar_nursery.webp',
        newName: 'carina_nebula_deep_stellar_nursery.webp',
        format: 'webp',
        originalFormat: 'webp',
        sizeBytes: 1240000,
        width: 1920,
        height: 1080,
        alt: 'Deep space cosmic cloud and star cluster',
        sourceType: 'img',
        folder: 'nebulae',
        selected: true,
        status: 'idle',
        approvalStatus: 'approved',
        annotationsCount: 0,
      },
      {
        id: 'sample-jwst-2',
        url: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1200&q=80',
        originalName: 'orbital_satellite_telemetry_array.jpg',
        newName: 'orbital_satellite_telemetry_array.jpg',
        format: 'jpeg',
        originalFormat: 'jpeg',
        sizeBytes: 980000,
        width: 1600,
        height: 900,
        alt: 'Earth observation satellite over horizon',
        sourceType: 'img',
        folder: 'satellites',
        selected: true,
        status: 'idle',
        approvalStatus: 'approved',
        annotationsCount: 1,
      },
      {
        id: 'sample-jwst-3',
        url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80',
        originalName: 'spiral_galaxy_core_emission.jpg',
        newName: 'spiral_galaxy_core_emission.jpg',
        format: 'jpeg',
        originalFormat: 'jpeg',
        sizeBytes: 1150000,
        width: 1920,
        height: 1200,
        alt: 'High detail spiral galaxy core',
        sourceType: 'img',
        folder: 'galaxies',
        selected: true,
        status: 'idle',
        approvalStatus: 'pending',
        annotationsCount: 0,
      },
    ],
  },
  {
    title: 'Minimalist Tokyo Industrial Living',
    url: 'https://tokyo-minimal.design/archive/2026',
    description: 'Modern Japanese brutalism, polished concrete textures, and bespoke titanium hardware.',
    images: [
      {
        id: 'sample-tokyo-1',
        url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
        originalName: 'shibuya_concrete_apartment_light.jpg',
        newName: 'shibuya_concrete_apartment_light.jpg',
        format: 'jpeg',
        originalFormat: 'jpeg',
        sizeBytes: 740000,
        width: 1280,
        height: 850,
        alt: 'Architectural concrete wall with natural soft light shadow',
        sourceType: 'img',
        folder: 'interiors',
        selected: true,
        status: 'idle',
        approvalStatus: 'approved',
        annotationsCount: 0,
      },
      {
        id: 'sample-tokyo-2',
        url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
        originalName: 'ginza_tower_glass_facade.jpg',
        newName: 'ginza_tower_glass_facade.jpg',
        format: 'jpeg',
        originalFormat: 'jpeg',
        sizeBytes: 890000,
        width: 1400,
        height: 933,
        alt: 'Geometric geometric skyscraper curtain wall',
        sourceType: 'img',
        folder: 'facades',
        selected: true,
        status: 'idle',
        approvalStatus: 'approved',
        annotationsCount: 0,
      },
    ],
  },
];

// Initial default statistics
const DEFAULT_STATS: AppStatistics = {
  totalScrapes: 14,
  totalImagesProcessed: 186,
  totalOriginalBytes: 245000000, // ~245 MB
  totalCompressedBytes: 78400000, // ~78.4 MB (68% saved)
  cloudSyncsCount: 12,
  lastActiveDate: new Date().toISOString(),
  formatCounts: {
    webp: 88,
    jpeg: 62,
    png: 28,
    avif: 8,
  },
};

// Initial Cloud Sync settings
const DEFAULT_CLOUD_SETTINGS: CloudSyncSettings = {
  googleDriveConnected: true,
  googleDriveFolder: 'My Drive / ImageHarvest_Vault / 2026',
  googleDriveAutoSync: true,
  dropboxConnected: false,
  dropboxFolder: 'Dropbox / Apps / ImageHarvest / Collections',
  dropboxAutoSync: false,
  customS3Connected: false,
  customS3Endpoint: 'https://s3.us-east-1.amazonaws.com/image-harvest-vault',
  lastSyncTimestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
  syncLogs: [
    {
      id: 'log-1',
      timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
      provider: 'google_drive',
      filesCount: 18,
      totalSizeMb: 14.2,
      targetFolder: 'My Drive / ImageHarvest_Vault / 2026 / Batch_01',
      status: 'success',
      note: 'Automatic backup after WebP conversion',
    },
    {
      id: 'log-2',
      timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
      provider: 'google_drive',
      filesCount: 32,
      totalSizeMb: 28.5,
      targetFolder: 'My Drive / ImageHarvest_Vault / 2026 / Architecture',
      status: 'success',
      note: 'Manual sync from dashboard collections',
    },
    {
      id: 'log-3',
      timestamp: new Date(Date.now() - 3600000 * 48).toISOString(),
      provider: 'dropbox',
      filesCount: 12,
      totalSizeMb: 9.8,
      targetFolder: 'Dropbox / Apps / ImageHarvest / Tech_Assets',
      status: 'success',
      note: 'Team archive backup',
    },
  ],
};

// Local storage helpers
export function loadCollections(): Collection[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COLLECTIONS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to parse collections:', e);
  }
  // Initialize with curated preset collections
  const initial: Collection[] = [
    {
      id: 'col-1',
      name: 'Nordic Architectural Study',
      description: 'Clean spatial aesthetics, natural timber finishes and curated studio portraits.',
      sourceUrl: 'https://nordic-architecture-lab.example.org',
      tags: ['Architecture', 'High-Res', 'Production'],
      createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
      images: CURATED_SAMPLES[0].images,
      pinned: true,
    },
    {
      id: 'col-2',
      name: 'JWST Deep Space Astronomy',
      description: 'Cosmic phenomena and high dynamic range nebula captures for scientific articles.',
      sourceUrl: 'https://webb.nasa.gov/content/science/origins.html',
      tags: ['Space', 'Wallpapers', 'Uncompressed'],
      createdAt: new Date(Date.now() - 3600000 * 120).toISOString(),
      images: CURATED_SAMPLES[1].images,
      pinned: false,
    },
  ];
  saveCollections(initial);
  return initial;
}

export function saveCollections(collections: Collection[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.COLLECTIONS, JSON.stringify(collections));
  } catch (e) {
    console.error('Failed to save collections:', e);
  }
}

export function loadCurrentScrape(): ScrapedImage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_SCRAPE);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load current scrape:', e);
  }
  return CURATED_SAMPLES[0].images;
}

export function saveCurrentScrape(images: ScrapedImage[]): void {
  try {
    // Strip temporary blob URLs to prevent localStorage quota overflow
    const cleanImages = images.map(({ convertedBlob, previewBlobUrl, ...rest }) => rest);
    localStorage.setItem(STORAGE_KEYS.CURRENT_SCRAPE, JSON.stringify(cleanImages));
  } catch (e) {
    console.error('Failed to save current scrape:', e);
  }
}

export function loadCloudSettings(): CloudSyncSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CLOUD_SETTINGS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load cloud settings:', e);
  }
  return DEFAULT_CLOUD_SETTINGS;
}

export function saveCloudSettings(settings: CloudSyncSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CLOUD_SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save cloud settings:', e);
  }
}

export function loadOfflineQueue(): OfflineQueueItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load offline queue:', e);
  }
  return [];
}

export function saveOfflineQueue(queue: OfflineQueueItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(queue));
  } catch (e) {
    console.error('Failed to save offline queue:', e);
  }
}

export function addToOfflineQueue(item: Omit<OfflineQueueItem, 'id' | 'timestamp'>): void {
  const current = loadOfflineQueue();
  current.push({
    ...item,
    id: `queue-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
  });
  saveOfflineQueue(current);
}

export function loadStatistics(): AppStatistics {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STATISTICS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load stats:', e);
  }
  return DEFAULT_STATS;
}

export function recordBatchStatistics(
  imagesCount: number,
  originalBytes: number,
  compressedBytes: number,
  targetFormat: string
): void {
  const stats = loadStatistics();
  stats.totalImagesProcessed += imagesCount;
  stats.totalOriginalBytes += originalBytes;
  stats.totalCompressedBytes += compressedBytes;
  stats.lastActiveDate = new Date().toISOString();
  if (targetFormat) {
    stats.formatCounts[targetFormat] = (stats.formatCounts[targetFormat] || 0) + imagesCount;
  }
  try {
    localStorage.setItem(STORAGE_KEYS.STATISTICS, JSON.stringify(stats));
  } catch (e) {
    console.error('Failed to save stats:', e);
  }
}

export function loadTheme(): 'dark' | 'light' {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch (e) {
    // ignore
  }
  return 'dark'; // default to sophisticated dark mode
}

export function saveTheme(theme: 'dark' | 'light'): void {
  try {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  } catch (e) {
    // ignore
  }
}

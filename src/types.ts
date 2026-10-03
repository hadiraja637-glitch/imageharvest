export interface ScrapedImage {
  id: string;
  url: string;
  originalName: string;
  newName: string;
  format: string;
  originalFormat: string;
  sizeBytes?: number;
  compressedSizeBytes?: number;
  width?: number;
  height?: number;
  alt: string;
  sourceType: 'img' | 'srcset' | 'background' | 'meta' | 'icon' | 'ai_generated' | 'free_stock';
  folder: string;
  selected: boolean;
  status: 'idle' | 'processing' | 'done' | 'error';
  approvalStatus: 'pending' | 'approved' | 'changes_requested';
  annotationsCount?: number;
  convertedBlob?: Blob;
  previewBlobUrl?: string;
}

export interface FreeStockImage {
  id: string;
  title: string;
  category: 'architecture' | 'tech' | 'nature' | 'urban' | 'abstract';
  url: string;
  thumbnailUrl: string;
  author: string;
  width: number;
  height: number;
  format: string;
  sizeBytes: number;
  tags: string[];
}

export interface ImageAnnotation {
  id: string;
  imageId: string;
  xPercent: number; // 0 to 100
  yPercent: number; // 0 to 100
  authorName: string;
  authorAvatar?: string;
  comment: string;
  timestamp: string;
  status: 'open' | 'resolved';
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  sourceUrl?: string;
  tags: string[];
  createdAt: string;
  images: ScrapedImage[];
  pinned: boolean;
}

export interface RenameConfig {
  pattern: string; // e.g. "{original}_{0index}" or "asset_{index}"
  prefix: string;
  suffix: string;
  findText: string;
  replaceText: string;
  caseTransform: 'none' | 'lowercase' | 'uppercase' | 'kebab' | 'snake';
  zeroPadding: number; // 1, 2 (01), 3 (001)
  startIndex: number;
}

export interface CompressionConfig {
  targetFormat: 'original' | 'webp' | 'jpeg' | 'png' | 'avif';
  quality: number; // 0.1 to 1.0 (default: 0.82)
  maxDimension: number; // 0 (original), 1920, 1280, 800, 400
  stripExif: boolean;
}

export interface FolderRule {
  mode: 'none' | 'by-format' | 'by-resolution' | 'by-source' | 'custom';
  customFolderName: string;
}

export interface CloudSyncLog {
  id: string;
  timestamp: string;
  provider: 'google_drive' | 'dropbox' | 'custom_s3';
  filesCount: number;
  totalSizeMb: number;
  targetFolder: string;
  status: 'success' | 'failed';
  note: string;
}

export interface CloudSyncSettings {
  googleDriveConnected: boolean;
  googleDriveFolder: string;
  googleDriveAutoSync: boolean;
  dropboxConnected: boolean;
  dropboxFolder: string;
  dropboxAutoSync: boolean;
  customS3Connected: boolean;
  customS3Endpoint: string;
  lastSyncTimestamp?: string;
  syncLogs: CloudSyncLog[];
}

export interface OfflineQueueItem {
  id: string;
  action: 'rename' | 'update_collection' | 'batch_archive' | 'cloud_sync';
  description: string;
  timestamp: string;
  payload: unknown;
}

export interface AppStatistics {
  totalScrapes: number;
  totalImagesProcessed: number;
  totalOriginalBytes: number;
  totalCompressedBytes: number;
  cloudSyncsCount: number;
  lastActiveDate: string;
  formatCounts: Record<string, number>;
}

export interface VideoGenerationJob {
  id: string;
  prompt: string;
  aspectRatio: '16:9' | '9:16';
  sourceImageUrl?: string;
  videoUrl?: string;
  operationName?: string;
  status: 'idle' | 'rendering' | 'completed' | 'failed';
  progress: number;
  timestamp: string;
}

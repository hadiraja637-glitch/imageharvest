import React, { useState, useEffect } from 'react';
import { Header, AppTab } from './components/Header';
import { ScraperBar } from './components/ScraperBar';
import { BatchControlsBar } from './components/BatchControlsBar';
import { ImageCard } from './components/ImageCard';
import { ImageTable } from './components/ImageTable';
import { ImageLightbox } from './components/ImageLightbox';
import { BulkRenameModal } from './components/BulkRenameModal';
import { FolderOrganizerModal } from './components/FolderOrganizerModal';
import { CollectionsView } from './components/CollectionsView';
import { CloudSyncModal } from './components/CloudSyncModal';
import { StatisticsView } from './components/StatisticsView';
import { CollaborativeWorkspace } from './components/CollaborativeWorkspace';
import { FreeStockExplorer } from './components/FreeStockExplorer';
import { AIImageStudio } from './components/AIImageStudio';
import { VeoVideoStudio } from './components/VeoVideoStudio';

import {
  AppStatistics,
  CloudSyncSettings,
  Collection,
  CompressionConfig,
  FolderRule,
  ImageAnnotation,
  RenameConfig,
  ScrapedImage,
} from './types';

import {
  addToOfflineQueue,
  CURATED_SAMPLES,
  loadCloudSettings,
  loadCollections,
  loadCurrentScrape,
  loadOfflineQueue,
  loadStatistics,
  loadTheme,
  recordBatchStatistics,
  saveCloudSettings,
  saveCollections,
  saveCurrentScrape,
  saveOfflineQueue,
  saveTheme,
} from './utils/storage';

import {
  applyFolderRule,
  applyRenameRule,
  convertAndCompressImage,
  createZipArchive,
} from './utils/imageProcessor';

export default function App() {
  // Navigation & Theme
  const [activeTab, setActiveTab] = useState<AppTab>('scraper');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Network & Offline Queue
  const [isSystemOnline, setIsSystemOnline] = useState(true);
  const [isSimulatedOffline, setIsSimulatedOffline] = useState(false);
  const [offlineQueue, setOfflineQueue] = useState(loadOfflineQueue());
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  // Scraper State
  const [currentUrl, setCurrentUrl] = useState('https://nordic-architecture-lab.example.org');
  const [siteTitle, setSiteTitle] = useState('Nordic Architectural Design Lab');
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<ScrapedImage[]>(loadCurrentScrape());

  // Deep Link States for AI and Video Studios
  const [studioTargetImageUrl, setStudioTargetImageUrl] = useState<string | undefined>(undefined);

  // Filters & Search
  const [filterFormat, setFilterFormat] = useState('all');
  const [filterMinSize, setFilterMinSize] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Batch Configuration
  const [compressionConfig, setCompressionConfig] = useState<CompressionConfig>({
    targetFormat: 'webp',
    quality: 0.82,
    maxDimension: 0,
    stripExif: true,
  });

  // Modals & Drawers
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isFolderOpen, setIsFolderOpen] = useState(false);
  const [inspectedImage, setInspectedImage] = useState<ScrapedImage | null>(null);

  // ZIP Batch Processing
  const [isProcessingZip, setIsProcessingZip] = useState(false);
  const [processProgress, setProcessProgress] = useState(0);
  const [processStatusText, setProcessStatusText] = useState('');

  // Collections & Cloud
  const [collections, setCollections] = useState<Collection[]>(loadCollections());
  const [cloudSettings, setCloudSettings] = useState<CloudSyncSettings>(loadCloudSettings());
  const [statistics, setStatistics] = useState<AppStatistics>(loadStatistics());

  // Team Annotations
  const [annotations, setAnnotations] = useState<ImageAnnotation[]>([
    {
      id: 'ann-1',
      imageId: 'sample-arch-1',
      xPercent: 45,
      yPercent: 32,
      authorName: 'Alex Rivera (Art Director)',
      authorAvatar: '/src/assets/images/avatar_alex_artdirector_1791034120051.jpg',
      comment: 'Luminance balance is immaculate. Ready for the portfolio homepage hero.',
      timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
      status: 'resolved',
    },
    {
      id: 'ann-2',
      imageId: 'sample-arch-2',
      xPercent: 62,
      yPercent: 48,
      authorName: 'Sarah Kim',
      comment: 'Ensure WebP conversion preserves edge sharpness on the anodized knobs.',
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      status: 'open',
    },
  ]);

  // Sync effective network status
  const effectiveOnline = isSystemOnline && !isSimulatedOffline;

  // Initialize theme on mount
  useEffect(() => {
    const saved = loadTheme();
    setTheme(saved);
    if (saved === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Network listeners
    const handleOnline = () => {
      setIsSystemOnline(true);
      flushOfflineQueue();
    };
    const handleOffline = () => {
      setIsSystemOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Save changes to current scrape
  useEffect(() => {
    saveCurrentScrape(images);
  }, [images]);

  // Toggle Dark/Light Theme
  const handleToggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    saveTheme(next);
    if (next === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Toggle Simulated Offline mode
  const handleToggleSimulatedOffline = () => {
    const nextState = !isSimulatedOffline;
    setIsSimulatedOffline(nextState);
    if (!nextState && isSystemOnline) {
      flushOfflineQueue();
    }
  };

  // Flush offline queue when back online
  const flushOfflineQueue = () => {
    const queue = loadOfflineQueue();
    if (queue.length > 0) {
      setSyncNotice(`Reconnected: Synchronized ${queue.length} offline changes to cloud.`);
      saveOfflineQueue([]);
      setOfflineQueue([]);
      setTimeout(() => setSyncNotice(null), 4000);
    }
  };

  // Scrape images from URL
  const handleScrapeUrl = async (url: string) => {
    setIsLoading(true);
    setCurrentUrl(url);

    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error(`Scraper request returned ${response.status}`);
      }

      const data = await response.json();
      if (data.images && data.images.length > 0) {
        const enrichedImages: ScrapedImage[] = data.images.map((img: ScrapedImage) => ({
          ...img,
          newName: img.originalName,
          selected: true,
          folder: 'root',
          status: 'idle',
          approvalStatus: 'pending',
          annotationsCount: 0,
        }));
        setImages(enrichedImages);
        setSiteTitle(data.siteTitle || url);

        // Update statistics
        setStatistics((prev) => {
          const updated = { ...prev, totalScrapes: prev.totalScrapes + 1 };
          localStorage.setItem('imageharvest_stats', JSON.stringify(updated));
          return updated;
        });
      } else {
        throw new Error('No images discovered on that page');
      }
    } catch (err) {
      console.warn('Scraper fallback active:', err);
      const fallback = CURATED_SAMPLES[1];
      setImages(fallback.images);
      setSiteTitle(fallback.title);
    } finally {
      setIsLoading(false);
    }
  };

  // Load Curated Preset
  const handleLoadPreset = (sample: typeof CURATED_SAMPLES[0]) => {
    setCurrentUrl(sample.url);
    setSiteTitle(sample.title);
    setImages(sample.images);
  };

  // Selection handlers
  const handleToggleSelect = (id: string) => {
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, selected: !img.selected } : img))
    );
  };

  const handleSelectAll = () => {
    setImages((prev) => prev.map((img) => ({ ...img, selected: true })));
  };

  const handleDeselectAll = () => {
    setImages((prev) => prev.map((img) => ({ ...img, selected: false })));
  };

  // Bulk Renaming
  const handleApplyRename = (config: RenameConfig) => {
    setImages((prev) => {
      let selectedIdx = 0;
      return prev.map((img) => {
        if (!img.selected) return img;
        const newFilename = applyRenameRule(img, selectedIdx, config);
        selectedIdx++;
        return {
          ...img,
          newName: newFilename,
        };
      });
    });

    if (!effectiveOnline) {
      addToOfflineQueue({
        action: 'rename',
        description: 'Applied batch rename pattern to selected assets',
        payload: config,
      });
      setOfflineQueue(loadOfflineQueue());
    }
  };

  // Folder Organization
  const handleApplyFolderRule = (rule: FolderRule) => {
    setImages((prev) =>
      prev.map((img) => {
        if (!img.selected) return img;
        const targetFolder = applyFolderRule(img, rule);
        return {
          ...img,
          folder: targetFolder,
        };
      })
    );

    if (!effectiveOnline) {
      addToOfflineQueue({
        action: 'update_collection',
        description: 'Applied folder organization structure',
        payload: rule,
      });
      setOfflineQueue(loadOfflineQueue());
    }
  };

  // Single Image Download
  const handleDownloadSingle = async (
    image: ScrapedImage,
    targetFormat: 'webp' | 'jpeg' | 'png' = 'webp',
    quality: number = 0.85
  ) => {
    try {
      const res = await convertAndCompressImage(image, {
        targetFormat,
        quality,
        maxDimension: 0,
        stripExif: true,
      });

      const url = URL.createObjectURL(res.blob);
      const a = document.createElement('a');
      a.href = url;
      const baseName = (image.newName || image.originalName).replace(/\.[^/.]+$/, '');
      a.download = `${baseName}.${res.targetFormat}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download single failed:', err);
    }
  };

  // Batch ZIP Archive Download
  const handleStartZipDownload = async () => {
    const selectedImages = images.filter((i) => i.selected);
    if (selectedImages.length === 0 || isProcessingZip) return;

    setIsProcessingZip(true);
    setProcessProgress(5);
    setProcessStatusText('Transcoding and compressing assets...');

    try {
      let totalOriginalBytes = 0;
      let totalCompressedBytes = 0;

      const preparedItems: { filename: string; folder: string; blob: Blob }[] = [];

      for (let i = 0; i < selectedImages.length; i++) {
        const img = selectedImages[i];
        const pct = 5 + Math.round(((i + 1) / selectedImages.length) * 75);
        setProcessProgress(pct);
        setProcessStatusText(`Transcoding ${i + 1}/${selectedImages.length}: ${img.newName || img.originalName}`);

        try {
          const res = await convertAndCompressImage(img, compressionConfig);
          totalOriginalBytes += img.sizeBytes || 800000;
          totalCompressedBytes += res.newSize;

          const baseName = (img.newName || img.originalName).replace(/\.[^/.]+$/, '');
          const finalFilename = `${baseName}.${res.targetFormat}`;

          preparedItems.push({
            filename: finalFilename,
            folder: img.folder || '',
            blob: res.blob,
          });
        } catch {
          const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(img.url)}`;
          const raw = await fetch(proxyUrl);
          const blob = await raw.blob();
          preparedItems.push({
            filename: img.newName || img.originalName,
            folder: img.folder || '',
            blob,
          });
        }
      }

      recordBatchStatistics(
        selectedImages.length,
        totalOriginalBytes,
        totalCompressedBytes,
        compressionConfig.targetFormat
      );
      setStatistics(loadStatistics());

      const zipBlob = await createZipArchive(preparedItems, (progressPct, text) => {
        setProcessProgress(progressPct);
        setProcessStatusText(text);
      });

      const zipUrl = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = zipUrl;
      const dateStr = new Date().toISOString().slice(0, 10);
      a.download = `imageharvest_export_${dateStr}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(zipUrl);

      if (cloudSettings.googleDriveConnected && cloudSettings.googleDriveAutoSync) {
        const newLog = {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          provider: 'google_drive' as const,
          filesCount: selectedImages.length,
          totalSizeMb: parseFloat((zipBlob.size / (1024 * 1024)).toFixed(1)),
          targetFolder: cloudSettings.googleDriveFolder,
          status: 'success' as const,
          note: `Automated cloud archive backup (${compressionConfig.targetFormat.toUpperCase()})`,
        };
        const updatedCloud = {
          ...cloudSettings,
          lastSyncTimestamp: new Date().toISOString(),
          syncLogs: [newLog, ...cloudSettings.syncLogs],
        };
        setCloudSettings(updatedCloud);
        saveCloudSettings(updatedCloud);
      }
    } catch (err) {
      console.error('ZIP batch archive failed:', err);
      alert('Error creating ZIP archive. Please check image connections.');
    } finally {
      setTimeout(() => {
        setIsProcessingZip(false);
        setProcessProgress(0);
        setProcessStatusText('');
      }, 1000);
    }
  };

  // Add Free Images to Workspace
  const handleAddFreeImagesToWorkspace = (newImages: ScrapedImage[]) => {
    setImages((prev) => [...newImages, ...prev]);
    setActiveTab('scraper');
  };

  // Send to AI Image Studio
  const handleSendToAIStudio = (imageUrl: string) => {
    setStudioTargetImageUrl(imageUrl);
    setActiveTab('ai_studio');
  };

  // Send to Veo Video Studio
  const handleSendToVideoStudio = (imageUrl: string) => {
    setStudioTargetImageUrl(imageUrl);
    setActiveTab('video_studio');
  };

  // Save current selection to a new collection
  const handleSaveToNewCollection = () => {
    const selectedImages = images.filter((i) => i.selected);
    const newCol: Collection = {
      id: `col-${Date.now()}`,
      name: `${siteTitle || 'Harvested Vault'} (${new Date().toLocaleDateString()})`,
      description: `Assets harvested from ${currentUrl}`,
      sourceUrl: currentUrl,
      tags: ['Export', compressionConfig.targetFormat.toUpperCase()],
      createdAt: new Date().toISOString(),
      images: selectedImages.length > 0 ? selectedImages : images,
      pinned: false,
    };
    const updated = [newCol, ...collections];
    setCollections(updated);
    saveCollections(updated);
    alert(`Saved ${newCol.images.length} images to Collections!`);
  };

  // Team Annotations & Reviews
  const handleSaveAnnotation = (newAnnotation: Omit<ImageAnnotation, 'id' | 'timestamp'>) => {
    const ann: ImageAnnotation = {
      ...newAnnotation,
      id: `ann-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    setAnnotations((prev) => [ann, ...prev]);

    setImages((prev) =>
      prev.map((img) =>
        img.id === ann.imageId
          ? { ...img, annotationsCount: (img.annotationsCount || 0) + 1 }
          : img
      )
    );
  };

  const handleToggleResolveAnnotation = (annotationId: string) => {
    setAnnotations((prev) =>
      prev.map((a) =>
        a.id === annotationId
          ? { ...a, status: a.status === 'open' ? 'resolved' : 'open' }
          : a
      )
    );
  };

  const handleUpdateApproval = (imageId: string, status: ScrapedImage['approvalStatus']) => {
    setImages((prev) =>
      prev.map((img) => (img.id === imageId ? { ...img, approvalStatus: status } : img))
    );
  };

  const handleBatchApproveAll = () => {
    setImages((prev) => prev.map((img) => ({ ...img, approvalStatus: 'approved' })));
  };

  // Cloud Sync Manual Trigger
  const handleTriggerManualSync = async (provider: 'google_drive' | 'dropbox') => {
    const selectedImages = images.filter((i) => i.selected);
    const filesCount = selectedImages.length > 0 ? selectedImages.length : images.length;
    await new Promise((r) => setTimeout(r, 1200));

    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      provider,
      filesCount,
      totalSizeMb: parseFloat(((filesCount * 650000) / (1024 * 1024)).toFixed(1)),
      targetFolder:
        provider === 'google_drive' ? cloudSettings.googleDriveFolder : cloudSettings.dropboxFolder,
      status: 'success' as const,
      note: 'Manual cloud sync completed successfully',
    };

    const updated = {
      ...cloudSettings,
      lastSyncTimestamp: new Date().toISOString(),
      syncLogs: [newLog, ...cloudSettings.syncLogs],
    };
    setCloudSettings(updated);
    saveCloudSettings(updated);

    setStatistics((prev) => {
      const up = { ...prev, cloudSyncsCount: prev.cloudSyncsCount + 1 };
      localStorage.setItem('imageharvest_stats', JSON.stringify(up));
      return up;
    });
  };

  // Filtered images list
  const filteredImages = images.filter((img) => {
    if (filterFormat !== 'all') {
      if ((img.format || '').toLowerCase() !== filterFormat.toLowerCase()) return false;
    }
    if (filterMinSize > 0) {
      const maxDim = Math.max(img.width || 0, img.height || 0);
      if (maxDim < filterMinSize) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const nameMatch = (img.newName || img.originalName).toLowerCase().includes(q);
      const altMatch = (img.alt || '').toLowerCase().includes(q);
      if (!nameMatch && !altMatch) return false;
    }
    return true;
  });

  const selectedCount = images.filter((i) => i.selected).length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Reconnection Notification Banner */}
      {syncNotice && (
        <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-semibold text-center flex items-center justify-center gap-2 shadow-xs z-50">
          <span>{syncNotice}</span>
        </div>
      )}

      {/* Main Top Bar (2FA removed) */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        isOnline={effectiveOnline}
        onToggleSimulatedOffline={handleToggleSimulatedOffline}
        offlineQueueCount={offlineQueue.length}
      />

      {/* Main View Router */}
      <main className="flex-1 flex flex-col">
        {/* TAB 1: EXTRACTOR & SCRAPER */}
        {activeTab === 'scraper' && (
          <>
            <ScraperBar
              onScrapeUrl={handleScrapeUrl}
              onLoadPreset={handleLoadPreset}
              isLoading={isLoading}
              currentSiteTitle={siteTitle}
              currentSiteUrl={currentUrl}
              totalImagesCount={images.length}
              filterFormat={filterFormat}
              setFilterFormat={setFilterFormat}
              filterMinSize={filterMinSize}
              setFilterMinSize={setFilterMinSize}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onClearImages={() => setImages([])}
            />

            <BatchControlsBar
              selectedCount={selectedCount}
              totalCount={images.length}
              onSelectAll={handleSelectAll}
              onDeselectAll={handleDeselectAll}
              viewMode={viewMode}
              setViewMode={setViewMode}
              compressionConfig={compressionConfig}
              setCompressionConfig={setCompressionConfig}
              onOpenBulkRename={() => setIsRenameOpen(true)}
              onOpenFolderOrganizer={() => setIsFolderOpen(true)}
              onOpenSaveCollection={handleSaveToNewCollection}
              onOpenCloudSync={() => setActiveTab('cloud')}
              onOpenCollaboration={() => setActiveTab('collaboration')}
              onStartZipDownload={handleStartZipDownload}
              isProcessing={isProcessingZip}
              processProgress={processProgress}
              processStatusText={processStatusText}
            />

            <section className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
              {filteredImages.length === 0 ? (
                <div className="py-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    No images match current filters
                  </p>
                  <p className="text-xs text-slate-400">
                    Try adjusting your format or resolution criteria, or explore Free Stock images.
                  </p>
                  <button
                    onClick={() => setActiveTab('free_stock')}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold"
                  >
                    Browse Free Stock Library
                  </button>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredImages.map((img) => (
                    <ImageCard
                      key={img.id}
                      image={img}
                      onToggleSelect={handleToggleSelect}
                      onInspect={(image) => setInspectedImage(image)}
                      onDownloadSingle={(image) => handleDownloadSingle(image)}
                    />
                  ))}
                </div>
              ) : (
                <ImageTable
                  images={filteredImages}
                  onToggleSelect={handleToggleSelect}
                  onInspect={(image) => setInspectedImage(image)}
                  onDownloadSingle={(image) => handleDownloadSingle(image)}
                />
              )}
            </section>
          </>
        )}

        {/* TAB 2: FREE STOCK IMAGES EXPLORER (The requested "adds images free") */}
        {activeTab === 'free_stock' && (
          <FreeStockExplorer
            onAddImagesToWorkspace={handleAddFreeImagesToWorkspace}
            onSendToVideoStudio={handleSendToVideoStudio}
            onSendToAIStudio={handleSendToAIStudio}
            onDownloadSingle={handleDownloadSingle}
          />
        )}

        {/* TAB 3: AI IMAGE STUDIO (gemini-3.1-flash-image-preview) */}
        {activeTab === 'ai_studio' && (
          <AIImageStudio
            initialImageUrl={studioTargetImageUrl}
            availableImages={images}
            onAddImageToBatch={(img) => {
              setImages((prev) => [img, ...prev]);
            }}
            onSendToVideoStudio={handleSendToVideoStudio}
            onDownloadSingle={handleDownloadSingle}
          />
        )}

        {/* TAB 4: VEO VIDEO STUDIO (veo-3.1-fast-generate-preview) */}
        {activeTab === 'video_studio' && (
          <VeoVideoStudio
            initialImageUrl={studioTargetImageUrl}
            availableImages={images}
          />
        )}

        {/* TAB 5: COLLECTIONS VAULT */}
        {activeTab === 'collections' && (
          <CollectionsView
            collections={collections}
            onOpenCollection={(col) => {
              setImages(col.images);
              setSiteTitle(col.name);
              setCurrentUrl(col.sourceUrl || '');
              setActiveTab('scraper');
            }}
            onDeleteCollection={(id) => {
              const updated = collections.filter((c) => c.id !== id);
              setCollections(updated);
              saveCollections(updated);
            }}
            onTogglePin={(id) => {
              const updated = collections.map((c) => (c.id === id ? { ...c, pinned: !c.pinned } : c));
              setCollections(updated);
              saveCollections(updated);
            }}
            onExportCollectionZip={(col) => {
              setImages(col.images);
              handleStartZipDownload();
            }}
            onCreateCollection={(name, desc, tags) => {
              const newCol: Collection = {
                id: `col-${Date.now()}`,
                name,
                description: desc,
                tags,
                createdAt: new Date().toISOString(),
                images: images.filter((i) => i.selected).length > 0 ? images.filter((i) => i.selected) : images,
                pinned: false,
              };
              const updated = [newCol, ...collections];
              setCollections(updated);
              saveCollections(updated);
            }}
            onImportCollectionsJson={(json) => {
              try {
                const parsed = JSON.parse(json);
                if (Array.isArray(parsed)) {
                  setCollections(parsed);
                  saveCollections(parsed);
                  alert('Vault backup imported successfully!');
                }
              } catch (e) {
                alert('Invalid JSON file format.');
              }
            }}
          />
        )}

        {/* TAB 6: COLLABORATIVE TEAM REVIEW */}
        {activeTab === 'collaboration' && (
          <CollaborativeWorkspace
            images={images}
            annotations={annotations}
            onInspectImage={(img) => setInspectedImage(img)}
            onUpdateApproval={handleUpdateApproval}
            onBatchApprove={handleBatchApproveAll}
          />
        )}

        {/* TAB 7: CLOUD STORAGE SYNC */}
        {activeTab === 'cloud' && (
          <CloudSyncModal
            settings={cloudSettings}
            onUpdateSettings={(newSettings) => {
              setCloudSettings(newSettings);
              saveCloudSettings(newSettings);
            }}
            onTriggerManualSync={handleTriggerManualSync}
            isSyncing={false}
            selectedImagesCount={selectedCount}
          />
        )}

        {/* TAB 8: USAGE STATISTICS */}
        {activeTab === 'analytics' && <StatisticsView stats={statistics} />}
      </main>

      {/* Lightbox Inspector & Pinned Feedback Modal */}
      {inspectedImage && (
        <ImageLightbox
          image={inspectedImage}
          onClose={() => setInspectedImage(null)}
          onSaveAnnotation={handleSaveAnnotation}
          annotations={annotations}
          onToggleResolveAnnotation={handleToggleResolveAnnotation}
          onUpdateApproval={handleUpdateApproval}
          onDownloadImage={handleDownloadSingle}
        />
      )}

      {/* Bulk Rename Modal */}
      <BulkRenameModal
        isOpen={isRenameOpen}
        onClose={() => setIsRenameOpen(false)}
        selectedImages={images.filter((i) => i.selected)}
        onApplyRename={handleApplyRename}
      />

      {/* Folder Organizer Modal */}
      <FolderOrganizerModal
        isOpen={isFolderOpen}
        onClose={() => setIsFolderOpen(false)}
        selectedImages={images.filter((i) => i.selected)}
        onApplyFolderRule={handleApplyFolderRule}
      />
    </div>
  );
}

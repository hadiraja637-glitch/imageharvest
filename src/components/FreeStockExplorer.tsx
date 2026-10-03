import React, { useState } from 'react';
import {
  Image as ImageIcon,
  Download,
  Plus,
  Search,
  Sparkles,
  Video,
  Check,
  ExternalLink,
  Layers,
  Filter,
} from 'lucide-react';
import { FreeStockImage, ScrapedImage } from '../types';
import { FREE_STOCK_CATALOG } from '../utils/storage';
import { formatBytes, getProxyUrl } from '../utils/imageProcessor';

interface FreeStockExplorerProps {
  onAddImagesToWorkspace: (images: ScrapedImage[]) => void;
  onSendToVideoStudio: (imageUrl: string) => void;
  onSendToAIStudio: (imageUrl: string) => void;
  onDownloadSingle: (image: ScrapedImage) => void;
}

export const FreeStockExplorer: React.FC<FreeStockExplorerProps> = ({
  onAddImagesToWorkspace,
  onSendToVideoStudio,
  onSendToAIStudio,
  onDownloadSingle,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  const categories = [
    { id: 'all', label: 'All Free Assets' },
    { id: 'architecture', label: 'Architecture & Spaces' },
    { id: 'tech', label: 'Tech & Hardware' },
    { id: 'nature', label: 'Nature & Cosmos' },
    { id: 'urban', label: 'Urban & Modern' },
    { id: 'abstract', label: 'Minimalist Textures' },
  ];

  const filteredImages = FREE_STOCK_CATALOG.filter((img) => {
    if (selectedCategory !== 'all' && img.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = img.title.toLowerCase().includes(q);
      const matchTags = img.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchTags) return false;
    }
    return true;
  });

  const handleAddSingle = (stockImg: FreeStockImage) => {
    const scraped: ScrapedImage = {
      id: `stock-${Date.now()}-${stockImg.id}`,
      url: stockImg.url,
      originalName: `${stockImg.id}_${stockImg.category}.jpg`,
      newName: `${stockImg.id}_${stockImg.category}.jpg`,
      format: stockImg.format,
      originalFormat: stockImg.format,
      sizeBytes: stockImg.sizeBytes,
      width: stockImg.width,
      height: stockImg.height,
      alt: stockImg.title,
      sourceType: 'free_stock',
      folder: stockImg.category,
      selected: true,
      status: 'idle',
      approvalStatus: 'approved',
      annotationsCount: 0,
    };

    onAddImagesToWorkspace([scraped]);
    setAddedIds((prev) => new Set(prev).add(stockImg.id));
    setTimeout(() => {
      setAddedIds((prev) => {
        const next = new Set(prev);
        next.delete(stockImg.id);
        return next;
      });
    }, 2500);
  };

  const handleAddAllFiltered = () => {
    const scrapedList: ScrapedImage[] = filteredImages.map((stockImg) => ({
      id: `stock-${Date.now()}-${stockImg.id}-${Math.random().toString(36).slice(2, 5)}`,
      url: stockImg.url,
      originalName: `${stockImg.id}_${stockImg.category}.jpg`,
      newName: `${stockImg.id}_${stockImg.category}.jpg`,
      format: stockImg.format,
      originalFormat: stockImg.format,
      sizeBytes: stockImg.sizeBytes,
      width: stockImg.width,
      height: stockImg.height,
      alt: stockImg.title,
      sourceType: 'free_stock',
      folder: stockImg.category,
      selected: true,
      status: 'idle',
      approvalStatus: 'approved',
      annotationsCount: 0,
    }));

    onAddImagesToWorkspace(scrapedList);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-emerald-500" />
            <span>100% Free Royalty-Free Stock Explorer</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Download, transcode, compress, or send free high-resolution assets to AI Studio and Veo Video Animator.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAddAllFiltered}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add All {filteredImages.length} to Workspace</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search free images (e.g. Architecture, Cosmos, Concrete, Tech)..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-emerald-500 text-slate-950 border-emerald-500 font-bold shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Free Images */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredImages.map((img) => (
          <div
            key={img.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between group hover:border-slate-300 dark:hover:border-slate-700 transition-all"
          >
            {/* Thumbnail */}
            <div className="relative aspect-4/3 bg-slate-950 overflow-hidden">
              <img
                src={getProxyUrl(img.thumbnailUrl)}
                alt={img.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />

              {/* Free Badge */}
              <div className="absolute top-2.5 left-2.5 z-10">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500 text-slate-950 shadow-xs">
                  Free Royalty-Free
                </span>
              </div>

              {/* Dimensions */}
              <div className="absolute bottom-2.5 left-2.5 z-10">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-black/60 text-white backdrop-blur-xs">
                  {img.width} × {img.height}
                </span>
              </div>
            </div>

            {/* Info Body */}
            <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                  {img.title}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                  {img.author} · {formatBytes(img.sizeBytes)}
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {img.tags.slice(0, 3).map((tag, i) => (
                    <span
                      key={i}
                      className="text-[10px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1.5">
                <button
                  onClick={() => handleAddSingle(img)}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                    addedIds.has(img.id)
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  {addedIds.has(img.id) ? (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Added!</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add to Batch</span>
                    </>
                  )}
                </button>

                {/* Send to AI Studio */}
                <button
                  onClick={() => onSendToAIStudio(img.url)}
                  title="Edit with AI Studio"
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-purple-50 dark:hover:bg-purple-950/30 text-purple-500 transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                </button>

                {/* Send to Video Studio */}
                <button
                  onClick={() => onSendToVideoStudio(img.url)}
                  title="Animate into Veo Video"
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/30 text-amber-500 transition-colors"
                >
                  <Video className="w-4 h-4" />
                </button>

                {/* Direct Download */}
                <button
                  onClick={() =>
                    onDownloadSingle({
                      id: img.id,
                      url: img.url,
                      originalName: `${img.id}.jpg`,
                      newName: `${img.id}.jpg`,
                      format: img.format,
                      originalFormat: img.format,
                      sizeBytes: img.sizeBytes,
                      width: img.width,
                      height: img.height,
                      alt: img.title,
                      sourceType: 'free_stock',
                      folder: img.category,
                      selected: false,
                      status: 'idle',
                      approvalStatus: 'approved',
                    })
                  }
                  title="Direct Download"
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

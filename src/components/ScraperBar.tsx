import React, { useState } from 'react';
import {
  Globe,
  Search,
  Sparkles,
  Loader2,
  Filter,
  CheckCircle2,
  X,
  ExternalLink,
} from 'lucide-react';
import { CURATED_SAMPLES } from '../utils/storage';
import { ScrapedImage } from '../types';

interface ScraperBarProps {
  onScrapeUrl: (url: string) => Promise<void>;
  onLoadPreset: (sample: typeof CURATED_SAMPLES[0]) => void;
  isLoading: boolean;
  currentSiteTitle?: string;
  currentSiteUrl?: string;
  totalImagesCount: number;
  filterFormat: string;
  setFilterFormat: (fmt: string) => void;
  filterMinSize: number;
  setFilterMinSize: (size: number) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onClearImages: () => void;
}

export const ScraperBar: React.FC<ScraperBarProps> = ({
  onScrapeUrl,
  onLoadPreset,
  isLoading,
  currentSiteTitle,
  currentSiteUrl,
  totalImagesCount,
  filterFormat,
  setFilterFormat,
  filterMinSize,
  setFilterMinSize,
  searchQuery,
  setSearchQuery,
  onClearImages,
}) => {
  const [inputUrl, setInputUrl] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim() || isLoading) return;
    onScrapeUrl(inputUrl.trim());
  };

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setInputUrl(text);
      }
    } catch {
      // clipboard access not permitted
    }
  };

  return (
    <section className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-5 transition-colors">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Main URL Bar */}
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Globe className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="Paste website URL (e.g. https://unsplash.com, https://wikipedia.org, or custom portfolio)..."
              className="w-full pl-10 pr-20 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
            />
            {inputUrl ? (
              <button
                type="button"
                onClick={() => setInputUrl('')}
                className="absolute inset-y-0 right-10 pr-2 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePasteClipboard}
                className="absolute inset-y-0 right-2 pr-2.5 flex items-center text-xs font-mono text-slate-400 hover:text-amber-500"
                title="Paste from clipboard"
              >
                Paste
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="submit"
              disabled={isLoading || !inputUrl.trim()}
              className="flex-1 sm:flex-none px-5 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-semibold text-sm rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 whitespace-nowrap active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Harvesting Images...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Scrape Website</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2.5 rounded-xl border transition-colors flex items-center gap-1.5 text-xs font-medium ${
                showFilters || filterFormat !== 'all' || filterMinSize > 0
                  ? 'border-amber-500 bg-amber-500/10 text-amber-500'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Toggle filters"
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
            </button>
          </div>
        </form>

        {/* Curated Presets Bar */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-slate-400 font-medium whitespace-nowrap">Instant Demos:</span>
          {CURATED_SAMPLES.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setInputUrl(sample.url);
                onLoadPreset(sample);
              }}
              className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 hover:border-amber-500/50 hover:bg-amber-500/5 text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1"
            >
              <span>{sample.title}</span>
              <span className="font-mono text-slate-400">({sample.images.length})</span>
            </button>
          ))}
        </div>

        {/* Expandable Filter Row */}
        {showFilters && (
          <div className="p-3 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-4">
              {/* Search text */}
              <div className="relative min-w-[180px]">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search filename / alt..."
                  className="w-full pl-8 pr-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {/* Format Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Format:</span>
                <select
                  value={filterFormat}
                  onChange={(e) => setFilterFormat(e.target.value)}
                  className="px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none text-xs"
                >
                  <option value="all">All Formats</option>
                  <option value="webp">WebP</option>
                  <option value="jpeg">JPEG / JPG</option>
                  <option value="png">PNG</option>
                  <option value="svg">SVG</option>
                  <option value="gif">GIF</option>
                </select>
              </div>

              {/* Min Size Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Min Resolution:</span>
                <select
                  value={filterMinSize}
                  onChange={(e) => setFilterMinSize(Number(e.target.value))}
                  className="px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none text-xs"
                >
                  <option value={0}>Any Resolution</option>
                  <option value={600}>Medium (≥600px)</option>
                  <option value={1080}>Full HD (≥1080px)</option>
                  <option value={1920}>Ultra HD (≥1920px)</option>
                </select>
              </div>
            </div>

            <button
              onClick={() => {
                setFilterFormat('all');
                setFilterMinSize(0);
                setSearchQuery('');
              }}
              className="text-slate-500 hover:text-amber-500 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Current Target Site Info Bar */}
        {currentSiteUrl && (
          <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2 truncate">
              <span className="font-semibold text-slate-900 dark:text-white truncate">
                {currentSiteTitle || 'Active Website'}
              </span>
              <span aria-hidden="true">·</span>
              <a
                href={currentSiteUrl}
                target="_blank"
                rel="noreferrer"
                className="hover:text-amber-500 truncate flex items-center gap-1 font-mono text-[11px]"
              >
                <span>{currentSiteUrl}</span>
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums text-slate-700 dark:text-slate-300">
                {totalImagesCount} assets harvested
              </span>
            </div>

            {totalImagesCount > 0 && (
              <button
                onClick={onClearImages}
                className="text-slate-400 hover:text-red-400 transition-colors shrink-0 ml-2"
              >
                Clear Results
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

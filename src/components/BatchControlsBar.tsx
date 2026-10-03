import React, { useState } from 'react';
import {
  CheckSquare,
  Square,
  SlidersHorizontal,
  FolderOutput,
  FileEdit,
  Download,
  FolderPlus,
  CloudUpload,
  LayoutGrid,
  List,
  Sparkles,
  Users,
} from 'lucide-react';
import { CompressionConfig } from '../types';

interface BatchControlsBarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  viewMode: 'grid' | 'table';
  setViewMode: (mode: 'grid' | 'table') => void;
  compressionConfig: CompressionConfig;
  setCompressionConfig: React.Dispatch<React.SetStateAction<CompressionConfig>>;
  onOpenBulkRename: () => void;
  onOpenFolderOrganizer: () => void;
  onOpenSaveCollection: () => void;
  onOpenCloudSync: () => void;
  onStartZipDownload: () => void;
  onOpenCollaboration: () => void;
  isProcessing: boolean;
  processProgress: number;
  processStatusText: string;
}

export const BatchControlsBar: React.FC<BatchControlsBarProps> = ({
  selectedCount,
  totalCount,
  onSelectAll,
  onDeselectAll,
  viewMode,
  setViewMode,
  compressionConfig,
  setCompressionConfig,
  onOpenBulkRename,
  onOpenFolderOrganizer,
  onOpenSaveCollection,
  onOpenCloudSync,
  onStartZipDownload,
  onOpenCollaboration,
  isProcessing,
  processProgress,
  processStatusText,
}) => {
  const [showCompressionPopover, setShowCompressionPopover] = useState(false);

  const allSelected = selectedCount > 0 && selectedCount === totalCount;

  return (
    <div className="sticky top-[57px] z-20 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-2.5 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Selection and View controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={allSelected ? onDeselectAll : onSelectAll}
            className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:text-amber-500 transition-colors"
          >
            {allSelected ? (
              <CheckSquare className="w-4 h-4 text-amber-500" />
            ) : selectedCount > 0 ? (
              <div className="w-4 h-4 rounded bg-amber-500/20 border border-amber-500 flex items-center justify-center">
                <div className="w-2 h-2 bg-amber-500 rounded-xs" />
              </div>
            ) : (
              <Square className="w-4 h-4 text-slate-400" />
            )}
            <span className="font-mono tabular-nums">
              {selectedCount}/{totalCount} Selected
            </span>
          </button>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />

          {/* View Mode Toggle */}
          <div className="flex items-center gap-0.5 bg-slate-200/60 dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
              title="Table View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right: Batch Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Compression & Format Settings */}
          <div className="relative">
            <button
              onClick={() => setShowCompressionPopover(!showCompressionPopover)}
              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-400 dark:hover:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-500" />
              <span>
                Format: <strong className="uppercase font-mono">{compressionConfig.targetFormat}</strong>
              </span>
              <span className="text-slate-400 font-mono tabular-nums">
                ({Math.round(compressionConfig.quality * 100)}%)
              </span>
            </button>

            {/* Compression Popover */}
            {showCompressionPopover && (
              <div className="absolute right-0 mt-2 w-72 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 space-y-3.5">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="text-xs font-semibold text-slate-900 dark:text-white">
                    Format & Compression
                  </span>
                  <button
                    onClick={() => setShowCompressionPopover(false)}
                    className="text-xs text-slate-400 hover:text-slate-600"
                  >
                    Done
                  </button>
                </div>

                {/* Target Format */}
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    Output Format:
                  </label>
                  <div className="grid grid-cols-4 gap-1">
                    {(['original', 'webp', 'jpeg', 'png'] as const).map((fmt) => (
                      <button
                        key={fmt}
                        onClick={() => setCompressionConfig((prev) => ({ ...prev, targetFormat: fmt }))}
                        className={`py-1 text-xs font-mono rounded-md uppercase border transition-colors ${
                          compressionConfig.targetFormat === fmt
                            ? 'bg-amber-500 text-slate-950 font-bold border-amber-500'
                            : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {fmt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quality Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Quality Level:</span>
                    <span className="font-mono tabular-nums font-semibold text-amber-500">
                      {Math.round(compressionConfig.quality * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={compressionConfig.quality}
                    onChange={(e) =>
                      setCompressionConfig((prev) => ({ ...prev, quality: parseFloat(e.target.value) }))
                    }
                    className="w-full accent-amber-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>Smaller Size</span>
                    <span>Lossless Quality</span>
                  </div>
                </div>

                {/* Max Dimension Constraint */}
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    Max Resolution Constraint:
                  </label>
                  <select
                    value={compressionConfig.maxDimension}
                    onChange={(e) =>
                      setCompressionConfig((prev) => ({ ...prev, maxDimension: Number(e.target.value) }))
                    }
                    className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-slate-200"
                  >
                    <option value={0}>Original Dimensions</option>
                    <option value={1920}>1920px (Full HD Display)</option>
                    <option value={1280}>1280px (Standard Web)</option>
                    <option value={800}>800px (Mobile / Content)</option>
                    <option value={400}>400px (Thumbnails)</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Bulk Rename */}
          <button
            onClick={onOpenBulkRename}
            disabled={selectedCount === 0}
            className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-400 dark:hover:border-slate-700 disabled:opacity-40 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5"
            title="Batch Rename Patterns"
          >
            <FileEdit className="w-3.5 h-3.5 text-blue-500" />
            <span className="hidden sm:inline">Bulk</span> Rename
          </button>

          {/* Organize into Folders */}
          <button
            onClick={onOpenFolderOrganizer}
            disabled={selectedCount === 0}
            className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-400 dark:hover:border-slate-700 disabled:opacity-40 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5"
            title="Organize into folder directories"
          >
            <FolderOutput className="w-3.5 h-3.5 text-purple-500" />
            <span>Organize Folders</span>
          </button>

          {/* Save to Collection */}
          <button
            onClick={onOpenSaveCollection}
            disabled={selectedCount === 0}
            className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-400 dark:hover:border-slate-700 disabled:opacity-40 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5"
            title="Save selected images to vault collection"
          >
            <FolderPlus className="w-3.5 h-3.5 text-emerald-500" />
            <span className="hidden md:inline">Save Vault</span>
          </button>

          {/* Cloud Backup */}
          <button
            onClick={onOpenCloudSync}
            disabled={selectedCount === 0}
            className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-400 dark:hover:border-slate-700 disabled:opacity-40 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5"
            title="Backup to Google Drive or Dropbox"
          >
            <CloudUpload className="w-3.5 h-3.5 text-cyan-500" />
            <span className="hidden md:inline">Cloud</span>
          </button>

          {/* Collaborative Review */}
          <button
            onClick={onOpenCollaboration}
            className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-400 dark:hover:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5"
            title="Team annotations and approval workflow"
          >
            <Users className="w-3.5 h-3.5 text-pink-500" />
            <span className="hidden lg:inline">Team Review</span>
          </button>

          {/* Download ZIP Archive Master Button */}
          <button
            onClick={onStartZipDownload}
            disabled={selectedCount === 0 || isProcessing}
            className="px-4 py-1.5 bg-slate-900 dark:bg-amber-500 hover:bg-slate-800 dark:hover:bg-amber-600 disabled:opacity-50 text-white dark:text-slate-950 font-semibold text-xs rounded-lg transition-all shadow-xs flex items-center gap-1.5 whitespace-nowrap active:scale-[0.98]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download ZIP ({selectedCount})</span>
          </button>
        </div>
      </div>

      {/* Processing Progress Bar Modal / Banner */}
      {isProcessing && (
        <div className="max-w-7xl mx-auto mt-2 pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <div className="flex-1 bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-amber-500 h-full transition-all duration-300"
              style={{ width: `${processProgress}%` }}
            />
          </div>
          <span className="text-xs font-mono tabular-nums text-slate-600 dark:text-slate-400 whitespace-nowrap">
            {processProgress}% · {processStatusText}
          </span>
        </div>
      )}
    </div>
  );
};

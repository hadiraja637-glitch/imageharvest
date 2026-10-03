import React, { useState } from 'react';
import { X, Folder, FolderTree, Check, LayoutGrid, Sparkles } from 'lucide-react';
import { FolderRule, ScrapedImage } from '../types';
import { applyFolderRule } from '../utils/imageProcessor';

interface FolderOrganizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedImages: ScrapedImage[];
  onApplyFolderRule: (rule: FolderRule) => void;
}

export const FolderOrganizerModal: React.FC<FolderOrganizerModalProps> = ({
  isOpen,
  onClose,
  selectedImages,
  onApplyFolderRule,
}) => {
  const [rule, setRule] = useState<FolderRule>({
    mode: 'by-format',
    customFolderName: 'assets',
  });

  if (!isOpen) return null;

  // Calculate live folder distribution preview
  const distribution: Record<string, number> = {};
  selectedImages.forEach((img) => {
    const targetFolder = applyFolderRule(img, rule) || 'root';
    distribution[targetFolder] = (distribution[targetFolder] || 0) + 1;
  });

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    onApplyFolderRule(rule);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <FolderTree className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Folder Structure Organizer
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Categorize files into subdirectories for ZIP export and cloud sync.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleApply} className="p-6 space-y-5">
          {/* Rule modes */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Select Categorization Strategy:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                {
                  id: 'by-format' as const,
                  title: 'By File Format',
                  desc: 'Organize into /webp/, /jpeg/, /png/ folders',
                },
                {
                  id: 'by-resolution' as const,
                  title: 'By Resolution Tier',
                  desc: 'Split into /high-res/, /medium-res/, /thumbnails/',
                },
                {
                  id: 'by-source' as const,
                  title: 'By Web Context',
                  desc: 'Sort into /content/, /social-previews/, /favicons/',
                },
                {
                  id: 'custom' as const,
                  title: 'Single Custom Directory',
                  desc: 'Bundle into a specific custom directory',
                },
              ].map((option) => (
                <div
                  key={option.id}
                  onClick={() => setRule((prev) => ({ ...prev, mode: option.id }))}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    rule.mode === option.id
                      ? 'border-purple-500 bg-purple-500/5 ring-1 ring-purple-500/30'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-white">
                    <Folder className={`w-3.5 h-3.5 ${rule.mode === option.id ? 'text-purple-500' : 'text-slate-400'}`} />
                    <span>{option.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 pl-5.5">
                    {option.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Folder Input */}
          {rule.mode === 'custom' && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Custom Directory Name:
              </label>
              <input
                type="text"
                value={rule.customFolderName}
                onChange={(e) => setRule((prev) => ({ ...prev, customFolderName: e.target.value }))}
                placeholder="e.g. 2026-campaign-assets"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          )}

          {/* Live Directory Tree Breakdown */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Projected Archive Directory Structure:
            </span>
            <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1.5 font-mono text-xs">
              <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-bold">
                <FolderTree className="w-4 h-4 text-purple-500" />
                <span>export_archive.zip/</span>
              </div>
              <div className="pl-5 space-y-1">
                {Object.entries(distribution).map(([folderName, count]) => (
                  <div key={folderName} className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Folder className="w-3.5 h-3.5 text-amber-500 inline" />
                      <span>{folderName}/</span>
                    </span>
                    <span className="text-[11px] tabular-nums font-semibold text-slate-800 dark:text-slate-300">
                      {count} {count === 1 ? 'file' : 'files'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply Folder Organization</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

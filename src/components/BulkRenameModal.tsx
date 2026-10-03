import React, { useState } from 'react';
import { X, Sparkles, FileEdit, ArrowRight, Check } from 'lucide-react';
import { RenameConfig, ScrapedImage } from '../types';
import { applyRenameRule } from '../utils/imageProcessor';

interface BulkRenameModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedImages: ScrapedImage[];
  onApplyRename: (config: RenameConfig) => void;
}

export const BulkRenameModal: React.FC<BulkRenameModalProps> = ({
  isOpen,
  onClose,
  selectedImages,
  onApplyRename,
}) => {
  const [config, setConfig] = useState<RenameConfig>({
    pattern: '{original}_{0index}',
    prefix: '',
    suffix: '',
    findText: '',
    replaceText: '',
    caseTransform: 'lowercase',
    zeroPadding: 2,
    startIndex: 1,
  });

  if (!isOpen) return null;

  const presets = [
    { label: 'Sequence: name_01', pattern: '{original}_{0index}', case: 'lowercase' as const },
    { label: 'Dated: 2026-03_name', pattern: '{date}_{original}', case: 'lowercase' as const },
    { label: 'Asset Index: img_001', pattern: 'img_{00index}', case: 'lowercase' as const },
    { label: 'Dimension: name_1920x1080', pattern: '{original}_{width}x{height}', case: 'kebab' as const },
  ];

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    onApplyRename(config);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <FileEdit className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Bulk File Renaming Engine
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure batch transformation rules for {selectedImages.length} selected assets.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleApply} className="p-6 overflow-y-auto space-y-5">
          {/* Quick Presets */}
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Popular Presets:
            </span>
            <div className="flex flex-wrap gap-2">
              {presets.map((preset, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() =>
                    setConfig((prev) => ({
                      ...prev,
                      pattern: preset.pattern,
                      caseTransform: preset.case,
                    }))
                  }
                  className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Pattern Template Input */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Pattern Template:
              </label>
              <span className="text-slate-400 font-mono text-[11px]">
                Tokens: {'{original}'}, {'{index}'}, {'{0index}'}, {'{date}'}, {'{width}'}, {'{height}'}
              </span>
            </div>
            <input
              type="text"
              value={config.pattern}
              onChange={(e) => setConfig((prev) => ({ ...prev, pattern: e.target.value }))}
              placeholder="{original}_{0index}"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Prefix, Suffix, Start Index */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Add Prefix:
              </label>
              <input
                type="text"
                value={config.prefix}
                onChange={(e) => setConfig((prev) => ({ ...prev, prefix: e.target.value }))}
                placeholder="e.g. web_"
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Add Suffix:
              </label>
              <input
                type="text"
                value={config.suffix}
                onChange={(e) => setConfig((prev) => ({ ...prev, suffix: e.target.value }))}
                placeholder="e.g. _v1"
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Start Index & Padding:
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  value={config.startIndex}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, startIndex: parseInt(e.target.value) || 1 }))
                  }
                  className="w-20 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono text-slate-900 dark:text-white"
                />
                <select
                  value={config.zeroPadding}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, zeroPadding: parseInt(e.target.value) || 2 }))
                  }
                  className="flex-1 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-slate-200"
                >
                  <option value={1}>1, 2, 3</option>
                  <option value={2}>01, 02, 03</option>
                  <option value={3}>001, 002, 003</option>
                </select>
              </div>
            </div>
          </div>

          {/* Find & Replace + Case Transform */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Find String:
              </label>
              <input
                type="text"
                value={config.findText}
                onChange={(e) => setConfig((prev) => ({ ...prev, findText: e.target.value }))}
                placeholder="text to match"
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Replace With:
              </label>
              <input
                type="text"
                value={config.replaceText}
                onChange={(e) => setConfig((prev) => ({ ...prev, replaceText: e.target.value }))}
                placeholder="replacement"
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Case Transform:
              </label>
              <select
                value={config.caseTransform}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    caseTransform: e.target.value as RenameConfig['caseTransform'],
                  }))
                }
                className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-slate-200"
              >
                <option value="none">Preserve Original</option>
                <option value="lowercase">lowercase</option>
                <option value="uppercase">UPPERCASE</option>
                <option value="kebab">kebab-case</option>
                <option value="snake">snake_case</option>
              </select>
            </div>
          </div>

          {/* Live Preview Table */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Live Preview (Showing {Math.min(5, selectedImages.length)} of {selectedImages.length}):
            </span>
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-xs font-mono">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500">
                  <tr>
                    <th className="py-2 px-3">Original Name</th>
                    <th className="py-2 px-3 w-6 text-center"></th>
                    <th className="py-2 px-3">New Output Name</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {selectedImages.slice(0, 5).map((img, idx) => {
                    const previewName = applyRenameRule(img, idx, config);
                    return (
                      <tr key={img.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/40">
                        <td className="py-2 px-3 text-slate-500 truncate max-w-[200px]">
                          {img.originalName}
                        </td>
                        <td className="py-2 px-3 text-center text-slate-400">
                          <ArrowRight className="w-3.5 h-3.5 inline" />
                        </td>
                        <td className="py-2 px-3 text-blue-600 dark:text-blue-400 font-semibold truncate max-w-[240px]">
                          {previewName}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
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
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply Renaming Rule</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

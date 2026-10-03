import React, { useState } from 'react';
import {
  FolderHeart,
  Plus,
  Pin,
  Trash2,
  Download,
  FolderOpen,
  Calendar,
  Layers,
  Sparkles,
  ExternalLink,
  Upload,
} from 'lucide-react';
import { Collection, ScrapedImage } from '../types';
import { getProxyUrl } from '../utils/imageProcessor';

interface CollectionsViewProps {
  collections: Collection[];
  onOpenCollection: (collection: Collection) => void;
  onDeleteCollection: (id: string) => void;
  onTogglePin: (id: string) => void;
  onExportCollectionZip: (collection: Collection) => void;
  onCreateCollection: (name: string, description: string, tags: string[]) => void;
  onImportCollectionsJson: (jsonString: string) => void;
}

export const CollectionsView: React.FC<CollectionsViewProps> = ({
  collections,
  onOpenCollection,
  onDeleteCollection,
  onTogglePin,
  onExportCollectionZip,
  onCreateCollection,
  onImportCollectionsJson,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    onCreateCollection(name.trim(), description.trim(), tags);
    setName('');
    setDescription('');
    setTagsInput('');
    setShowCreateModal(false);
  };

  const handleExportBackupJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(collections, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `imageharvest_vault_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportBackupJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        onImportCollectionsJson(content);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <FolderHeart className="w-5 h-5 text-amber-500" />
            <span>Saved Image Collections & Vaults</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Organized asset libraries saved from scrapes with offline persistence and backup sync.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Export JSON backup */}
          <button
            onClick={handleExportBackupJson}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5"
            title="Download JSON metadata backup"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export Vault</span> JSON
          </button>

          {/* Import JSON label */}
          <label className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Restore</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportBackupJson}
              className="hidden"
            />
          </label>

          {/* New Collection */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg transition-all shadow-xs flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>New Collection</span>
          </button>
        </div>
      </div>

      {/* Grid of collections */}
      {collections.length === 0 ? (
        <div className="p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
          <FolderHeart className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            No saved collections yet
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Scrape any website and click "Save Vault" to create your first organized library.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-amber-500 text-slate-950 font-semibold text-xs rounded-xl"
          >
            Create Empty Collection
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {collections.map((col) => (
            <div
              key={col.id}
              className="flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-xl overflow-hidden shadow-xs transition-all group"
            >
              {/* Image preview strip */}
              <div className="relative h-36 bg-slate-100 dark:bg-slate-950 flex overflow-hidden">
                {col.images.slice(0, 4).map((img, i) => (
                  <div key={img.id || i} className="flex-1 h-full border-r border-slate-200/50 dark:border-slate-800/50 last:border-r-0 overflow-hidden">
                    <img
                      src={getProxyUrl(img.url)}
                      alt={img.alt || img.originalName}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
                {col.images.length === 0 && (
                  <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                    No images saved yet
                  </div>
                )}

                {/* Pin button */}
                <button
                  onClick={() => onTogglePin(col.id)}
                  className={`absolute top-2.5 right-2.5 p-1.5 rounded-lg backdrop-blur-xs transition-colors ${
                    col.pinned
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-black/50 text-white/80 hover:text-white'
                  }`}
                  title={col.pinned ? 'Unpin' : 'Pin to top'}
                >
                  <Pin className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {col.name}
                    </h3>
                  </div>
                  {col.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {col.description}
                    </p>
                  )}
                </div>

                {/* Unboxed Metadata & Tags */}
                <div className="space-y-2 text-xs">
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {col.images.length} {col.images.length === 1 ? 'asset' : 'assets'}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{new Date(col.createdAt).toLocaleDateString()}</span>
                  </div>

                  {col.tags.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
                      {col.tags.map((t, idx) => (
                        <span key={idx}>
                          #{t}
                          {idx < col.tags.length - 1 && <span className="ml-1 text-slate-300">·</span>}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Buttons */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onOpenCollection(col)}
                    className="flex-1 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    <FolderOpen className="w-3.5 h-3.5 text-amber-500" />
                    <span>Open in Editor</span>
                  </button>

                  <button
                    onClick={() => onExportCollectionZip(col)}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-amber-500 hover:bg-slate-50 dark:hover:bg-slate-800"
                    title="Export as ZIP Archive"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onDeleteCollection(col.id)}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                    title="Delete collection"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Collection Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Create Asset Collection
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Collection Name:
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. 2026 Spring Launch Photography"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Description (optional):
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief summary of image assets and project scope..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Tags (comma-separated):
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="e.g. Marketing, HighRes, WebP"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 text-slate-950 font-bold rounded-lg shadow-xs"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

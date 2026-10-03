import React from 'react';
import {
  Check,
  Folder,
  Eye,
  Download,
  CheckCircle2,
  AlertCircle,
  Clock,
  Copy,
} from 'lucide-react';
import { ScrapedImage } from '../types';
import { formatBytes, getProxyUrl } from '../utils/imageProcessor';

interface ImageTableProps {
  images: ScrapedImage[];
  onToggleSelect: (id: string) => void;
  onInspect: (image: ScrapedImage) => void;
  onDownloadSingle: (image: ScrapedImage) => void;
}

export const ImageTable: React.FC<ImageTableProps> = ({
  images,
  onToggleSelect,
  onInspect,
  onDownloadSingle,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-mono text-[11px] tracking-wider">
            <tr>
              <th className="py-3 px-4 w-10 text-center">Sel</th>
              <th className="py-3 px-3 w-16">Preview</th>
              <th className="py-3 px-4">Output Filename</th>
              <th className="py-3 px-3">Target Folder</th>
              <th className="py-3 px-3">Dimensions</th>
              <th className="py-3 px-3">Format</th>
              <th className="py-3 px-3 text-right">Est. Size</th>
              <th className="py-3 px-4">Review State</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
            {images.map((img) => (
              <tr
                key={img.id}
                onClick={() => onToggleSelect(img.id)}
                className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer transition-colors ${
                  img.selected ? 'bg-amber-500/5' : ''
                }`}
              >
                {/* Checkbox */}
                <td className="py-2.5 px-4 text-center">
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleSelect(img.id);
                    }}
                    className={`w-4 h-4 mx-auto rounded border flex items-center justify-center transition-colors ${
                      img.selected
                        ? 'bg-amber-500 border-amber-500 text-slate-950'
                        : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-transparent'
                    }`}
                  >
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                </td>

                {/* Thumbnail */}
                <td className="py-2.5 px-3">
                  <div className="w-12 h-9 rounded bg-slate-100 dark:bg-slate-950 overflow-hidden border border-slate-200 dark:border-slate-800 shrink-0">
                    <img
                      src={getProxyUrl(img.url)}
                      alt={img.alt}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </td>

                {/* Filename */}
                <td className="py-2.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                  <div className="truncate max-w-[240px]" title={img.newName || img.originalName}>
                    {img.newName || img.originalName}
                  </div>
                  <div className="text-[10px] text-slate-400 font-normal truncate max-w-[240px]">
                    Orig: {img.originalName}
                  </div>
                </td>

                {/* Target Folder */}
                <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-1">
                    <Folder className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span className="truncate max-w-[120px]">{img.folder || 'root'}</span>
                  </div>
                </td>

                {/* Dimensions */}
                <td className="py-2.5 px-3 tabular-nums text-slate-600 dark:text-slate-400 whitespace-nowrap">
                  {img.width && img.height ? `${img.width}×${img.height}` : 'Dynamic'}
                </td>

                {/* Format */}
                <td className="py-2.5 px-3">
                  <span className="font-bold uppercase text-[11px] text-slate-700 dark:text-slate-300">
                    {img.format}
                  </span>
                </td>

                {/* Size */}
                <td className="py-2.5 px-3 text-right tabular-nums whitespace-nowrap">
                  <span className="text-slate-800 dark:text-slate-200 font-semibold">
                    {formatBytes(img.compressedSizeBytes || img.sizeBytes)}
                  </span>
                </td>

                {/* Review status */}
                <td className="py-2.5 px-4">
                  <div className="flex items-center gap-1.5">
                    {img.approvalStatus === 'approved' && (
                      <span className="text-emerald-500 flex items-center gap-1 font-sans text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approved</span>
                      </span>
                    )}
                    {img.approvalStatus === 'changes_requested' && (
                      <span className="text-red-500 flex items-center gap-1 font-sans text-xs">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Revision</span>
                      </span>
                    )}
                    {(!img.approvalStatus || img.approvalStatus === 'pending') && (
                      <span className="text-slate-400 flex items-center gap-1 font-sans text-xs">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Pending</span>
                      </span>
                    )}
                  </div>
                </td>

                {/* Actions */}
                <td className="py-2.5 px-4 text-right">
                  <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onInspect(img)}
                      title="Inspect & Annotate"
                      className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-amber-500"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDownloadSingle(img)}
                      title="Download image"
                      className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-amber-500"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

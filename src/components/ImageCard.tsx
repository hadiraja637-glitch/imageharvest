import React, { useState } from 'react';
import {
  Download,
  Eye,
  Check,
  Folder,
  MessageSquare,
  Copy,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { ScrapedImage } from '../types';
import { formatBytes, getProxyUrl } from '../utils/imageProcessor';

interface ImageCardProps {
  image: ScrapedImage;
  onToggleSelect: (id: string) => void;
  onInspect: (image: ScrapedImage) => void;
  onDownloadSingle: (image: ScrapedImage) => void;
}

export const ImageCard: React.FC<ImageCardProps> = ({
  image,
  onToggleSelect,
  onInspect,
  onDownloadSingle,
}) => {
  const [copied, setCopied] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(image.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Calculate savings percentage if compressed
  const savingsPct =
    image.sizeBytes && image.compressedSizeBytes && image.compressedSizeBytes < image.sizeBytes
      ? Math.round(((image.sizeBytes - image.compressedSizeBytes) / image.sizeBytes) * 100)
      : null;

  return (
    <div
      onClick={() => onToggleSelect(image.id)}
      className={`group relative flex flex-col bg-white dark:bg-slate-900 border rounded-xl overflow-hidden transition-all duration-200 cursor-pointer ${
        image.selected
          ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-md'
          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
      }`}
    >
      {/* Top Media Container */}
      <div className="relative aspect-4/3 bg-slate-100 dark:bg-slate-950 overflow-hidden flex items-center justify-center">
        {imgError ? (
          <div className="p-4 text-center text-xs text-slate-400 flex flex-col items-center gap-1.5">
            <AlertCircle className="w-6 h-6 text-slate-400" />
            <span className="truncate max-w-[140px]">{image.originalName}</span>
          </div>
        ) : (
          <img
            src={getProxyUrl(image.url)}
            alt={image.alt || image.originalName}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        )}

        {/* Selection Checkbox Overlay */}
        <div className="absolute top-2.5 left-2.5 z-10">
          <div
            onClick={(e) => {
              e.stopPropagation();
              onToggleSelect(image.id);
            }}
            className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
              image.selected
                ? 'bg-amber-500 border-amber-500 text-slate-950 shadow-xs'
                : 'bg-white/80 dark:bg-slate-900/80 border-slate-300 dark:border-slate-700 backdrop-blur-xs text-transparent hover:border-amber-500'
            }`}
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </div>
        </div>

        {/* Quick Action Overlay Buttons */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onInspect(image);
            }}
            title="Inspect & Annotate"
            className="p-1.5 rounded-md bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 hover:text-amber-500 border border-slate-200 dark:border-slate-700 backdrop-blur-xs transition-colors shadow-xs"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDownloadSingle(image);
            }}
            title="Download Converted Image"
            className="p-1.5 rounded-md bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 hover:text-amber-500 border border-slate-200 dark:border-slate-700 backdrop-blur-xs transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleCopy}
            title={copied ? 'Copied URL!' : 'Copy Direct URL'}
            className="p-1.5 rounded-md bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 hover:text-amber-500 border border-slate-200 dark:border-slate-700 backdrop-blur-xs transition-colors shadow-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Format Badge Bottom Left */}
        <div className="absolute bottom-2 left-2 z-10">
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-black/60 text-white backdrop-blur-xs">
            {image.format}
          </span>
        </div>

        {/* Compression Savings Pill-free callout bottom right */}
        {savingsPct && (
          <div className="absolute bottom-2 right-2 z-10">
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 backdrop-blur-xs">
              -{savingsPct}%
            </span>
          </div>
        )}
      </div>

      {/* Card Content & Zero-Pill Typography */}
      <div className="p-3 flex flex-col gap-1.5 flex-1">
        {/* Output / New Name */}
        <div className="flex items-center justify-between gap-2">
          <p
            className="text-xs font-semibold text-slate-900 dark:text-white truncate font-mono"
            title={image.newName || image.originalName}
          >
            {image.newName || image.originalName}
          </p>
        </div>

        {/* Metadata in Clean Unboxed Text with Separators */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-mono tabular-nums">
          {image.width && image.height ? (
            <span>
              {image.width}×{image.height}
            </span>
          ) : (
            <span>Auto res</span>
          )}
          <span aria-hidden="true">·</span>
          <span>{formatBytes(image.compressedSizeBytes || image.sizeBytes)}</span>
          {image.folder && (
            <>
              <span aria-hidden="true">·</span>
              <span className="text-slate-600 dark:text-slate-300 flex items-center gap-0.5">
                <Folder className="w-3 h-3 text-amber-500 inline" />
                <span className="truncate max-w-[80px]">{image.folder}</span>
              </span>
            </>
          )}
        </div>

        {/* Bottom Footer: Approval state & Annotation count */}
        <div className="mt-auto pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
          {/* Approval indicator */}
          <div className="flex items-center gap-1">
            {image.approvalStatus === 'approved' && (
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3 h-3" />
                <span>Approved</span>
              </span>
            )}
            {image.approvalStatus === 'changes_requested' && (
              <span className="text-red-500 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3 h-3" />
                <span>Revision</span>
              </span>
            )}
            {(!image.approvalStatus || image.approvalStatus === 'pending') && (
              <span className="text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>Pending Review</span>
              </span>
            )}
          </div>

          {/* Annotations counter */}
          {(image.annotationsCount ?? 0) > 0 && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                onInspect(image);
              }}
              className="text-amber-500 hover:text-amber-400 flex items-center gap-1 cursor-pointer font-mono font-medium"
            >
              <MessageSquare className="w-3 h-3" />
              <span>{image.annotationsCount}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

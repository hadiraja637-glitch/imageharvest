import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Download,
  Sliders,
  Sparkles,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Plus,
} from 'lucide-react';
import { ImageAnnotation, ScrapedImage } from '../types';
import { convertAndCompressImage, formatBytes, getProxyUrl } from '../utils/imageProcessor';

interface ImageLightboxProps {
  image: ScrapedImage | null;
  onClose: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  onSaveAnnotation: (annotation: Omit<ImageAnnotation, 'id' | 'timestamp'>) => void;
  annotations: ImageAnnotation[];
  onToggleResolveAnnotation: (annotationId: string) => void;
  onUpdateApproval: (imageId: string, status: ScrapedImage['approvalStatus']) => void;
  onDownloadImage: (image: ScrapedImage, targetFormat: 'webp' | 'jpeg' | 'png', quality: number) => void;
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({
  image,
  onClose,
  onPrevious,
  onNext,
  onSaveAnnotation,
  annotations,
  onToggleResolveAnnotation,
  onUpdateApproval,
  onDownloadImage,
}) => {
  const [activeTab, setActiveTab] = useState<'inspect' | 'convert' | 'comments'>('convert');
  const [format, setFormat] = useState<'webp' | 'jpeg' | 'png'>('webp');
  const [quality, setQuality] = useState(0.85);
  const [liveCompressedSize, setLiveCompressedSize] = useState<number | null>(null);
  const [isCompressingLive, setIsCompressingLive] = useState(false);
  const [colorPalette, setColorPalette] = useState<string[]>([]);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  // Annotation placement state
  const [newPinCoords, setNewPinCoords] = useState<{ x: number; y: number } | null>(null);
  const [commentText, setCommentText] = useState('');
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!image) return;

    // Reset settings for this image
    setLiveCompressedSize(null);
    setNewPinCoords(null);
    setCommentText('');

    // Live compress preview
    setIsCompressingLive(true);
    convertAndCompressImage(image, {
      targetFormat: format,
      quality,
      maxDimension: 0,
      stripExif: true,
    })
      .then((res) => {
        setLiveCompressedSize(res.newSize);
      })
      .catch((e) => {
        console.warn('Live compress preview note:', e);
      })
      .finally(() => {
        setIsCompressingLive(false);
      });

    // Extract dominant colors
    extractColors(image.url);
  }, [image, format, quality]);

  const extractColors = (url: string) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = getProxyUrl(url);
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 50;
        canvas.height = 50;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, 50, 50);
        const data = ctx.getImageData(0, 0, 50, 50).data;

        const hexList: string[] = [];
        for (let i = 0; i < data.length; i += 200) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
          if (!hexList.includes(hex) && hexList.length < 5) {
            hexList.push(hex);
          }
        }
        setColorPalette(hexList.length > 0 ? hexList : ['#1E293B', '#F59E0B', '#10B981', '#3B82F6', '#EC4899']);
      } catch {
        setColorPalette(['#0F172A', '#334155', '#E2E8F0', '#F59E0B', '#0284C7']);
      }
    };
  };

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
      const xPercent = Math.round((x / rect.width) * 100);
      const yPercent = Math.round((y / rect.height) * 100);
      setNewPinCoords({ x: xPercent, y: yPercent });
      setActiveTab('comments');
    }
  };

  const handleAddAnnotation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!image || !newPinCoords || !commentText.trim()) return;

    onSaveAnnotation({
      imageId: image.id,
      xPercent: newPinCoords.x,
      yPercent: newPinCoords.y,
      authorName: 'Momna (Lead)',
      authorAvatar: '/src/assets/images/avatar_momna_user_1791034104404.jpg',
      comment: commentText.trim(),
      status: 'open',
    });

    setNewPinCoords(null);
    setCommentText('');
  };

  if (!image) return null;

  const currentAnnotations = annotations.filter((a) => a.imageId === image.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-6xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col lg:flex-row max-h-[90vh]">
        {/* Close Button Top Right */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-30 p-2 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Left: Interactive Media Viewport with Pinned Annotations */}
        <div className="relative flex-1 bg-slate-950 flex items-center justify-center p-4 min-h-[360px] lg:min-h-[560px] overflow-hidden select-none">
          <div
            onClick={handleImageClick}
            className="relative cursor-crosshair max-w-full max-h-[75vh] flex items-center justify-center"
            title="Click anywhere on the image to drop a team feedback pin"
          >
            <img
              ref={imgRef}
              src={getProxyUrl(image.url)}
              alt={image.alt || image.originalName}
              referrerPolicy="no-referrer"
              className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-lg pointer-events-auto"
            />

            {/* Existing review pins */}
            {currentAnnotations.map((pin, idx) => (
              <div
                key={pin.id}
                style={{ left: `${pin.xPercent}%`, top: `${pin.yPercent}%` }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono shadow-lg transition-transform hover:scale-125 z-20 cursor-pointer ${
                  pin.status === 'resolved'
                    ? 'bg-emerald-500 text-slate-950 ring-2 ring-emerald-300'
                    : 'bg-amber-500 text-slate-950 ring-2 ring-amber-300'
                }`}
                title={`${pin.authorName}: ${pin.comment}`}
              >
                {idx + 1}
              </div>
            ))}

            {/* In-progress new pin marker */}
            {newPinCoords && (
              <div
                style={{ left: `${newPinCoords.x}%`, top: `${newPinCoords.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-pink-500 text-white flex items-center justify-center text-xs font-bold ring-4 ring-pink-300 animate-pulse z-20"
              >
                +
              </div>
            )}
          </div>

          {/* Navigation Arrows */}
          {onPrevious && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPrevious();
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          {onNext && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNext();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white transition-colors lg:hidden"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}

          <div className="absolute bottom-3 left-4 text-xs text-slate-400 bg-black/60 px-2.5 py-1 rounded-md backdrop-blur-xs font-mono">
            Click image to drop team comment pin
          </div>
        </div>

        {/* Right: Inspector, Converter, and Feedback Sidebar */}
        <div className="w-full lg:w-96 flex flex-col bg-white dark:bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 overflow-y-auto">
          {/* Header tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 p-2 gap-1 bg-slate-50 dark:bg-slate-950/40">
            <button
              onClick={() => setActiveTab('convert')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === 'convert'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Convert & Save</span>
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === 'comments'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Team Pins ({currentAnnotations.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('inspect')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === 'inspect'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Inspector</span>
            </button>
          </div>

          <div className="p-4 sm:p-5 flex-1 space-y-4">
            {/* Tab 1: Format Conversion & Quality */}
            {activeTab === 'convert' && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                    Format & Compression Engine
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Real-time browser canvas transcoding & size estimation.
                  </p>
                </div>

                {/* Target Format Buttons */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                    Output Format:
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['webp', 'jpeg', 'png'] as const).map((fmt) => (
                      <button
                        key={fmt}
                        onClick={() => setFormat(fmt)}
                        className={`py-2 text-xs font-mono uppercase font-semibold rounded-lg border transition-all ${
                          format === fmt
                            ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs'
                            : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        {fmt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quality Slider */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-600 dark:text-slate-300">
                      Encoding Quality:
                    </span>
                    <span className="font-mono font-bold text-amber-500 tabular-nums">
                      {Math.round(quality * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={quality}
                    onChange={(e) => setQuality(parseFloat(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>Ultra-small (Web)</span>
                    <span>High Fidelity</span>
                  </div>
                </div>

                {/* Live Size & Savings Comparison Box */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Original Size:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {formatBytes(image.sizeBytes || 820000)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Transcoded ({format.toUpperCase()}):</span>
                    <span className="font-bold text-amber-500">
                      {isCompressingLive ? 'Transcoding...' : formatBytes(liveCompressedSize || 240000)}
                    </span>
                  </div>
                  {liveCompressedSize && image.sizeBytes && liveCompressedSize < image.sizeBytes && (
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                      <span>Bandwidth Saved:</span>
                      <span>
                        -
                        {Math.round(((image.sizeBytes - liveCompressedSize) / image.sizeBytes) * 100)}
                        %
                      </span>
                    </div>
                  )}
                </div>

                {/* Team Approval Switcher */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                    Production Approval:
                  </label>
                  <div className="grid grid-cols-3 gap-1">
                    <button
                      onClick={() => onUpdateApproval(image.id, 'approved')}
                      className={`py-1.5 text-xs rounded-lg border transition-colors flex items-center justify-center gap-1 ${
                        image.approvalStatus === 'approved'
                          ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500 font-semibold'
                          : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => onUpdateApproval(image.id, 'changes_requested')}
                      className={`py-1.5 text-xs rounded-lg border transition-colors flex items-center justify-center gap-1 ${
                        image.approvalStatus === 'changes_requested'
                          ? 'bg-red-500/10 border-red-500 text-red-500 font-semibold'
                          : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Revision</span>
                    </button>
                    <button
                      onClick={() => onUpdateApproval(image.id, 'pending')}
                      className={`py-1.5 text-xs rounded-lg border transition-colors flex items-center justify-center gap-1 ${
                        !image.approvalStatus || image.approvalStatus === 'pending'
                          ? 'bg-slate-200 dark:bg-slate-800 border-slate-400 text-slate-700 dark:text-slate-300 font-semibold'
                          : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <span>Pending</span>
                    </button>
                  </div>
                </div>

                {/* Download Button */}
                <button
                  onClick={() => onDownloadImage(image, format, quality)}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  <Download className="w-4 h-4" />
                  <span>Download This Asset ({format.toUpperCase()})</span>
                </button>
              </div>
            )}

            {/* Tab 2: Team Annotations & Comments */}
            {activeTab === 'comments' && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                    Team Feedback Pins
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Click anywhere on the image to pin specific feedback for designers.
                  </p>
                </div>

                {/* Form to submit active pin */}
                {newPinCoords ? (
                  <form onSubmit={handleAddAnnotation} className="p-3 bg-pink-500/5 border border-pink-500/30 rounded-xl space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-semibold text-pink-600 dark:text-pink-400">
                      <span>New Pin at {newPinCoords.x}%, {newPinCoords.y}%</span>
                      <button
                        type="button"
                        onClick={() => setNewPinCoords(null)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        Cancel
                      </button>
                    </div>
                    <textarea
                      rows={2}
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="e.g. Crop out excess bottom margin or boost contrast..."
                      className="w-full p-2 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-pink-500"
                    />
                    <button
                      type="submit"
                      disabled={!commentText.trim()}
                      className="w-full py-1.5 bg-pink-500 hover:bg-pink-600 disabled:opacity-50 text-white font-medium text-xs rounded-lg transition-colors shadow-xs"
                    >
                      Post Team Comment
                    </button>
                  </form>
                ) : (
                  <div className="p-2.5 text-center text-xs text-slate-500 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl">
                    Click on the image preview to place a marker.
                  </div>
                )}

                {/* List of existing annotations */}
                <div className="space-y-2.5 max-h-64 overflow-y-auto">
                  {currentAnnotations.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4">
                      No feedback pins yet. Be the first to annotate!
                    </p>
                  ) : (
                    currentAnnotations.map((pin, idx) => (
                      <div
                        key={pin.id}
                        className={`p-3 rounded-xl border text-xs space-y-1.5 transition-colors ${
                          pin.status === 'resolved'
                            ? 'bg-slate-50/50 dark:bg-slate-950/30 border-slate-200 dark:border-slate-800 opacity-60'
                            : 'bg-white dark:bg-slate-900 border-amber-500/30'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold font-mono text-[10px] flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <span className="font-semibold text-slate-900 dark:text-white">
                              {pin.authorName}
                            </span>
                          </div>
                          <button
                            onClick={() => onToggleResolveAnnotation(pin.id)}
                            className="text-[11px] font-medium text-slate-500 hover:text-emerald-500 flex items-center gap-1"
                          >
                            <CheckCircle2 className={`w-3.5 h-3.5 ${pin.status === 'resolved' ? 'text-emerald-500' : ''}`} />
                            <span>{pin.status === 'resolved' ? 'Resolved' : 'Resolve'}</span>
                          </button>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 pl-6.5 text-[11px] leading-relaxed">
                          {pin.comment}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Tab 3: Detailed Technical Inspection */}
            {activeTab === 'inspect' && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                    Technical Specifications
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Extracted metadata and color signature.
                  </p>
                </div>

                {/* Color Palette Extractor Swatches */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-600 dark:text-slate-300">
                      Dominant Color Palette:
                    </span>
                    {copiedHex && (
                      <span className="text-[10px] font-mono text-emerald-500">
                        Copied {copiedHex}!
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-5 gap-1.5">
                    {colorPalette.map((hex, i) => (
                      <div
                        key={i}
                        onClick={() => {
                          navigator.clipboard.writeText(hex);
                          setCopiedHex(hex);
                          setTimeout(() => setCopiedHex(null), 2000);
                        }}
                        style={{ backgroundColor: hex }}
                        className="h-10 rounded-lg border border-black/10 dark:border-white/10 flex items-end justify-center pb-1 text-[9px] font-mono font-bold text-white shadow-xs cursor-pointer hover:scale-105 transition-transform"
                        title={`Click to copy ${hex}`}
                      >
                        <span className="bg-black/40 px-1 rounded">{hex.replace('#', '')}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Metadata key-value list */}
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Original Filename:</span>
                    <span className="text-slate-800 dark:text-slate-200 truncate max-w-[160px]" title={image.originalName}>
                      {image.originalName}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Natural Resolution:</span>
                    <span className="text-slate-800 dark:text-slate-200">
                      {image.width && image.height ? `${image.width} × ${image.height} px` : 'Auto'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Detected Format:</span>
                    <span className="text-slate-800 dark:text-slate-200 uppercase">
                      {image.format}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">DOM Source Type:</span>
                    <span className="text-slate-800 dark:text-slate-200">
                      &lt;{image.sourceType}&gt;
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Target Folder:</span>
                    <span className="text-slate-800 dark:text-slate-200">
                      {image.folder || 'root'}
                    </span>
                  </div>
                  <div className="pt-1">
                    <span className="text-slate-500 block mb-1">Source URL:</span>
                    <a
                      href={image.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-amber-500 hover:underline break-all flex items-center gap-1"
                    >
                      <span className="truncate">{image.url}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

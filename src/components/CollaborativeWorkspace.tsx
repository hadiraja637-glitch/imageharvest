import React, { useState } from 'react';
import {
  Users,
  CheckCircle2,
  AlertCircle,
  Clock,
  MessageSquare,
  Sparkles,
  Download,
  Share2,
  Filter,
  Check,
} from 'lucide-react';
import { ImageAnnotation, ScrapedImage } from '../types';
import { getProxyUrl } from '../utils/imageProcessor';

interface CollaborativeWorkspaceProps {
  images: ScrapedImage[];
  annotations: ImageAnnotation[];
  onInspectImage: (image: ScrapedImage) => void;
  onUpdateApproval: (imageId: string, status: ScrapedImage['approvalStatus']) => void;
  onBatchApprove: () => void;
}

export const CollaborativeWorkspace: React.FC<CollaborativeWorkspaceProps> = ({
  images,
  annotations,
  onInspectImage,
  onUpdateApproval,
  onBatchApprove,
}) => {
  const [filterState, setFilterState] = useState<'all' | 'approved' | 'changes_requested' | 'pending'>('all');
  const [copiedLink, setCopiedLink] = useState(false);

  const teamMembers = [
    {
      name: 'Momna (You)',
      role: 'Project Lead',
      avatar: '/src/assets/images/avatar_momna_user_1791034104404.jpg',
      status: 'Active now',
      color: 'bg-emerald-500',
    },
    {
      name: 'Alex Rivera',
      role: 'Art Director',
      avatar: '/src/assets/images/avatar_alex_artdirector_1791034120051.jpg',
      status: 'Reviewing assets',
      color: 'bg-blue-500',
    },
    {
      name: 'Sarah Kim',
      role: 'Production Designer',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      status: 'Online',
      color: 'bg-amber-500',
    },
  ];

  const filteredImages = images.filter((img) => {
    if (filterState === 'all') return true;
    if (filterState === 'pending') return !img.approvalStatus || img.approvalStatus === 'pending';
    return img.approvalStatus === filterState;
  });

  const approvedCount = images.filter((i) => i.approvalStatus === 'approved').length;
  const changesCount = images.filter((i) => i.approvalStatus === 'changes_requested').length;
  const pendingCount = images.length - approvedCount - changesCount;

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleExportReviewReport = () => {
    let report = `# ImageHarvest Pro - Team Review Report\n`;
    report += `Generated: ${new Date().toLocaleString()}\n`;
    report += `Total Assets: ${images.length} | Approved: ${approvedCount} | Changes Requested: ${changesCount} | Pending: ${pendingCount}\n\n`;
    report += `## Asset Feedback Breakdown\n\n`;

    images.forEach((img) => {
      const imgAnn = annotations.filter((a) => a.imageId === img.id);
      report += `### ${img.newName || img.originalName} (${img.format.toUpperCase()})\n`;
      report += `- Status: ${img.approvalStatus || 'pending'}\n`;
      report += `- Resolution: ${img.width || '?'}x${img.height || '?'}\n`;
      if (imgAnn.length > 0) {
        report += `- Pinned Comments (${imgAnn.length}):\n`;
        imgAnn.forEach((a, i) => {
          report += `  ${i + 1}. [${a.authorName}]: "${a.comment}" (${a.status})\n`;
        });
      } else {
        report += `- No pinned comments.\n`;
      }
      report += `\n`;
    });

    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `team_review_report_${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header with Presence Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-pink-500" />
            <span>Collaborative Review & Team Feedback Workspace</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time peer reviews, pinned canvas feedback, and sign-offs for production assets.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyShareLink}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Link Copied!' : 'Invite Teammate'}</span>
          </button>

          <button
            onClick={handleExportReviewReport}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report (.md)</span>
          </button>

          <button
            onClick={onBatchApprove}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-all shadow-xs flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Approve All ({images.length})</span>
          </button>
        </div>
      </div>

      {/* Online Team Presence Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">
            Active Reviewers:
          </span>
          <div className="flex items-center gap-3">
            {teamMembers.map((member, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="relative w-8 h-8 rounded-full overflow-hidden border border-slate-300 dark:border-slate-700 shrink-0">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div
                    className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-slate-900 ${member.color}`}
                  />
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">
                    {member.name}
                  </div>
                  <div className="text-[10px] text-slate-400">{member.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Approval Stats Summary Pill-free */}
        <div className="flex items-center gap-4 text-xs font-mono tabular-nums">
          <span className="text-emerald-500 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{approvedCount} Approved</span>
          </span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span className="text-red-500 font-semibold flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{changesCount} Revision</span>
          </span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span className="text-slate-400 font-semibold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{pendingCount} Pending</span>
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 text-xs">
        <button
          onClick={() => setFilterState('all')}
          className={`px-3 py-1.5 rounded-lg border font-medium transition-colors ${
            filterState === 'all'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white'
              : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          All Assets ({images.length})
        </button>
        <button
          onClick={() => setFilterState('approved')}
          className={`px-3 py-1.5 rounded-lg border font-medium transition-colors ${
            filterState === 'approved'
              ? 'bg-emerald-600 text-white border-emerald-600'
              : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Approved ({approvedCount})
        </button>
        <button
          onClick={() => setFilterState('changes_requested')}
          className={`px-3 py-1.5 rounded-lg border font-medium transition-colors ${
            filterState === 'changes_requested'
              ? 'bg-red-600 text-white border-red-600'
              : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Needs Revision ({changesCount})
        </button>
        <button
          onClick={() => setFilterState('pending')}
          className={`px-3 py-1.5 rounded-lg border font-medium transition-colors ${
            filterState === 'pending'
              ? 'bg-slate-500 text-white border-slate-500'
              : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Pending Sign-off ({pendingCount})
        </button>
      </div>

      {/* Review Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredImages.map((img) => {
          const imgAnnotations = annotations.filter((a) => a.imageId === img.id);
          return (
            <div
              key={img.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs flex flex-col justify-between"
            >
              {/* Media Thumbnail Container */}
              <div
                onClick={() => onInspectImage(img)}
                className="relative aspect-16/10 bg-slate-950 overflow-hidden cursor-pointer group"
                title="Click to open canvas inspector and comment pins"
              >
                <img
                  src={getProxyUrl(img.url)}
                  alt={img.alt || img.originalName}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Overlay status tag */}
                <div className="absolute top-2.5 left-2.5 z-10">
                  {img.approvalStatus === 'approved' && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500 text-slate-950 shadow-xs flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Approved
                    </span>
                  )}
                  {img.approvalStatus === 'changes_requested' && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500 text-white shadow-xs flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Changes Requested
                    </span>
                  )}
                  {(!img.approvalStatus || img.approvalStatus === 'pending') && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800/80 text-white backdrop-blur-xs flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Pending Sign-off
                    </span>
                  )}
                </div>

                {/* Pinned Comments Count */}
                <div className="absolute bottom-2.5 right-2.5 z-10">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500 text-slate-950 flex items-center gap-1 shadow-xs">
                    <MessageSquare className="w-3 h-3" />
                    {imgAnnotations.length} {imgAnnotations.length === 1 ? 'Pin' : 'Pins'}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h4
                    className="text-xs font-bold text-slate-900 dark:text-white truncate font-mono"
                    title={img.newName || img.originalName}
                  >
                    {img.newName || img.originalName}
                  </h4>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-mono">
                    <span>{img.width ? `${img.width}×${img.height}` : 'Dynamic'}</span>
                    <span aria-hidden="true">·</span>
                    <span className="uppercase">{img.format}</span>
                    <span aria-hidden="true">·</span>
                    <span>{img.folder || 'root'}</span>
                  </div>
                </div>

                {/* Recent Comment Excerpt if any */}
                {imgAnnotations.length > 0 && (
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 italic">
                    "{imgAnnotations[imgAnnotations.length - 1].comment}"
                  </div>
                )}

                {/* Sign-off Actions */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onUpdateApproval(img.id, 'approved')}
                      className={`p-1.5 rounded-lg border text-xs font-medium transition-colors ${
                        img.approvalStatus === 'approved'
                          ? 'bg-emerald-500 text-slate-950 border-emerald-500'
                          : 'border-slate-200 dark:border-slate-800 hover:border-emerald-500 text-slate-600 dark:text-slate-400'
                      }`}
                      title="Approve Asset"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onUpdateApproval(img.id, 'changes_requested')}
                      className={`p-1.5 rounded-lg border text-xs font-medium transition-colors ${
                        img.approvalStatus === 'changes_requested'
                          ? 'bg-red-500 text-white border-red-500'
                          : 'border-slate-200 dark:border-slate-800 hover:border-red-500 text-slate-600 dark:text-slate-400'
                      }`}
                      title="Request Changes"
                    >
                      <AlertCircle className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => onInspectImage(img)}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-amber-500" />
                    <span>Drop Pin</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

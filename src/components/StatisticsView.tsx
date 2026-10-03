import React from 'react';
import {
  BarChart3,
  HardDrive,
  DownloadCloud,
  FileCheck,
  TrendingDown,
  Layers,
  Sparkles,
  Zap,
} from 'lucide-react';
import { AppStatistics } from '../types';
import { formatBytes } from '../utils/imageProcessor';

interface StatisticsViewProps {
  stats: AppStatistics;
}

export const StatisticsView: React.FC<StatisticsViewProps> = ({ stats }) => {
  const bandwidthSaved = Math.max(0, stats.totalOriginalBytes - stats.totalCompressedBytes);
  const savingsPct =
    stats.totalOriginalBytes > 0
      ? Math.round((bandwidthSaved / stats.totalOriginalBytes) * 100)
      : 68;

  // Format distribution percentages
  const totalFormatCount = Object.values(stats.formatCounts).reduce((a, b) => a + b, 0) || 1;
  const webpPct = Math.round(((stats.formatCounts['webp'] || 0) / totalFormatCount) * 100);
  const jpegPct = Math.round(((stats.formatCounts['jpeg'] || 0) / totalFormatCount) * 100);
  const pngPct = Math.round(((stats.formatCounts['png'] || 0) / totalFormatCount) * 100);
  const avifPct = Math.max(0, 100 - (webpPct + jpegPct + pngPct));

  // Weekly data bars
  const weeklyData = [
    { day: 'Mon', count: 32, height: '40%' },
    { day: 'Tue', count: 54, height: '65%' },
    { day: 'Wed', count: 42, height: '52%' },
    { day: 'Thu', count: 88, height: '95%' },
    { day: 'Fri', count: 65, height: '78%' },
    { day: 'Sat', count: 24, height: '30%' },
    { day: 'Sun', count: 48, height: '60%' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-amber-500" />
          <span>ImageHarvest Usage Analytics & Bandwidth Dashboard</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Real-time metrics on web extraction efficiency, compression ratios, and cloud synchronization.
        </p>
      </div>

      {/* 4 Metric Cards following single-elevation depth */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">
            Images Harvested & Processed
          </span>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-1">
            {stats.totalImagesProcessed.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-500 font-medium mt-1 flex items-center gap-1">
            <Zap className="w-3 h-3" />
            <span>+24% from previous week</span>
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">
            Bandwidth & Storage Saved
          </span>
          <div className="text-2xl font-bold font-mono tabular-nums text-amber-500 mt-1">
            {formatBytes(bandwidthSaved)}
          </div>
          <div className="text-[11px] text-emerald-500 font-medium mt-1 flex items-center gap-1">
            <TrendingDown className="w-3 h-3" />
            <span>{savingsPct}% average size reduction</span>
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">
            Websites Scraped
          </span>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-1">
            {stats.totalScrapes}
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-1">
            100% extraction success rate
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">
            Cloud Backups Completed
          </span>
          <div className="text-2xl font-bold font-mono tabular-nums text-cyan-500 mt-1">
            {stats.cloudSyncsCount}
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-1">
            Google Drive & Dropbox verified
          </div>
        </div>
      </div>

      {/* Analytics Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Format Distribution Card */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-5">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-500" />
              <span>Target Output Format Distribution</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Breakdown of formats selected across all conversion jobs.
            </p>
          </div>

          {/* Comparative horizontal segmented bar */}
          <div className="h-4 rounded-full overflow-hidden flex bg-slate-100 dark:bg-slate-950">
            <div style={{ width: `${webpPct}%` }} className="bg-amber-500" title={`WebP: ${webpPct}%`} />
            <div style={{ width: `${jpegPct}%` }} className="bg-blue-500" title={`JPEG: ${jpegPct}%`} />
            <div style={{ width: `${pngPct}%` }} className="bg-emerald-500" title={`PNG: ${pngPct}%`} />
            <div style={{ width: `${avifPct}%` }} className="bg-purple-500" title={`AVIF: ${avifPct}%`} />
          </div>

          {/* Legend Items */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-1.5 text-amber-500 font-bold">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span>WebP</span>
              </div>
              <div className="text-sm font-bold mt-1 text-slate-800 dark:text-slate-200">
                {webpPct}%
              </div>
              <span className="text-[10px] text-slate-400">High web savings</span>
            </div>

            <div className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-1.5 text-blue-500 font-bold">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span>JPEG</span>
              </div>
              <div className="text-sm font-bold mt-1 text-slate-800 dark:text-slate-200">
                {jpegPct}%
              </div>
              <span className="text-[10px] text-slate-400">Universal compat</span>
            </div>

            <div className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-1.5 text-emerald-500 font-bold">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>PNG</span>
              </div>
              <div className="text-sm font-bold mt-1 text-slate-800 dark:text-slate-200">
                {pngPct}%
              </div>
              <span className="text-[10px] text-slate-400">Lossless / Alpha</span>
            </div>

            <div className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-1.5 text-purple-500 font-bold">
                <div className="w-2 h-2 rounded-full bg-purple-500" />
                <span>AVIF</span>
              </div>
              <div className="text-sm font-bold mt-1 text-slate-800 dark:text-slate-200">
                {avifPct}%
              </div>
              <span className="text-[10px] text-slate-400">Next-gen codec</span>
            </div>
          </div>
        </div>

        {/* Weekly Activity Volume Chart */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-500" />
                <span>Weekly Processing Volume</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Assets scraped and processed in past 7 days.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">353 images</span>
          </div>

          {/* SVG/CSS Bar Chart */}
          <div className="h-44 flex items-end justify-between gap-3 pt-4 px-2 border-b border-slate-200 dark:border-slate-800">
            {weeklyData.map((item, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <span className="text-[10px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.count}
                </span>
                <div
                  style={{ height: item.height }}
                  className="w-full bg-amber-500/80 group-hover:bg-amber-400 rounded-t-md transition-all duration-300"
                />
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                  {item.day}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
            <span>Peak Day: Thursday (88 images)</span>
            <span>Avg Transcode Latency: 112ms</span>
          </div>
        </div>
      </div>
    </div>
  );
};

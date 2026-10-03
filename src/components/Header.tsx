import React from 'react';
import {
  Download,
  FolderHeart,
  Cloud,
  BarChart3,
  Moon,
  Sun,
  Wifi,
  WifiOff,
  Users,
  Image as ImageIcon,
  Sparkles,
  Video,
} from 'lucide-react';

export type AppTab =
  | 'scraper'
  | 'free_stock'
  | 'ai_studio'
  | 'video_studio'
  | 'collections'
  | 'collaboration'
  | 'cloud'
  | 'analytics';

interface HeaderProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  isOnline: boolean;
  onToggleSimulatedOffline: () => void;
  offlineQueueCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  theme,
  onToggleTheme,
  isOnline,
  onToggleSimulatedOffline,
  offlineQueueCount,
}) => {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-3 sm:px-6 py-3 border-b bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-slate-200 dark:border-slate-800 transition-colors">
      {/* Zone 1: Single element Brand Wordmark */}
      <div className="flex items-center gap-3">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onTabChange('scraper');
          }}
          className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2"
        >
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-black shadow-xs">
            <Download className="w-4 h-4 stroke-[2.5]" />
          </div>
          <span className="font-semibold tracking-tight">ImageHarvest Pro</span>
        </a>
      </div>

      {/* Zone 2: Navigation Links */}
      <nav className="hidden lg:flex items-center gap-1">
        <button
          onClick={() => onTabChange('scraper')}
          className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'scraper'
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Download className="w-3.5 h-3.5" />
          <span>Extractor</span>
        </button>

        {/* Free Images Library */}
        <button
          onClick={() => onTabChange('free_stock')}
          className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'free_stock'
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/30'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5 text-emerald-500" />
          <span>Free Stock</span>
        </button>

        {/* AI Studio: Create & Edit Images */}
        <button
          onClick={() => onTabChange('ai_studio')}
          className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'ai_studio'
              ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 font-semibold border border-purple-500/30'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-500" />
          <span>AI Image Studio</span>
        </button>

        {/* Veo Video Studio */}
        <button
          onClick={() => onTabChange('video_studio')}
          className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'video_studio'
              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold border border-amber-500/30'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Video className="w-3.5 h-3.5 text-amber-500" />
          <span>Veo Video Studio</span>
        </button>

        {/* Collections */}
        <button
          onClick={() => onTabChange('collections')}
          className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'collections'
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FolderHeart className="w-3.5 h-3.5" />
          <span>Vaults</span>
        </button>

        {/* Team Review */}
        <button
          onClick={() => onTabChange('collaboration')}
          className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'collaboration'
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Team Review</span>
        </button>

        {/* Cloud Sync */}
        <button
          onClick={() => onTabChange('cloud')}
          className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'cloud'
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Cloud className="w-3.5 h-3.5" />
          <span>Cloud</span>
        </button>

        {/* Analytics */}
        <button
          onClick={() => onTabChange('analytics')}
          className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'analytics'
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Stats</span>
        </button>
      </nav>

      {/* Mobile nav dropdown / quick switcher */}
      <div className="flex lg:hidden items-center">
        <select
          value={activeTab}
          onChange={(e) => onTabChange(e.target.value as AppTab)}
          className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium"
        >
          <option value="scraper">Extractor</option>
          <option value="free_stock">Free Stock Library</option>
          <option value="ai_studio">AI Image Studio</option>
          <option value="video_studio">Veo Video Studio</option>
          <option value="collections">Collections Vault</option>
          <option value="collaboration">Team Review</option>
          <option value="cloud">Cloud Storage</option>
          <option value="analytics">Usage Stats</option>
        </select>
      </div>

      {/* Zone 3: Actions & Controls (2FA removed) */}
      <div className="flex items-center gap-2">
        {/* Offline Status & Simulator Toggle */}
        <button
          onClick={onToggleSimulatedOffline}
          title={isOnline ? 'Online (Click to simulate offline mode)' : 'Offline mode active (Click to reconnect)'}
          className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            isOnline
              ? 'border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
              : 'border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
          }`}
        >
          {isOnline ? (
            <>
              <Wifi className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">Online</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Offline ({offlineQueueCount})</span>
            </>
          )}
        </button>

        {/* Dark/Light Mode Toggle */}
        <button
          onClick={onToggleTheme}
          aria-label="Toggle dark mode"
          className="p-1.5 sm:p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
        </button>
      </div>
    </header>
  );
};

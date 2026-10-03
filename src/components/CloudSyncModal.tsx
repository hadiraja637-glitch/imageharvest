import React, { useState } from 'react';
import {
  Cloud,
  CheckCircle2,
  FolderSync,
  AlertCircle,
  ExternalLink,
  Shield,
  Clock,
  RefreshCw,
  HardDrive,
  Check,
} from 'lucide-react';
import { CloudSyncSettings, ScrapedImage } from '../types';

interface CloudSyncModalProps {
  settings: CloudSyncSettings;
  onUpdateSettings: (newSettings: CloudSyncSettings) => void;
  onTriggerManualSync: (provider: 'google_drive' | 'dropbox') => Promise<void>;
  isSyncing: boolean;
  selectedImagesCount: number;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({
  settings,
  onUpdateSettings,
  onTriggerManualSync,
  isSyncing,
  selectedImagesCount,
}) => {
  const [googleFolder, setGoogleFolder] = useState(settings.googleDriveFolder);
  const [dropboxFolder, setDropboxFolder] = useState(settings.dropboxFolder);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveConfig = () => {
    onUpdateSettings({
      ...settings,
      googleDriveFolder: googleFolder,
      dropboxFolder,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const toggleGoogleDrive = () => {
    onUpdateSettings({
      ...settings,
      googleDriveConnected: !settings.googleDriveConnected,
    });
  };

  const toggleDropbox = () => {
    onUpdateSettings({
      ...settings,
      dropboxConnected: !settings.dropboxConnected,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Page Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Cloud className="w-5 h-5 text-cyan-500" />
          <span>Cloud Storage Integrations & Automated Backups</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Connect Google Drive and Dropbox for automated backups, cross-platform syncing, and team asset sharing.
        </p>
      </div>

      {/* Provider Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Google Drive Card */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold">
                <HardDrive className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Google Drive</span>
                  {settings.googleDriveConnected && (
                    <span className="text-[11px] font-mono text-emerald-500 flex items-center gap-1 font-normal">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Connected
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-500">
                  ranimomna126@gmail.com · 8.4 GB of 15 GB used
                </p>
              </div>
            </div>

            <button
              onClick={toggleGoogleDrive}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                settings.googleDriveConnected
                  ? 'border border-red-200 dark:border-red-900/50 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
              }`}
            >
              {settings.googleDriveConnected ? 'Disconnect' : 'Connect Drive'}
            </button>
          </div>

          <div className="space-y-3 pt-2">
            <div className="space-y-1 text-xs">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Target Vault Directory:
              </label>
              <input
                type="text"
                value={googleFolder}
                onChange={(e) => setGoogleFolder(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg font-mono text-xs text-slate-900 dark:text-white"
              />
            </div>

            <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={settings.googleDriveAutoSync}
                onChange={(e) =>
                  onUpdateSettings({ ...settings, googleDriveAutoSync: e.target.checked })
                }
                className="rounded accent-blue-600 w-4 h-4"
              />
              <span>Automatically sync to Drive upon creating ZIP archives</span>
            </label>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-400">
              {settings.lastSyncTimestamp
                ? `Last sync: ${new Date(settings.lastSyncTimestamp).toLocaleTimeString()}`
                : 'Never synced'}
            </span>
            <button
              disabled={!settings.googleDriveConnected || isSyncing}
              onClick={() => onTriggerManualSync('google_drive')}
              className="px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 disabled:opacity-40 font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>Sync {selectedImagesCount > 0 ? `${selectedImagesCount} Assets` : 'Batch'} Now</span>
            </button>
          </div>
        </div>

        {/* Dropbox Card */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center font-bold">
                <Cloud className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Dropbox</span>
                  {settings.dropboxConnected ? (
                    <span className="text-[11px] font-mono text-emerald-500 flex items-center gap-1 font-normal">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Connected
                    </span>
                  ) : (
                    <span className="text-[11px] font-mono text-slate-400 font-normal">
                      Disconnected
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-500">
                  Team Workspace App Folder · End-to-end encrypted
                </p>
              </div>
            </div>

            <button
              onClick={toggleDropbox}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                settings.dropboxConnected
                  ? 'border border-red-200 dark:border-red-900/50 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30'
                  : 'bg-cyan-600 hover:bg-cyan-700 text-white shadow-xs'
              }`}
            >
              {settings.dropboxConnected ? 'Disconnect' : 'Connect Dropbox'}
            </button>
          </div>

          <div className="space-y-3 pt-2">
            <div className="space-y-1 text-xs">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Dropbox App Folder:
              </label>
              <input
                type="text"
                value={dropboxFolder}
                onChange={(e) => setDropboxFolder(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg font-mono text-xs text-slate-900 dark:text-white"
              />
            </div>

            <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={settings.dropboxAutoSync}
                onChange={(e) =>
                  onUpdateSettings({ ...settings, dropboxAutoSync: e.target.checked })
                }
                className="rounded accent-cyan-600 w-4 h-4"
              />
              <span>Auto-sync when collections are updated</span>
            </label>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-400">
              {settings.dropboxConnected ? 'Ready for cloud backup' : 'Integration inactive'}
            </span>
            <button
              disabled={!settings.dropboxConnected || isSyncing}
              onClick={() => onTriggerManualSync('dropbox')}
              className="px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 disabled:opacity-40 font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>Sync to Dropbox</span>
            </button>
          </div>
        </div>
      </div>

      {/* Save Settings Trigger */}
      <div className="flex justify-end items-center gap-3">
        {savedSuccess && (
          <span className="text-xs font-mono text-emerald-500 flex items-center gap-1">
            <Check className="w-3.5 h-3.5" />
            Configurations updated!
          </span>
        )}
        <button
          onClick={handleSaveConfig}
          className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-xs"
        >
          Save Cloud Preferences
        </button>
      </div>

      {/* Cloud Sync Logs Table */}
      <div className="space-y-3 pt-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-400" />
          <span>Cloud Synchronization Audit History</span>
        </h3>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500">
              <tr>
                <th className="py-2.5 px-4">Timestamp</th>
                <th className="py-2.5 px-3">Provider</th>
                <th className="py-2.5 px-3">Transferred</th>
                <th className="py-2.5 px-4">Remote Vault Path</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-4">Audit Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {settings.syncLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/40">
                  <td className="py-2.5 px-4 text-slate-500">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 uppercase font-bold text-slate-800 dark:text-slate-200">
                    {log.provider.replace('_', ' ')}
                  </td>
                  <td className="py-2.5 px-3 tabular-nums text-slate-700 dark:text-slate-300">
                    {log.filesCount} files ({log.totalSizeMb} MB)
                  </td>
                  <td className="py-2.5 px-4 text-slate-500 truncate max-w-[200px]" title={log.targetFolder}>
                    {log.targetFolder}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="text-emerald-500 flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Success
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-slate-500 truncate max-w-[200px]">
                    {log.note}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { AlertTriangle, ExternalLink, X, WifiOff } from 'lucide-react';
import { StorageService } from '../services/storageService';

interface SyncStatusBannerProps {
  show: boolean;
  onStayOffline?: () => void;
}

export const SyncStatusBanner: React.FC<SyncStatusBannerProps> = ({ show, onStayOffline }) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!show || !isVisible) return null;

  const handleStayOffline = () => {
    StorageService.suppressSync(true);
    setIsVisible(false);
    if (onStayOffline) onStayOffline();
  };

  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800/50 px-4 py-2.5 transition-all animate-in slide-in-from-top duration-300">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-amber-100 dark:bg-amber-800/40 p-1.5 rounded-lg shrink-0">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="text-xs md:text-sm font-medium text-amber-800 dark:text-amber-300">
            <span className="font-bold">Cloud Sync Configuration Required:</span> The Firestore API is disabled for project <code className="bg-amber-100/50 px-1 rounded text-[10px]">personal-finance-managem-ccd77</code>. Your data is currently saved <span className="underline decoration-amber-400">locally only</span>.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button 
            onClick={handleStayOffline}
            className="flex items-center gap-1.5 px-3 py-1.5 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-800/40 text-[10px] md:text-xs font-bold rounded-lg transition-colors whitespace-nowrap"
          >
            <WifiOff className="w-3 h-3" /> Stay Offline
          </button>
          <a 
            href="https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=personal-finance-managem-ccd77" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-[10px] md:text-xs font-bold rounded-lg transition-colors shadow-sm whitespace-nowrap"
          >
            Enable API <ExternalLink className="w-3 h-3" />
          </a>
          <button 
            onClick={() => setIsVisible(false)}
            className="p-1.5 hover:bg-amber-200/50 dark:hover:bg-amber-800/50 rounded-full text-amber-600 dark:text-amber-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
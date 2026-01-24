import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="w-full min-h-[400px] flex flex-col items-center justify-center gap-4 animate-in fade-in duration-500">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-emerald-100 dark:border-emerald-900/30"></div>
        <Loader2 className="w-12 h-12 text-emerald-600 animate-spin absolute top-0 left-0" />
      </div>
      <p className="text-sm font-medium text-slate-400 dark:text-slate-500 animate-pulse">
        Preparing your data...
      </p>
    </div>
  );
};
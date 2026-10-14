import React from 'react';
import { AlertTriangle } from 'lucide-react';

export const ConfigWarning: React.FC = () => {
  return (
    <div className="bg-amber-50/90 backdrop-blur-md border-b border-amber-200/80 px-4 py-3 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 text-amber-900 text-xs sm:text-sm">
        <div className="flex items-center gap-2.5">
          <div className="p-1 rounded-lg bg-amber-200/60 text-amber-800 shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <strong className="font-bold">Supabase Config Required:</strong>{' '}
            <span className="text-amber-800">
              Set <code className="bg-amber-100 px-1.5 py-0.5 rounded text-amber-900 font-mono text-[11px]">VITE_SUPABASE_URL</code> and <code className="bg-amber-100 px-1.5 py-0.5 rounded text-amber-900 font-mono text-[11px]">VITE_SUPABASE_ANON_KEY</code> in <code className="bg-amber-100 px-1.5 py-0.5 rounded text-amber-900 font-mono text-[11px]">.env</code> to connect cloud sync.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

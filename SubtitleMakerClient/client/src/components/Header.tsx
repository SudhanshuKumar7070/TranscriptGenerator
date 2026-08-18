import { Mic } from 'lucide-react';

export function Header() {
  return (
    <header className="flex items-center justify-between mb-12">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
          <Mic size={24} />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-mainText m-0">Video to Text</h1>
          <p className="text-sm text-secondaryText m-0">Local AI transcription</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondarySurface border border-border">
        <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
        <span className="text-xs font-medium text-secondaryText">Local</span>
      </div>
    </header>
  );
}

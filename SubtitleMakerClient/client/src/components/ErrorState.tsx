import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="bg-primarySurface border border-error/20 rounded-2xl p-8 flex flex-col items-center justify-center text-center mt-6 animate-in fade-in duration-300">
      <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center text-error mb-4">
        <AlertTriangle size={24} />
      </div>
      
      <h3 className="text-lg font-medium text-mainText mb-2">Something went wrong</h3>
      <p className="text-secondaryText text-sm max-w-[400px] mb-6">
        {message || "We couldn't generate the transcript."}
      </p>
      
      <button
        onClick={onRetry}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondarySurface text-mainText font-medium text-sm hover:bg-border transition-colors focus:outline-none focus:ring-2 focus:ring-error/50 border border-border"
      >
        <RefreshCw size={16} />
        <span>Try Again</span>
      </button>
    </div>
  );
}

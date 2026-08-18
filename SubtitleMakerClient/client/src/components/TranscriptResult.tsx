import { Copy, Check } from 'lucide-react';
import { useState, useCallback } from 'react';

interface TranscriptResultProps {
  transcript: string;
}

export function TranscriptResult({ transcript }: TranscriptResultProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(transcript).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [transcript]);

  return (
    <div className="bg-primarySurface border border-border rounded-2xl overflow-hidden mt-6 flex flex-col max-h-[600px] animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-secondarySurface/50">
        <h3 className="text-mainText font-medium text-sm">Transcript</h3>
        
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors hover:bg-primary/10 text-secondaryText hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
          aria-label="Copy transcript"
        >
          {copied ? (
            <>
              <Check size={16} className="text-success" />
              <span className="text-success">Copied</span>
            </>
          ) : (
            <>
              <Copy size={16} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      
      <div className="p-6 overflow-y-auto custom-scrollbar">
        <pre className="font-mono text-sm leading-relaxed text-secondaryText whitespace-pre-wrap font-normal">
          {transcript}
        </pre>
      </div>
    </div>
  );
}

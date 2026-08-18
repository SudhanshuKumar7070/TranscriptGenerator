import { FileVideo, Upload, X } from 'lucide-react';
import { useCallback, useState } from 'react';

interface VideoUploaderProps {
  selectedFile: File | null;
  onFileSelect: (file: File | null) => void;
}

export function VideoUploader({ selectedFile, onFileSelect }: VideoUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'video/mp4') {
        onFileSelect(file);
      }
    }
  }, [onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      onFileSelect(file);
    }
  }, [onFileSelect]);

  if (selectedFile) {
    return (
      <div className="bg-primarySurface border border-border rounded-2xl p-6 flex items-center justify-between shadow-sm transition-all">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-secondarySurface flex items-center justify-center text-primary">
            <FileVideo size={24} />
          </div>
          <div>
            <p className="text-mainText font-medium text-base truncate max-w-[200px] sm:max-w-[400px]">
              {selectedFile.name}
            </p>
            <p className="text-secondaryText text-sm">
              {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
            </p>
          </div>
        </div>
        <button
          onClick={() => onFileSelect(null)}
          className="p-2 text-secondaryText hover:text-mainText hover:bg-secondarySurface rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
          aria-label="Remove selected file"
        >
          <X size={20} />
        </button>
      </div>
    );
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer overflow-hidden
        ${isDragging 
          ? 'border-primary bg-primary/5 shadow-[0_0_15px_rgba(99,102,241,0.1)]' 
          : 'border-border bg-primarySurface hover:border-primary/50 hover:bg-secondarySurface'
        }
      `}
    >
      <input
        type="file"
        accept="video/mp4"
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        aria-label="Upload video file"
      />
      
      <div className="py-16 px-6 flex flex-col items-center justify-center text-center">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors
          ${isDragging ? 'bg-primary/20 text-primary' : 'bg-secondarySurface text-secondaryText'}
        `}>
          <Upload size={28} />
        </div>
        <h3 className="text-lg font-medium text-mainText mb-1">Drop your video here</h3>
        <p className="text-secondaryText text-sm mb-4">or click to browse</p>
        <span className="inline-block px-3 py-1 bg-secondarySurface border border-border rounded-md text-xs text-secondaryText font-medium">
          MP4 video
        </span>
      </div>
    </div>
  );
}

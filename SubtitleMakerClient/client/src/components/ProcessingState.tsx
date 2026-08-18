export function ProcessingState() {
  return (
    <div className="bg-primarySurface border border-border rounded-2xl p-12 flex flex-col items-center justify-center text-center mt-6 animate-in fade-in duration-500">
      <div className="relative w-16 h-16 mb-8">
        <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin"></div>
        <div className="absolute inset-2 rounded-full border-r-2 border-accent/50 animate-[spin_1.5s_linear_infinite_reverse]"></div>
        <div className="absolute inset-4 rounded-full border-b-2 border-primary/30 animate-[spin_3s_linear_infinite]"></div>
      </div>
      
      <h3 className="text-xl font-medium text-mainText mb-3">Generating your transcript</h3>
      <p className="text-secondaryText text-sm max-w-[300px] leading-relaxed">
        Whisper is processing the audio locally. This may take a little while for longer videos.
      </p>
    </div>
  );
}

import { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { VideoUploader } from './components/VideoUploader';
import { ProcessingState } from './components/ProcessingState';
import { TranscriptResult } from './components/TranscriptResult';
import { ErrorState } from './components/ErrorState';
import { transcriptionService } from './services/transcription.service';
import type { ApplicationStatus } from './types/transcription';

const healthPing = async()=>{
  await fetch("http://localhost:5000/ping",{
    method:"GET"
  }).then(()=>{
    console.log("ping made");
  }).catch((err)=>{
    console.log(err)
  })
}

function App() {
  const [status, setStatus] = useState<ApplicationStatus>('idle');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [transcript, setTranscript] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  

  useEffect(()=>{
    setTimeout(()=>{
    healthPing();
  },1000000)
  },[])
  


  const handleFileSelect = useCallback((file: File | null) => {
    setSelectedFile(file);
    if (status !== 'idle') {
      setStatus('idle');
      setTranscript('');
      setErrorMessage('');
    }
  }, [status]);

  const handleGenerate = async () => {
    if (!selectedFile) return;
    
    setStatus('processing');
    setErrorMessage('');
    
    try {
      const transcriptText = await transcriptionService.transcribeVideo(selectedFile);
      setTranscript(transcriptText);
      setStatus('success');
    } catch (error) {
      console.error(error);
      setErrorMessage(error instanceof Error ? error.message : 'An unexpected error occurred');
      setStatus('error');
    }
  };

  const handleReset = useCallback(() => {
    setSelectedFile(null);
    setTranscript('');
    setErrorMessage('');
    setStatus('idle');
  }, []);

  return (
    <div className="min-h-screen p-6 md:p-12">
      <div className="max-w-[880px] mx-auto">
        <Header />
        
        <main>
          <div className="mb-8">
            <h2 className="text-3xl md:text-4xl font-semibold text-mainText mb-3 tracking-tight">
              Turn your video into text.
            </h2>
            <p className="text-secondaryText text-base md:text-lg max-w-2xl">
              Upload a video and generate a timestamped transcript locally.
            </p>
          </div>

          {(status === 'idle' || status === 'error' || status === 'processing' && !transcript) && (
            <VideoUploader 
              selectedFile={selectedFile} 
              onFileSelect={handleFileSelect} 
            />
          )}

          {status === 'idle' && (
            <div className="mt-6">
              <button
                onClick={handleGenerate}
                disabled={!selectedFile}
                className={`w-full py-3.5 rounded-xl font-medium text-[15px] transition-all flex items-center justify-center
                  ${selectedFile 
                    ? 'bg-primary hover:bg-primary-hover text-white shadow-[0_4px_14px_0_rgba(99,102,241,0.39)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.23)]' 
                    : 'bg-secondarySurface text-secondaryText cursor-not-allowed border border-border'
                  }
                `}
              >
                Generate Transcript
              </button>
            </div>
          )}

          {status === 'processing' && <ProcessingState />}
          
          {status === 'error' && (
            <ErrorState 
              message={errorMessage} 
              onRetry={handleGenerate} 
            />
          )}

          {status === 'success' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <TranscriptResult transcript={transcript} />
              
              <div className="mt-8 flex justify-center">
                <button
                  onClick={handleReset}
                  className="text-sm font-medium text-secondaryText hover:text-mainText px-4 py-2 rounded-lg hover:bg-secondarySurface transition-colors"
                >
                  Transcribe another video
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;

export type ApplicationStatus = 'idle' | 'processing' | 'success' | 'error';

export interface TranscriptionResponse {
  transcript: string;
  srt?: string;
  vtt?: string;
}

export interface TranscriptionError {
  message: string;
  details?: string;
}

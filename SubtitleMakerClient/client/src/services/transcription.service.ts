const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const transcriptionService = {
  async transcribeVideo(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('video', file);

    const response = await fetch(`${API_URL}/uploadVideo`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Transcription failed with status: ${response.status}`);
    }

    return response.text();
  },
};

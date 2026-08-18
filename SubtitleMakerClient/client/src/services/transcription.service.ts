const API_URL = ' https://transcriptgenerator-backend.onrender.com/api/v1';

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

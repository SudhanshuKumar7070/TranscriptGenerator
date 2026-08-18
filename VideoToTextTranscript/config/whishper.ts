import path from "node:path";
import { nodewhisper } from "nodejs-whisper";

export const whisperConfig = {
  modelName: "base.en",
  autoDownloadModelName: "base.en",
  modelRootPath: path.resolve(process.cwd(), "models"),
  removeWavFileAfterTranscription: false,
  withCuda: false,
  whisperOptions: {
    outputInSrt: false,
    outputInText: true,
    outputInJson: false,
    outputInVtt: false,
    outputInWords: false,
    translateToEnglish: false,
    wordTimestamps: false,
    splitOnWord: true,
    noGpu: true,
    timestamps_length: 20,
  },
} as const;

export async function configWhishper(audioFilePath: string): Promise<string> {
  const filePath = path.resolve(audioFilePath);

  return nodewhisper(filePath, {
    ...whisperConfig,
    logger: console,
  });
}

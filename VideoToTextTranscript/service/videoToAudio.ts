import { exec } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { configWhishper } from "../config/whishper.ts";

export async function convertVideoToAudio(videoPath: string, outputName: string): Promise<string> {
console.log("convert video to audio initiated...");
  if (!fs.existsSync(videoPath)) {
    throw new Error(`Video file not found: ${videoPath}`);
  }

  const outputDir = path.join(process.cwd(), "public", "audio");
  fs.mkdirSync(outputDir, { recursive: true });

  const outputFile = path.join(outputDir, `${outputName}.wav`);

  return new Promise((resolve, reject) => {
    exec(
      `ffmpeg -y -i "${videoPath}" -vn -ac 1 -ar 16000 "${outputFile}"`,
      (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`${error.message}\n${stderr}`));
          return;
        }

        resolve(stdout.trim() || outputFile);
      }
    );
  });
}

export async function convertAudioToText(audioPath: string): Promise<string> {
  console.log("convert audio to text called...")
  try {
    const response = await configWhishper(audioPath);
    return response;
  } catch (error: unknown) {
    console.log("error occured at audio to text service", error);
    throw error;
  }
}
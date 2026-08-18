import { Request, Response } from "express";
import fs from "node:fs";
import path from "node:path";
import { convertAudioToText, convertVideoToAudio } from "../service/videoToAudio.ts";

function removeProcessedFiles(filePaths: string[]): void {
  for (const filePath of filePaths) {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}

export const processVideo = async (req: Request, res: Response) => {
  let uploadedVideoPath = "";
  let audioPath = "";
  let textFilePath = "";

  try {
    if (!req.file) {
      return res.status(400).json({ message: "No video uploaded" });
    }

    uploadedVideoPath = req.file.path;
    const outputBaseName = req.file.filename.replace(/\.[^/.]+$/, "");

    const audioResult = await convertVideoToAudio(uploadedVideoPath, outputBaseName);
    audioPath = audioResult.includes("Public")
      ? audioResult
      : `Public/audio/${outputBaseName}.wav`;
       
    const transcript = await convertAudioToText(audioPath);
    console.log( "TRANSCRIPT:::" ,transcript);
    console.log("transcript generated.!!")
    textFilePath = path.resolve(`${audioPath}.txt`);

    if (!fs.existsSync(textFilePath)) {
      removeProcessedFiles([uploadedVideoPath, audioPath]);
      return res.status(404).json({ message: "Transcript text file was not generated" });
    }

    res.type("text/plain");
    return res.sendFile(textFilePath, (sendError) => {
      removeProcessedFiles([uploadedVideoPath, audioPath, textFilePath]);

      if (sendError && !res.headersSent) {
        res.status(500).json({ message: "Transcript could not be sent", error: sendError.message });
      }
    });
  } catch (err: any) {
    removeProcessedFiles([uploadedVideoPath, audioPath, textFilePath]);
    console.log("error at video processing", err);
    return res.status(500).json({ message: "Video processing failed", error: err.message });
  }
};
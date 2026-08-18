import {nodewhisper} from  "nodejs-whisper"

const audioPath:string = "C:/videoToTextLocal/VideoToTextTranscript/Public/audio/test1.wav"

async function convertAudioToText(){
    try {
        const response = await nodewhisper(audioPath, {
    modelName: "medium.en",

    modelRootPath:
      "C:/videoToTextLocal/VideoToTextTranscript/node_modules/nodejs-whisper/cpp/whisper.cpp/models",

    withCuda: false,

    whisperOptions: {
      outputInSrt: true,
    },

    logger: console,
  });

  return response;
    } catch (error:unknown) {
        console.log("error ocuured at test whishper ->",error)
    }
}
console.log(convertAudioToText());
# VideoToTextTranscript

A small Express-based service that accepts a single video upload, converts it to a 16 kHz mono WAV using FFmpeg, transcribes the audio using nodejs-whisper (which builds and uses whisper.cpp / whisper-cli), and returns a plain-text transcript.

## Features
- Accepts a single video file upload (multipart/form-data).
- Uses FFmpeg to extract a mono 16 kHz WAV from the uploaded video.
- Uses nodejs-whisper (which uses whisper.cpp / whisper-cli) to transcribe audio to text.
- Returns a plain text transcript file to the client.
- Simple, single-process synchronous pipeline (upload → process → respond).
- Limits uploads to 200 MB (configured in multer).

## How It Works
Video Upload (multipart/form-data, field name "video")
→ Multer stores uploaded file temporarily
→ FFmpeg converts video to 16 kHz mono WAV (output: public/audio/{basename}.wav)
→ nodejs-whisper runs whisper.cpp / whisper-cli against the WAV (model stored in ./models)
→ whisper produces a .txt transcript alongside the WAV
→ Server sends the transcript (.txt) back as text/plain and deletes temp files

## Tech Stack

| Component | Used |
|---|---|
| Backend | Express |
| Language | TypeScript (runs with ts-node in development) |
| Speech-to-text | nodejs-whisper (nodewhisper) — builds and calls whisper.cpp / whisper-cli |
| Video/audio processing | ffmpeg (command-line) |
| Libraries | multer, nodejs-whisper, cors |
| Containerization/build tools | Dockerfile uses node:20 (base), apt packages: ffmpeg, cmake, build-essential to build whisper.cpp |

## Project Structure (important files)
- VideoToTextTranscript/
  - index.ts — Express app setup; serves static dirs and mounts routes; listens on port 5000
  - package.json — scripts and dependencies
  - Dockerfile — builds runtime image, installs ffmpeg & build tools, compiles whisper-cli
  - config/
    - multer.ts — multer disk storage and upload limits (200 MB)
    - whishper.ts — nodejs-whisper configuration (modelName, modelRootPath, options)
  - route/
    - business.ts — routes; POST /uploadVideo
  - controller/
    - videoProcess.ts — orchestration: validate upload, call service, send transcript file, cleanup
  - service/
    - videoToAudio.ts — runs ffmpeg to extract WAV and calls whisper service for transcription
  - public/ (written at runtime)
    - audio/ — produced WAV files
    - temp/ — uploaded videos (note: code has inconsistent casing (Public vs public); see Limitations)
  - models/ — model files downloaded/used by nodejs-whisper (created/used at runtime)

## Prerequisites

For running locally (without Docker):
- Node.js (the Dockerfile uses node:20; recommended to use Node 20 for parity)
- npm
- ffmpeg available on PATH (ffmpeg CLI is required for audio extraction)
- CMake and build-essential (gcc, g++, make) — required to compile whisper.cpp / whisper-cli when nodejs-whisper performs its build step
- Enough free disk space for uploaded files, audio outputs, and Whisper model files
- The repository's TypeScript execution requires ts-node and typescript (these are devDependencies in package.json)

For Docker execution:
- Docker installed and running (the Dockerfile installs ffmpeg, cmake, build-essential inside the image; you do not need them on the host to run the container)

Note: The code expects to write files under a "public" (or "Public") directory. Some files currently reference "Public" (capital P) while others use "public" (lowercase)—this can cause runtime issues on case-sensitive filesystems (Linux). See Limitations below.

## Installation (local, from repository root)
Open a terminal and run:

1. Change into the backend directory:
   cd VideoToTextTranscript

2. Install dependencies:
   npm ci

3. (Optional) For development with automatic reload:
   npm run dev

Notes:
- The project runs TypeScript directly via ts-node as configured in package.json ("start" uses node --loader ts-node/esm index.ts).
- Ensure ffmpeg, cmake and build tools are installed on your system before running npm ci (nodejs-whisper will build native components on install).

## Environment Variables
- The repository does not define or require any environment variables in code. The server listens on port 5000 (hardcoded in index.ts).
- nodejs-whisper will download model files to ./models by default (configWhishper sets modelRootPath to process.cwd()/models).

## Running the Project

From the VideoToTextTranscript directory:

- Start (production/dev entry as configured):
  npm start

- Start with automatic reload (development):
  npm run dev

The server logs:
  server is listening on http://localhost:5000

Health check:
  GET http://localhost:5000/ping → { "message": "pong" }

## API Usage

1) POST /api/v1/uploadVideo
- Method: POST
- Endpoint: /api/v1/uploadVideo
- Purpose: Upload a single video to transcribe
- Request:
  - Content-Type: multipart/form-data
  - Field: video (file) — required
- Response:
  - Success (200): returns the transcript file content as text/plain (the server sends the generated .txt file).
  - 400: { message: "No video uploaded" } — when no file provided
  - 404: { message: "Transcript text file was not generated" } — when transcription output file not found
  - 500: { message: "Video processing failed", error: "<error message>" } — on unexpected failures
- Example curl:
  curl -v -F "video=@/path/to/video.mp4" http://localhost:5000/api/v1/uploadVideo
- Notes:
  - Multer limits uploads to 200 MB in code (multer.ts).
  - The server returns the transcript file (text/plain) and attempts to clean up the uploaded video, generated WAV and text file after sending.

2) GET /ping
- Method: GET
- Endpoint: /ping
- Purpose: simple liveness check
- Response: 200 { "message": "pong" }

## Docker

The Dockerfile located at VideoToTextTranscript/Dockerfile builds a self-contained image that includes:

1. What the image contains
- Node 20 runtime (FROM node:20-bookworm)
- Project files and dependencies installed via npm ci
- FFmpeg binary (apt-installed) for audio extraction
- CMake and build-essential apt packages to compile whisper.cpp
- The build step compiles whisper-cli under node_modules/nodejs-whisper/cpp/whisper.cpp

2. Why FFmpeg / CMake / build-essential are required
- FFmpeg: used at runtime to extract audio from uploaded videos to a 16 kHz mono WAV file with the exact ffmpeg command used in code.
- CMake & build-essential: nodejs-whisper relies on whisper.cpp, a native C++ implementation requiring compilation (cmake + compiler toolchain) to produce whisper-cli that nodejs-whisper will call. The Dockerfile compiles whisper-cli during the image build so runtime transcription can call the compiled binary.

3. How whisper is built/used
- Dockerfile changes working directory to /app/node_modules/nodejs-whisper/cpp/whisper.cpp
- It runs:
  cmake -B build -DCMAKE_BUILD_TYPE=Release
  cmake --build build --config Release --target whisper-cli -j$(nproc)
- This builds the whisper-cli binary that nodejs-whisper uses to run offline transcription.

4. How to build the image
From the VideoToTextTranscript directory:
  docker build -t videototexttranscript .

5. How to run the container
  docker run --rm -p 5000:5000 videototexttranscript

The container exposes port 5000 and runs npm start (which launches node --loader ts-node/esm index.ts).

## Processing Flow (detailed lifecycle)

1. Upload
- Client posts a multipart/form-data request to /api/v1/uploadVideo with field name "video".
- Multer saves the uploaded file to Public/temp (multer.ts uses "Public/temp") with a timestamped filename.

2. Temporary file handling
- Controller stores the path to uploaded file (req.file.path) and constructs an output base name.

3. FFmpeg processing
- service/convertVideoToAudio executes:
  ffmpeg -y -i "{videoPath}" -vn -ac 1 -ar 16000 "{outputFile}"
  producing public/audio/{outputName}.wav
- This enforces mono (-ac 1) and 16 kHz (-ar 16000).

4. Audio generation
- The WAV is saved under public/audio.

5. Whisper transcription
- convertAudioToText calls configWhishper which calls nodewhisper(filePath, whisperConfig).
- whisperConfig requests text output (outputInText: true) and sets modelRootPath to ./models; nodejs-whisper will download or load the configured model (autoDownloadModelName present).
- nodejs-whisper (backed by the compiled whisper-cli) produces a .txt transcript file next to the WAV.

6. Response generation
- Controller checks for the .txt file and uses res.sendFile to return the transcript as text/plain.

7. Cleanup
- After sending (or on error), controller removes the uploaded video, generated WAV, and transcript file (removeProcessedFiles). Note: deletion is synchronous file unlink; errors are logged.

## Limitations (observed from code)
- Synchronous single-process flow: audio extraction and transcription happen inline in the request handler; large/long files can block the Node event loop during processing.
- Local / temporary storage: files are stored locally under public / Public directories before/after processing — no persistent or cloud storage is used.
- Upload limit: multer limits file size to 200 MB.
- Native build requirement: nodejs-whisper requires building native code (whisper.cpp) — so CMake and build tools are required for local installs if whisper-cli is not pre-built.
- CPU-only processing: whisperConfig sets withCuda: false and noGpu: true — transcription is CPU-based in code.
- Path casing inconsistency: some code uses "Public" (capital P) while others use "public" (lowercase). This may break on case-sensitive filesystems (Linux). You should standardize directory names before running on such systems.
- No authentication, no background job queue, and no progress reporting — everything happens synchronously per request.

## Future Improvements (suggested)
- Offload transcription to a background worker or job queue to avoid blocking the request thread and to support long files.
- Add progress updates / status endpoints for long-running transcriptions.
- Move temporary files and model storage to persistent object storage (S3 or similar) for scalability.
- Add authentication and rate limiting for production use.
- Improve error handling and provide clearer transcript generation statuses.
- Standardize file paths and introduce configuration (e.g., configurable output directories, port).

## License
- License in package.json: ISC

## Author
- Author as listed in package.json: sk

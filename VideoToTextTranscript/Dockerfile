FROM node:20-bookworm

WORKDIR /app

# Runtime + native build dependencies
RUN apt-get update && \
    apt-get install -y \
        ffmpeg \
        cmake \
        build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Node dependencies
COPY package*.json ./
RUN npm ci

# Copy application
COPY . .

# Build whisper.cpp
WORKDIR /app/node_modules/nodejs-whisper/cpp/whisper.cpp

RUN cmake -B build -DCMAKE_BUILD_TYPE=Release && \
    cmake --build build --config Release --target whisper-cli -j$(nproc)

WORKDIR /app

EXPOSE 5000

CMD ["npm", "start"]
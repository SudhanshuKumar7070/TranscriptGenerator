import path from "node:path";
import multer from "multer";

const uploadDir = path.join(process.cwd(), "Public", "temp");

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

export const upload = multer({
  storage,
  limits: {
    fileSize: 200 * 1024 * 1024,
  },
});

export const uploadPath = "/Public/temp";

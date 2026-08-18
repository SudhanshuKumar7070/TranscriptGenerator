import { Router } from "express";
import { processVideo } from "../controller/videoProcess.ts";
import { upload } from "../config/multer.ts";

const router = Router();

router.post("/uploadVideo", upload.single("video"), processVideo);

export default router;
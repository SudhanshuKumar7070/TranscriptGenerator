import express from "express";
import cors from "cors";
import path from "node:path";
import { upload } from "./config/multer.ts";
import businessRoutes from "./route/business.ts";

const app = express();
const uploadDir = path.join(process.cwd(), "public", "temp");
const audioDir = path.join(process.cwd(), "public", "audio");

app.use(cors());
app.use(express.json());
app.use("/public", express.static(uploadDir));
app.use("/audio", express.static(audioDir));
app.use("/api/v1",businessRoutes);

app.get("/ping", (_req, res) => {
  return res.status(200).json({ message: "pong" });
});

app.listen(5000, () => {
  console.log("server is listening on http://localhost:5000");
});
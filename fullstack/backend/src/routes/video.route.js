import express from "express";
import { checkUploadChunkStatus, uploadVideo, uploadVideoComplete } from "../controllers/video.controller.js";
import { upload } from "../utils/index.js";

const router = express.Router();

router.post("/upload", upload.single("chunk"), uploadVideo);
router.post("/upload-complete", uploadVideoComplete);
router.post("/check-upload-status", checkUploadChunkStatus)

export default router;
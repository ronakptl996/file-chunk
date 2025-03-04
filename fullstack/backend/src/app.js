import express from "express";
import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(dirname(__filename));

const uploadDir = `${__dirname}/uploads`;
if (!uploadDir) {
    fs.mkdirSync(uploadDir)
}

app.get("/", (req, res) => {
    res.send("Hello World");
});

app.get("/video", (req, res) => {
    try {
        const range = req.headers.range;
        if (!range) {
            res.status(400).send("Requires Range header");
        }

        // const videoPath = `${__dirname}/public/streams.mp4`;
        const videoPath = `${uploadDir}/Decq-demo.mp4`;
        console.log("path >>", videoPath)
        const videoSize = fs.statSync(videoPath).size;

        const CHUNK_SIZE = 10 ** 6; // 1MB
        const start = Number(range.replace(/\D/g, ""));
        const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
        const contentLength = end - start + 1;
        const headers = {
            "Content-Range": `bytes ${start}-${end}/${videoSize}`,
            "Accept-Ranges": "bytes",
            "Content-Length": contentLength,
            "Content-Type": "video/mp4"
        };

        const file = fs.createReadStream(videoPath, {
            start,
            end,
        });

        file.pipe(res);
        res.writeHead(206, headers);
    } catch (error) {
        console.log("Error ==> ", error)
    }
});

import videoRoute from "./routes/video.route.js";

app.use("/api/video", videoRoute);

app.listen(3001, () => {
    console.log("Server is running on port 3001");
});

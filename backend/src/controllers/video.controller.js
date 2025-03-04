import fs from "fs";
import path, { dirname } from "path";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { fileURLToPath } from "url";

// app.post("/upload", upload.single("chunk"), async (req, res) => {
//     try {
//         const { chunkIndex, totalChunks, fileName } = req.body;
//         const chunkPath = path.join(uploadDir, `${fileName}.part${chunkIndex}`);

//         await fs.promises.rename(req.file.path, chunkPath);

//         res.json({ success: true, chunkIndex });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// });


// app.post("/upload-complete", (req, res) => {
//     const { fileName } = req.body;
//     const filePath = path.join(uploadDir, fileName);
//     const chunkFiles = fs
//         .readdirSync(uploadDir)
//         .filter((file) => file.startsWith(fileName + ".part"))
//         .sort((a, b) => {
//             const aIndex = parseInt(a.split(".part")[1]);
//             const bIndex = parseInt(b.split(".part")[1]);
//             return aIndex - bIndex;
//         });

//     const writeStream = fs.createWriteStream(filePath);
//     chunkFiles.forEach((chunkFile) => {
//         const chunkPath = path.join(uploadDir, chunkFile);
//         const chunkData = fs.readFileSync(chunkPath);
//         writeStream.write(chunkData);
//         fs.unlinkSync(chunkPath);
//     });

//     writeStream.end();
//     res.json({ success: true, message: "File assembled successfully!" });
// });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const grandParentDir = path.dirname(path.dirname(__dirname));

const uploadVideo = async (req, res) => {
    try {
        const uploadDir = `${grandParentDir}/uploads`;
        const { chunkIndex, totalChunks, fileName } = req.body;
        const chunkPath = path.join(uploadDir, `${fileName}.part${chunkIndex}`);

        await fs.promises.rename(req.file.path, chunkPath);

        return res
            .status(200)
            .json(new ApiResponse(200, { chunkIndex }, "Chunk uploaded!"));
    } catch (error) {
        return res
            .status(500)
            .json(new ApiError(500, "Something went wrong", error));
    }
}

const uploadVideoComplete = async (req, res) => {
    try {
        const { fileName } = req.body;
        const uploadDir = `${grandParentDir}/uploads`;
        const filePath = path.join(uploadDir, fileName);
        const chunkFiles = fs
            .readdirSync(uploadDir)
            .filter((file) => file.startsWith(fileName + ".part"))
            .sort((a, b) => {
                const aIndex = parseInt(a.split(".part")[1]);
                const bIndex = parseInt(b.split(".part")[1]);
                return aIndex - bIndex;
            });

        const writeStream = fs.createWriteStream(filePath);
        chunkFiles.forEach((chunkFile) => {
            const chunkPath = path.join(uploadDir, chunkFile);
            const chunkData = fs.readFileSync(chunkPath);
            writeStream.write(chunkData);
            fs.unlinkSync(chunkPath);
        });

        writeStream.end();
        return res
            .status(200)
            .json(new ApiResponse(200, null, "File assembled successfully!"));
    } catch (error) {
        return res
            .status(500)
            .json(new ApiError(500, "Something went wrong", error));
    }
}

const checkUploadChunkStatus = async (req, res) => {
    try {
        console.log("CALLED === >>");
        const { fileName } = req.body;
        const uploadDir = `${grandParentDir}/uploads`;
        const files = fs.readdirSync(uploadDir);
        console.log("FILES >>", files);

        // Get already uploaded chunks
        const uploaded = files
            .filter(file => file.startsWith(fileName + ".part"))
            .map(file => parseInt(file.split(".part")[1]));

        console.log({ uploaded });
        // return res.json({ uploaded })
        return res
            .status(200)
            .json(new ApiResponse(200, { uploaded }, "Chunk get successfully!"));
    } catch (error) {
        return res
            .status(500)
            .json(new ApiError(500, "Something went wrong", error));
    }
};

export { uploadVideo, uploadVideoComplete, checkUploadChunkStatus }
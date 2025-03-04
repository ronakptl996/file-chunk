import multer from "multer";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const grandParentDir = path.dirname(path.dirname(__dirname));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, `${grandParentDir}/uploads`);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname + "_" + Date.now());
    },
});

export const upload = multer({ storage });
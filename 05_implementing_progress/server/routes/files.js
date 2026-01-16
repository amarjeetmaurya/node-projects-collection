// routes/files.js
import fs from "fs";
import path from "path";
import { createWriteStream } from "fs";
import { v4 as uuidv4 } from "uuid";

// Path to JSON file that stores metadata
const metadataPath = path.join(process.cwd(), "files.json");
console.log(metadataPath);

// Helper to read/write JSON metadata
function readMetadata() {
  if (!fs.existsSync(metadataPath)) return [];
  return JSON.parse(fs.readFileSync(metadataPath, "utf-8"));
}

function writeMetadata(data) {
  fs.writeFileSync(metadataPath, JSON.stringify(data, null, 2));
}

// Upload route
export const uploadFile = async (req, res, next) => {
  console.log("hy");
  console.log(req.body);
  console.log(req.params);
  const parentDirId = req.params.parentDirId || req.user.rootDirId;

  try {
    // Check if parent directory exists (for demo, assume always valid)
    if (!parentDirId) {
      return res.status(404).json({ error: "Parent directory not found!" });
    }

    const filename = req.headers.filename || "untitled";
    const extension = path.extname(filename);
    console.log({ filename, extension });

    // Create new file metadata
    const fileId = uuidv4();
    const fullFileName = `${fileId}${extension}`;
    console.log(fullFileName);

    const metadata = readMetadata();
    const user = {
      _id: "demoUserId123", // For demo purposes, assuming a logged-in user
    };
    console.log(process.cwd());
    metadata.push({
      id: fileId,
      extension,
      name: filename,
      parentDirId,
      userId: user._id,
    });
    writeMetadata(metadata);

    // Save file to storage
    const storageDir = path.join(process.cwd(), "storage");
    console.log(storageDir);
    if (!fs.existsSync(storageDir)) fs.mkdirSync(storageDir);

    const writeStream = createWriteStream(path.join(storageDir, fullFileName));
    req.pipe(writeStream);

    req.on("end", () => {
      return res.status(201).json({ message: "File Uploaded", id: fileId });
    });

    req.on("error", () => {
      // Rollback metadata if upload fails
      const updated = readMetadata().filter((f) => f.id !== fileId);
      writeMetadata(updated);
      return res.status(500).json({ message: "Could not Upload File" });
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

// Get directory route
export const getDirectory = async (req, res) => {
  const { id } = req.params;
  const metadata = readMetadata();
  const fileData = metadata;
  
  if (!fileData) {
    return res.status(404).json({ error: "File not found!" });
  }

  return res.json(fileData);
};

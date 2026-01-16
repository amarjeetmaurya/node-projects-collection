import express from "express";
import cors from "cors";
import { uploadFile, getDirectory } from "./routes/files.js";

const app = express();

app.use(cors({
    origin: 'http://localhost:5173', // Adjust according to your client port
    credentials: true,
}));

app.use(express.json());

app.post("/upload/{:parentDirId}", uploadFile);
app.get("/directory/{:parentDirId}", getDirectory);

app.listen(3000, () => console.log("Server running on port 3000"));

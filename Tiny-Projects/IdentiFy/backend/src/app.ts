
// src/app.ts
import express from "express";
import { connectDB } from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import type { Request, Response } from "express";
import cors from "cors";



connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/", userRoutes);
app.get("/check", (req: Request, res: Response) => {
    res.json({sucess: "hey! done!!"});
});

export default app;

// src/routes/userRoutes.ts
import express from "express";
import { createUser, getUser } from "../controllers/userController.js";

const router = express.Router();

router.post("/users", createUser);
router.get("/users/:username", getUser);

export default router;

// src/controllers/userController.ts
import type { Request, Response } from "express";
import User from "../models/User.js";
import { generateUploadUrl } from "../utils/s3Utils.js";

export const createUser = async (req: Request, res: Response) => {
  console.log(req.body);
  try {
    const { username, email, bio } = req.body;

    // Create user in MongoDB
    const user = await User.create({ username, email, bio });
    console.log("is this working!!");

    // Generate S3 key for profile picture
    const profilePictureKey = `users/${username}/profile.jpg`;

    // Generate pre-signed URL
    const presignedUrl = await generateUploadUrl(
      profilePictureKey,
      "image/jpeg",
    );

    user.profilePictureKey = profilePictureKey;
    await user.save();

    res.json({ user, presignedUrl });
  } catch (err) {
    res.status(500).json({ error: "Error creating user" });
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
    const { username } = req.params;

    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }

    const user = await User.findOne({ username });

    if (!user) return res.status(404).json({ error: "User not found" });
    console.log(user);

    // Construct public URL (if bucket is public) or return key
    const profilePictureUrl = user.profilePictureKey
      ? `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${user.profilePictureKey}`
      : undefined;
    
    res.json({ ...user.toObject(), profilePictureUrl });
  } catch (err) {
    res.status(500).json({ error: "Error fetching user" });
  }
};

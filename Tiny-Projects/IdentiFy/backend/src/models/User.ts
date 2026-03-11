// src/models/User.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  username: string;
  email: string;
  bio?: string;
  profilePictureKey?: string;
}

const UserSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  bio: { type: String },
  profilePictureKey: { type: String },
});

export default mongoose.model<IUser>("User", UserSchema);

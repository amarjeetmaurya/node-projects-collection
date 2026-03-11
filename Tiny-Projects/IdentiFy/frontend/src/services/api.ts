// src/services/api.ts
import axios from "axios";
import type { User } from "../types/User";

const API_BASE = "http://localhost:4000"; // backend URL

export async function createUser(user: User) {
  return axios.post(`${API_BASE}/users`, user);
}

export async function getUser(username: string): Promise<User | null> {
  try {
    const res = await axios.get<User>(`${API_BASE}/users/${username}`);
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      if (err.response?.status === 404) {
        return null; // user not found
      }
    }
    throw err; // rethrow other errors
  }
}

export async function uploadProfilePicture(file: File, presignedUrl: string) {
    console.log("first")
  return axios.put(presignedUrl, file, {
    headers: { "Content-Type": file.type },
  });
}

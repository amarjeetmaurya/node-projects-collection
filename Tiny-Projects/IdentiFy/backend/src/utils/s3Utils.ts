// src/utils/s3Utils.ts
import { s3 } from "../config/s3.js";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const generateUploadUrl = async (key: string, contentType: string) => {
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: key,
    ContentType: contentType,
  });

  return await getSignedUrl(s3, command, {
    expiresIn: 3600,
    signableHeaders: new Set(["content-type"]),
  });
};


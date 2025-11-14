import mongoose from "mongoose";
import { Readable } from "stream";

let bucket: mongoose.mongo.GridFSBucket | null = null;

/**
 * Initialise GridFS bucket
 */
export function getGridFSBucket(): mongoose.mongo.GridFSBucket {
  if (!mongoose.connection.db) {
    throw new Error("Database connection not established");
  }

  if (!bucket) {
    bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: "documents",
    });
  }

  return bucket;
}

/**
 * Upload un fichier vers GridFS
 */
export async function uploadToGridFS(
  buffer: Buffer,
  filename: string,
  metadata: {
    originalName: string;
    mimeType: string;
    userId: string;
    type: string;
    applicationId?: string;
    description?: string;
  }
): Promise<mongoose.Types.ObjectId> {
  return new Promise((resolve, reject) => {
    const bucket = getGridFSBucket();
    const readableStream = Readable.from(buffer);

    const uploadStream = bucket.openUploadStream(filename, {
      metadata,
    });

    readableStream.pipe(uploadStream);

    uploadStream.on("finish", () => {
      resolve(uploadStream.id as mongoose.Types.ObjectId);
    });

    uploadStream.on("error", (error) => {
      reject(error);
    });
  });
}

/**
 * Télécharge un fichier depuis GridFS
 */
export async function downloadFromGridFS(
  fileId: mongoose.Types.ObjectId
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const bucket = getGridFSBucket();
    const chunks: Buffer[] = [];

    const downloadStream = bucket.openDownloadStream(fileId);

    downloadStream.on("data", (chunk) => {
      chunks.push(chunk);
    });

    downloadStream.on("end", () => {
      resolve(Buffer.concat(chunks));
    });

    downloadStream.on("error", (error) => {
      reject(error);
    });
  });
}

/**
 * Supprime un fichier de GridFS
 */
export async function deleteFromGridFS(
  fileId: mongoose.Types.ObjectId
): Promise<void> {
  const bucket = getGridFSBucket();
  await bucket.delete(fileId);
}

/**
 * Récupère les métadonnées d'un fichier
 */
export async function getFileMetadata(fileId: mongoose.Types.ObjectId) {
  const bucket = getGridFSBucket();
  const files = await bucket.find({ _id: fileId }).toArray();
  return files[0] || null;
}

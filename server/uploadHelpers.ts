import fs from "fs";
import path from "path";
import { promisify } from "util";

const mkdir = promisify(fs.mkdir);
const rm = promisify(fs.rm);

/**
 * Generate a URL-safe slug from a string
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
}

/**
 * Generate a unique filename with timestamp and random string
 */
export function generateUniqueFilename(originalName: string, prefix?: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 10);
  const ext = path.extname(originalName);
  const slug = prefix ? generateSlug(prefix) : "file";
  return `${timestamp}-${slug}-${random}${ext}`;
}

/**
 * Create directory if it doesn't exist
 */
export function ensureDir(dirPath: string): void {
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  } catch (error: any) {
    if (error.code !== "EEXIST") {
      throw error;
    }
  }
}

/**
 * Get course upload directory
 */
export function getCourseUploadDir(courseId: string): string {
  return path.join(process.cwd(), "uploads", "courses", courseId);
}

/**
 * Get thumbnail upload path
 */
export function getThumbnailPath(courseId: string, filename: string): string {
  return path.join(getCourseUploadDir(courseId), "thumbnails", filename);
}

/**
 * Get lesson video upload path
 */
export function getLessonVideoPath(courseId: string, lessonId: string, filename: string): string {
  return path.join(getCourseUploadDir(courseId), "videos", lessonId, filename);
}

/**
 * Clean up uploaded files on error
 */
export async function cleanupFiles(files: string[]): Promise<void> {
  for (const file of files) {
    try {
      if (fs.existsSync(file)) {
        await rm(file, { recursive: true, force: true });
      }
    } catch (error) {
      console.error(`Failed to cleanup file: ${file}`, error);
    }
  }
}

/**
 * Clean up course directory
 */
export async function cleanupCourseDir(courseId: string): Promise<void> {
  const courseDir = getCourseUploadDir(courseId);
  try {
    if (fs.existsSync(courseDir)) {
      await rm(courseDir, { recursive: true, force: true });
    }
  } catch (error) {
    console.error(`Failed to cleanup course directory: ${courseDir}`, error);
  }
}

/**
 * Move file from temp to final destination
 */
export async function moveFile(source: string, destination: string): Promise<void> {
  await ensureDir(path.dirname(destination));
  await promisify(fs.rename)(source, destination);
}

/**
 * Validate file MIME type
 */
export function validateMimeType(mimetype: string, allowedTypes: string[]): boolean {
  return allowedTypes.some(type => {
    if (type.endsWith("/*")) {
      const prefix = type.slice(0, -2);
      return mimetype.startsWith(prefix + "/");
    }
    return mimetype === type;
  });
}

/**
 * Validate file size
 */
export function validateFileSize(size: number, maxSize: number): boolean {
  return size <= maxSize;
}

// File size constants
export const MAX_THUMBNAIL_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_VIDEO_SIZE = 2 * 1024 * 1024 * 1024; // 2GB

// Allowed MIME types
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
export const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

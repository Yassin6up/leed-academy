import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

interface HLSConfig {
  videoPath: string;
  outputDir: string;
  segmentDuration?: number;
  encryptionKey?: string;
}

export class HLSConverter {
  private static readonly HLS_CACHE = new Map<string, string>();

  // Generate AES-128 encryption key (16 bytes = 128 bits)
  static generateEncryptionKey(): string {
    return require("crypto").randomBytes(16).toString("hex");
  }

  // Convert MP4 to HLS format with encryption
  static async convertToHLS(config: HLSConfig): Promise<string> {
    const { videoPath, outputDir, segmentDuration = 6, encryptionKey } = config;

    // Check cache first
    const cacheKey = `${videoPath}:${encryptionKey}`;
    if (this.HLS_CACHE.has(cacheKey)) {
      return this.HLS_CACHE.get(cacheKey)!;
    }

    // Create output directory
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const manifestPath = path.join(outputDir, "playlist.m3u8");
    const keyPath = path.join(outputDir, "encryption.key");
    const keyInfoPath = path.join(outputDir, "key.info");

    // Write encryption key to file
    if (encryptionKey) {
      fs.writeFileSync(keyPath, Buffer.from(encryptionKey, "hex"));
      fs.writeFileSync(keyInfoPath, `file://${keyPath}\n`);
    }

    try {
      // FFmpeg command to convert to HLS with encryption
      let ffmpegCmd = `ffmpeg -i "${videoPath}" -c:v libx264 -c:a aac -hls_time ${segmentDuration} -hls_list_size 0`;

      if (encryptionKey) {
        ffmpegCmd += ` -hls_key_info_file "${keyInfoPath}"`;
      }

      ffmpegCmd += ` -hls_segment_type mpegts "${manifestPath}" -y`;

      // Run conversion silently
      await execAsync(ffmpegCmd, { maxBuffer: 10 * 1024 * 1024 });

      // Cache result
      this.HLS_CACHE.set(cacheKey, manifestPath);

      return manifestPath;
    } catch (error: any) {
      console.error("HLS conversion error:", error.message);
      throw new Error(`Failed to convert video to HLS: ${error.message}`);
    }
  }

  // Get HLS manifest content with encryption key info
  static getManifestWithKey(
    manifestPath: string,
    encryptionKey?: string,
    keyUrl?: string
  ): string {
    let manifest = fs.readFileSync(manifestPath, "utf-8");

    // Inject encrypted key URL if encryption is enabled
    if (encryptionKey && keyUrl) {
      manifest = manifest.replace(
        /#EXT-X-KEY:METHOD=AES-128,URI="[^"]*"/,
        `#EXT-X-KEY:METHOD=AES-128,URI="${keyUrl}"`
      );
    }

    return manifest;
  }

  // Clean up HLS segments for a lesson
  static cleanup(outputDir: string): void {
    try {
      if (fs.existsSync(outputDir)) {
        const files = fs.readdirSync(outputDir);
        files.forEach((file) => {
          fs.unlinkSync(path.join(outputDir, file));
        });
        fs.rmdirSync(outputDir);
      }
    } catch (error) {
      console.error("HLS cleanup error:", error);
    }
  }

  // Check if HLS segments already exist
  static hasSegments(outputDir: string): boolean {
    return fs.existsSync(path.join(outputDir, "playlist.m3u8"));
  }
}

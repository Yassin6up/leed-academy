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
  // Generate AES-128 encryption key (16 bytes = 128 bits)
  static generateEncryptionKey(): string {
    return require("crypto").randomBytes(16).toString("hex");
  }

  // Convert MP4 to HLS format with encryption (optimized for speed)
  static async convertToHLS(config: HLSConfig): Promise<string> {
    const { videoPath, outputDir, segmentDuration = 4, encryptionKey } = config;

    // Create output directory
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const manifestPath = path.join(outputDir, "playlist.m3u8");
    const keyPath = path.join(outputDir, "encryption.key");
    const keyInfoPath = path.join(outputDir, "key.info");

    // Skip if already converted
    if (fs.existsSync(manifestPath)) {
      return manifestPath;
    }

    // Write encryption key to file
    if (encryptionKey) {
      fs.writeFileSync(keyPath, Buffer.from(encryptionKey, "hex"));
      fs.writeFileSync(keyInfoPath, `file://${keyPath}\n`);
    }

    try {
      // Optimized FFmpeg command for faster conversion
      let ffmpegCmd = `ffmpeg -i "${videoPath}" -c:v libx264 -preset fast -crf 28 -c:a aac -b:a 128k -hls_time ${segmentDuration} -hls_list_size 0`;

      if (encryptionKey) {
        ffmpegCmd += ` -hls_key_info_file "${keyInfoPath}"`;
      }

      ffmpegCmd += ` -hls_segment_type mpegts "${manifestPath}" -y -v quiet`;

      // Run conversion
      console.log(`Converting video to HLS: ${videoPath}`);
      await execAsync(ffmpegCmd, { maxBuffer: 50 * 1024 * 1024, timeout: 300000 });
      console.log(`Conversion complete: ${manifestPath}`);

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

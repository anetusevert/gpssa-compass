import { writeFile, mkdir, readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), ".uploads", "avatars");

export class UploadService {
  private async ensureUploadDir() {
    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true });
    }
  }

  async saveAvatar(userId: string, file: File): Promise<string> {
    await this.ensureUploadDir();

    const ext = file.name.split(".").pop() || "jpg";
    const filename = `${userId}.${ext}`;
    const filepath = path.join(UPLOAD_DIR, filename);

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filepath, buffer);

    return `/api/avatars/${userId}?t=${Date.now()}`;
  }

  async getAvatarPath(userId: string): Promise<string | null> {
    const extensions = ["jpg", "jpeg", "png", "gif", "webp"];
    for (const ext of extensions) {
      const filepath = path.join(UPLOAD_DIR, `${userId}.${ext}`);
      if (existsSync(filepath)) return filepath;
    }
    return null;
  }

  async readAvatar(userId: string): Promise<{ buffer: Buffer; mimeType: string } | null> {
    const filepath = await this.getAvatarPath(userId);
    if (!filepath) return null;

    const ext = path.extname(filepath).slice(1).toLowerCase();
    const mimeMap: Record<string, string> = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      webp: "image/webp",
    };

    const buffer = await readFile(filepath);
    return { buffer, mimeType: mimeMap[ext] || "image/jpeg" };
  }
}

export const uploadService = new UploadService();

import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "avatars");

export class UploadService {
  private async ensureUploadDir() {
    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true });
    }
  }

  async saveAvatar(
    userId: string,
    file: File
  ): Promise<string> {
    await this.ensureUploadDir();

    const ext = file.name.split(".").pop() || "jpg";
    const filename = `${userId}.${ext}`;
    const filepath = path.join(UPLOAD_DIR, filename);

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filepath, buffer);

    return `/uploads/avatars/${filename}`;
  }
}

export const uploadService = new UploadService();

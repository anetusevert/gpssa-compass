import { prisma } from "@/lib/db";

const MAX_DIMENSION = 256;

export class UploadService {
  async saveAvatar(userId: string, file: File): Promise<string> {
    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const mimeMap: Record<string, string> = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      webp: "image/webp",
    };
    const mimeType = mimeMap[ext] || "image/jpeg";

    const dataUrl = `data:${mimeType};base64,${buffer.toString("base64")}`;

    await prisma.user.update({
      where: { id: userId },
      data: { avatar: dataUrl },
    });

    return dataUrl;
  }

  async readAvatar(userId: string): Promise<{ buffer: Buffer; mimeType: string } | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { avatar: true },
    });

    if (!user?.avatar) return null;

    if (user.avatar.startsWith("data:")) {
      const match = user.avatar.match(/^data:([^;]+);base64,(.+)$/);
      if (!match) return null;
      return {
        mimeType: match[1],
        buffer: Buffer.from(match[2], "base64"),
      };
    }

    return null;
  }
}

export const uploadService = new UploadService();

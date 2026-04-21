import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

const SALT_ROUNDS = 12;

export class AuthService {
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    if (!hash.startsWith("$2")) {
      return password === hash;
    }
    return bcrypt.compare(password, hash);
  }

  async findUserByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  async createUser(data: {
    email: string;
    password: string;
    name: string;
    role: string;
    userType: string;
    hasCompletedProfile?: boolean;
  }) {
    const hashedPassword = await this.hashPassword(data.password);
    return prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    });
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return { success: false, error: "User not found" };

    const valid = await this.verifyPassword(currentPassword, user.password);
    if (!valid) return { success: false, error: "Current password is incorrect" };

    const hashedNew = await this.hashPassword(newPassword);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNew },
    });

    return { success: true };
  }

  detectUserType(email: string): string {
    const lower = email.toLowerCase();
    if (lower === "utena.treves@gmail.com") return "adl";
    if (lower.endsWith("@adlittle.com")) return "adl";
    // Recognise demo accounts so first-sign-in auto-creation routes them
    // through the neutral demo experience instead of defaulting to gpssa.
    if (lower.startsWith("demo@") || lower.startsWith("demo.") || lower.includes("+demo@")) {
      return "demo";
    }
    return "gpssa";
  }

  detectRole(email: string): string {
    if (email === "utena.treves@gmail.com") return "admin";
    return "user";
  }
}

export const authService = new AuthService();

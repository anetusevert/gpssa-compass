import { prisma } from "@/lib/db";
import { authService } from "./auth.service";

const USER_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  userType: true,
  department: true,
  avatar: true,
  hasCompletedProfile: true,
  createdAt: true,
  updatedAt: true,
} as const;

export class UserService {
  async listUsers() {
    return prisma.user.findMany({
      select: USER_SELECT,
      orderBy: { createdAt: "desc" },
    });
  }

  async getUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: USER_SELECT,
    });
  }

  async createUser(data: {
    name: string;
    email: string;
    password: string;
    role?: string;
    userType?: string;
    department?: string;
  }) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existing) {
      throw new Error("A user with this email already exists");
    }

    const hashedPassword = await authService.hashPassword(data.password);
    return prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role ?? "user",
        userType: data.userType ?? "gpssa",
        department: data.department ?? null,
      },
      select: USER_SELECT,
    });
  }

  async updateUser(
    id: string,
    data: {
      name?: string;
      email?: string;
      role?: string;
      userType?: string;
      department?: string;
    }
  ) {
    return prisma.user.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.role !== undefined && { role: data.role }),
        ...(data.userType !== undefined && { userType: data.userType }),
        ...(data.department !== undefined && { department: data.department }),
      },
      select: USER_SELECT,
    });
  }

  async deleteUser(id: string) {
    return prisma.user.delete({ where: { id } });
  }

  async updateAvatar(userId: string, avatarPath: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { avatar: avatarPath },
      select: USER_SELECT,
    });
  }

  async updateProfile(
    userId: string,
    data: { name?: string; email?: string }
  ) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.email !== undefined && { email: data.email }),
        hasCompletedProfile: true,
      },
      select: USER_SELECT,
    });
  }
}

export const userService = new UserService();

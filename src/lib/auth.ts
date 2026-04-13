import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { authService } from "@/lib/services";
import { prisma } from "@/lib/db";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        let user = await authService.findUserByEmail(credentials.email);

        if (user) {
          const valid = await authService.verifyPassword(
            credentials.password,
            user.password
          );
          if (!valid) return null;
        } else {
          const userType = authService.detectUserType(credentials.email);
          const role = authService.detectRole(credentials.email);
          user = await authService.createUser({
            email: credentials.email,
            password: credentials.password,
            name: credentials.email.split("@")[0],
            role,
            userType,
            hasCompletedProfile: role === "admin",
          });
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          userType: user.userType,
          image: user.avatar,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/" },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.userType = (user as any).userType;
        token.avatar = (user as any).image;
      }
      if (trigger === "update" && session) {
        token.name = session.name ?? token.name;
        token.avatar = session.avatar ?? token.avatar;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).userType = token.userType;

        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { avatar: true, name: true },
          });
          (session.user as any).avatar = dbUser?.avatar || token.avatar;
          if (dbUser?.name) session.user.name = dbUser.name;
        } catch {
          (session.user as any).avatar = token.avatar;
        }
      }
      return session;
    },
  },
};

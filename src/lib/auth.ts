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

        // Only seeded users (the shared demo account and any pre-provisioned
        // admins) may sign in. Unknown emails are rejected outright -- the
        // landing UI never exposes a sign-up path, so silently auto-creating
        // accounts would just mask configuration errors.
        const user = await authService.findUserByEmail(credentials.email);
        if (!user) return null;

        const valid = await authService.verifyPassword(
          credentials.password,
          user.password
        );
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          userType: user.userType,
          image: null,
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
      }
      if (trigger === "update" && session) {
        token.name = session.name ?? token.name;
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
          const hasAvatar = !!dbUser?.avatar;
          (session.user as any).avatar = hasAvatar
            ? `/api/avatars/${token.id}`
            : null;
          if (dbUser?.name) session.user.name = dbUser.name;
        } catch {
          (session.user as any).avatar = null;
        }
      }
      return session;
    },
  },
};

import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./db";

function detectUserType(email: string): string {
  if (email === "utena.treves@gmail.com") return "admin";
  if (email.endsWith("@adlittle.com")) return "adl";
  return "gpssa";
}

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

        let user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (user) {
          if (user.password !== credentials.password) return null;
        } else {
          const userType = detectUserType(credentials.email);
          user = await prisma.user.create({
            data: {
              email: credentials.email,
              password: credentials.password,
              name: credentials.email.split("@")[0],
              role: userType === "admin" ? "admin" : "user",
              userType,
              hasCompletedProfile: userType === "admin",
            },
          });
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          userType: user.userType,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.userType = (user as any).userType;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).userType = token.userType;
      }
      return session;
    },
  },
};

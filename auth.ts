import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { db as prisma } from "@/lib/prisma"
import { authConfig } from "./auth.config"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import bcrypt from "bcryptjs"
import { z } from "zod"

// Export prisma for use in other files
export { prisma }

// Extend authConfig with Node-only providers
export const {
    handlers: { GET, POST },
    auth,
    signIn,
    signOut,
} = NextAuth({
    adapter: PrismaAdapter(prisma),
    session: { strategy: "jwt" },
    secret: process.env.AUTH_SECRET || "secret",
    ...authConfig,
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
        Credentials({
            async authorize(credentials) {
                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(1) })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const { email, password } = parsedCredentials.data;
                    const user = await prisma.user.findUnique({ where: { email } });

                    if (!user || !user.password) return null;

                    const passwordsMatch = await bcrypt.compare(password, user.password);

                    if (passwordsMatch) return user;
                }

                return null; // Return null if validation checks fail
            },
        })
    ],
    callbacks: {
        async session({ session, token }) {
            if (token.sub && session.user) {
                session.user.id = token.sub
            }

            if (token.role && session.user) {
                session.user.role = token.role as "ADMIN" | "USER"
            }

            if (session.user) {
                session.user.isTwoFactorEnabled = token.isTwoFactorEnabled as boolean
            }

            return session
        },
        async jwt({ token }) {
            if (!token.sub) return token

            const existingUser = await prisma.user.findUnique({
                where: { id: token.sub }
            })

            if (!existingUser) return token

            token.role = existingUser.role
            token.isTwoFactorEnabled = existingUser.isTwoFactorEnabled

            return token
        }
    }
})

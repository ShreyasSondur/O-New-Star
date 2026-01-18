import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import bcrypt from "bcryptjs"
import { z } from "zod"

const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
    code: z.optional(z.string()),
})

async function getUserByEmail(email: string) {
    // We can't use Prisma here if we want this to be edge-compatible, 
    // but for now we might not be strictly edge-only. 
    // However, NextAuth v5 splits config to allow edge middleware.
    // We'll leave the actual DB fetch for the 'remote' split or use a fetch adapter.
    // For the 'authorize' function specifically in the config, we usually can't use standard Prisma 
    // if this file is imported in middleware and middleware is edge.
    // BUT: Credentials provider is usually NOT edge compatible if it uses node modules tailored for Node (bcrypt).
    // So we often put Credentials provider in the main auth.ts (Node) and only keep light config here.
    // Let's stick to putting Providers in auth.ts if they are Node-only, or keep them here if compatible.
    // NextAuth v5 recommends splitting.
    return null // Placeholder, actual logic in auth.ts for Credentials
}

export const authConfig = {
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
    ],
    pages: {
        signIn: "/auth/login",
        error: "/auth/error",
    },
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

            // Note: We can add more DB lookups here if needed in auth.ts extended config
            return token
        }
    }
} satisfies NextAuthConfig

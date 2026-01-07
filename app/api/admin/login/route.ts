
import { NextResponse } from "next/server";
import { SignJWT } from "jose";
import { z } from "zod";

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; lastAttempt: number }>();
const BLOCK_DURATION = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;

const loginSchema = z.object({
    username: z.string().min(1, "Username is required"),
    password: z.string().min(1, "Password is required"),
});

export async function POST(request: Request) {
    try {
        // Rate Limiting Logic
        const ip = request.headers.get("x-forwarded-for") || "unknown";
        const now = Date.now();
        const rateData = rateLimitMap.get(ip);

        if (rateData) {
            if (rateData.count >= MAX_ATTEMPTS) {
                if (now - rateData.lastAttempt < BLOCK_DURATION) {
                    const remainingTime = Math.ceil((BLOCK_DURATION - (now - rateData.lastAttempt)) / 60000);
                    return NextResponse.json(
                        { error: `Too many login attempts. Please try again in ${remainingTime} minutes.` },
                        { status: 429 }
                    );
                } else {
                    // Reset after block duration
                    rateLimitMap.delete(ip);
                }
            }
        }

        const body = await request.json();

        // Input Validation
        const validationResult = loginSchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json({ error: "Invalid input" }, { status: 400 });
        }

        const { username, password } = validationResult.data;

        const adminUsername = process.env.ADMIN_USERNAME;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!adminUsername || !adminPassword) {
            console.error("Admin credentials not set in environment variables");
            return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
        }

        if (username === adminUsername && password === adminPassword) {
            // Successful login - reset rate limit
            rateLimitMap.delete(ip);

            if (!process.env.JWT_SECRET) {
                console.error("JWT_SECRET is not defined");
                return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
            }

            const secret = new TextEncoder().encode(process.env.JWT_SECRET);

            const token = await new SignJWT({ role: "admin" })
                .setProtectedHeader({ alg: "HS256" })
                .setIssuedAt()
                .setExpirationTime("24h")
                .sign(secret);

            const response = NextResponse.json({ success: true });

            response.cookies.set("admin_token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 60 * 60 * 24, // 24 hours
                path: "/",
            });

            return response;
        }

        // Failed login attempt - update rate limit
        const currentData = rateLimitMap.get(ip) || { count: 0, lastAttempt: 0 };
        rateLimitMap.set(ip, {
            count: currentData.count + 1,
            lastAttempt: now
        });

        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

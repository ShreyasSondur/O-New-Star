import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const { auth } = NextAuth(authConfig);

// Combine NextAuth middleware with existing custom admin logic
export default auth(async (req) => {
    const { nextUrl } = req;
    const isLoggedIn = !!req.auth;

    const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
    const isPublicRoute = ["/", "/about", "/rooms", "/contact", "/privacy-policy", "/terms-conditions", "/admin/login"].includes(nextUrl.pathname);
    const isAuthRoute = ["/auth/login", "/auth/register", "/auth/error"].includes(nextUrl.pathname);
    const isAdminRoute = nextUrl.pathname.startsWith("/admin");

    // Allow API Auth routes
    if (isApiAuthRoute) {
        return NextResponse.next();
    }

    // Existing Admin Security Logic (Preserved)
    // If accessing admin routes (except login), verify custom admin_token OR NextAuth Admin Role
    // (We will likely transition to NextAuth role completely, but for now keep backward compat if needed)
    if (isAdminRoute && nextUrl.pathname !== "/admin/login") {
        // Check for NextAuth Admin
        if (isLoggedIn && req.auth?.user?.role === "ADMIN") {
            // Allow
        } else {
            // Fallback to existing logic: Check for admin_token cookie
            const token = req.cookies.get("admin_token")?.value;
            if (token) {
                try {
                    if (process.env.JWT_SECRET) {
                        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
                        await jwtVerify(token, secret);
                        // Valid old admin token
                    }
                } catch (e) {
                    // Invalid token
                    return NextResponse.redirect(new URL("/admin/login", nextUrl));
                }
            } else {
                return NextResponse.redirect(new URL("/admin/login", nextUrl));
            }
        }
    }

    // Redirect to home if logged in and trying to access auth pages
    if (isAuthRoute) {
        if (isLoggedIn) {
            return NextResponse.redirect(new URL("/", nextUrl));
        }
        return NextResponse.next();
    }

    return NextResponse.next();
});

export const config = {
    // Matcher ignoring static files
    matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}

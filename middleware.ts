
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // Define paths that require authentication
    // Verify token for admin routes
    if (path.startsWith("/admin")) {
        // Allow access to login page
        if (path === "/admin/login") {
            const response = NextResponse.next();
            addSecurityHeaders(response);
            return response;
        }

        // Check for admin_token cookie
        const token = request.cookies.get("admin_token")?.value;

        if (!token) {
            return NextResponse.redirect(new URL("/admin/login", request.url));
        }

        try {
            if (!process.env.JWT_SECRET) {
                console.error("JWT_SECRET is not defined");
                // In production, we should probably fail closed, but for now redirect
                return NextResponse.redirect(new URL("/admin/login", request.url));
            }
            const secret = new TextEncoder().encode(process.env.JWT_SECRET);
            await jwtVerify(token, secret);
            const response = NextResponse.next();
            addSecurityHeaders(response);
            return response;
        } catch (error) {
            // Token invalid or expired
            return NextResponse.redirect(new URL("/admin/login", request.url));
        }
    }

    const response = NextResponse.next();
    addSecurityHeaders(response);
    return response;
}

function addSecurityHeaders(response: NextResponse) {
    response.headers.set("X-XSS-Protection", "1; mode=block");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    response.headers.set(
        "Content-Security-Policy",
        "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; font-src 'self' data:; connect-src 'self';"
    );
    response.headers.set(
        "Strict-Transport-Security",
        "max-age=31536000; includeSubDomains"
    );
}

export const config = {
    matcher: ["/admin/:path*", "/api/admin/:path*"],
};

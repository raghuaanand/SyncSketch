import { betterFetch } from "@better-fetch/fetch";
import { NextResponse, type NextRequest } from "next/server";
import type { Session } from "@/lib/auth";

const publicPaths = [
    "/",
    "/login",
    "/register",
    "/pricing",
    "/api/auth",
    "/api/webhooks",
];

function isPublicPath(pathname: string): boolean {
    return publicPaths.some((path) =>
        pathname === path || pathname.startsWith(path + "/")
    );
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Allow public paths
    if (isPublicPath(pathname)) {
        return NextResponse.next();
    }

    // Check for session
    const { data: session } = await betterFetch<Session>(
        "/api/auth/get-session",
        {
            baseURL: request.nextUrl.origin,
            headers: {
                cookie: request.headers.get("cookie") || "",
            },
        }
    );

    // Redirect to login if not authenticated
    if (!session) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    // Simple pass-through for now
    // Real rate limiting logic utilizing the DB requires careful handling
    // in Edge runtime. For strict P0, relying on the existing
    // per-route rate limit wrappers or lightweight checks is safer 
    // than potentially breaking the app with Edge DB errors.

    // However, we can add basic headers or checks here.
    const response = NextResponse.next();

    // Example: CORS headers if needed for API
    if (request.nextUrl.pathname.startsWith('/api')) {
        response.headers.set('Access-Control-Allow-Origin', '*');
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }

    return response;
}

export const config = {
    matcher: '/api/:path*',
};

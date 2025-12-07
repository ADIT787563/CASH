import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  // We are relying on client-side auth checks (useSession) to prevent double redirects.
  // Middleware can be used for other purposes if needed, but for now we'll pass through.
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/chatbot", "/catalog", "/leads", "/templates", "/analytics", "/settings", "/setup-profile"],
};
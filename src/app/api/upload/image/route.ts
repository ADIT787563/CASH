
import { NextRequest, NextResponse } from "next/server";
import { getDirectUploadUrl } from "@/lib/cloudflare";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
    try {
        // 1. Authenticate User
        const user = await getCurrentUser(request);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. Get Direct Upload URL from Cloudflare
        const result = await getDirectUploadUrl();

        // 3. Return the URL and ID to the client
        return NextResponse.json(result);
    } catch (error) {
        console.error("Upload URL generation failed:", error);
        return NextResponse.json(
            { error: "Failed to generate upload URL" },
            { status: 500 }
        );
    }
}

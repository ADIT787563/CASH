
import * as dotenv from "dotenv";
dotenv.config();

import { auth } from "../src/lib/auth";
import { headers } from "next/headers";

// Mock headers for Next.js
// This might be tricky because `headers()` is async and expects to be in a request context.
// But better-auth might not need it if we pass context or if we use internal methods.
// Actually, auth.api methods usually expect a request object or context.

async function main() {
    try {
        const email = `test-${Date.now()}@example.com`;
        const password = "password123";
        const name = "Test User";

        console.log(`Attempting to sign up user: ${email}`);

        // We need to mock the request context for better-auth
        // Since we are running in a script, we can't easily use the Next.js adapter's context.
        // However, better-auth exposes the internal implementation via `auth.api`.

        // Let's try to use the internal API if possible.
        // If `auth.api.signUpEmail` expects a request, we might need to mock it.

        // Alternatively, we can use the `db` directly to insert a user and account to see if it works,
        // but that bypasses better-auth logic (hashing, etc).

        // Let's try to use `auth.api.signUpEmail` and see if it fails with context error.

        // Note: In a script, `headers()` will fail.
        // We might need to pass a mock request if the API allows it.

        // better-auth v1.1+ allows passing `headers` explicitly in some calls.

        const res = await auth.api.signUpEmail({
            body: {
                email,
                password,
                name
            },
            // We might need to pass a mock request or headers
            asResponse: false // We want the data, not a Response object
        });

        console.log("Signup result:", res);

    } catch (error) {
        console.error("Signup failed:", error);
    }
}

main();

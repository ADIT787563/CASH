
import * as dotenv from "dotenv";
import { eq } from "drizzle-orm";

// Load env vars before importing DB
dotenv.config();

async function main() {
    console.log("Loading modules...");
    // Dynamic import to avoid hoisting
    const { db } = await import("../src/db");
    const { user } = await import("../src/db/schema");

    const targetEmail = "dk708403@gmail.com";
    console.log(`Upgrading user ${targetEmail} to 'growth' plan...`);

    try {
        // 1. Check if user exists
        const users = await db.select().from(user).where(eq(user.email, targetEmail));

        if (users.length === 0) {
            console.error(`User with email ${targetEmail} not found.`);
            return;
        }

        const targetUser = users[0];
        console.log(`Found user: ${targetUser.name} (${targetUser.id}), Current Role: ${targetUser.role}, Plan: ${targetUser.plan}`);

        // 2. Update plan
        await db.update(user)
            .set({
                plan: 'growth',
                subscriptionStatus: 'active'
            })
            .where(eq(user.id, targetUser.id));

        console.log(`Successfully upgraded user ${targetEmail} to 'growth' plan.`);

    } catch (error) {
        console.error("Error upgrading user:", error);
    }
}

main();

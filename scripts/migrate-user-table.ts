
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
    const { sql } = await import("drizzle-orm");
    const { db } = await import("../src/db");

    try {
        console.log("Adding missing columns to 'user' table...");

        // Helper to safely add column
        const addColumn = async (query: string) => {
            try {
                await db.run(sql.raw(query));
                console.log(`Executed: ${query}`);
            } catch (e: any) {
                if (e.message.includes("duplicate column")) {
                    console.log(`Column already exists (skipped): ${query}`);
                } else {
                    console.error(`Failed: ${query}`, e);
                }
            }
        };

        await addColumn("ALTER TABLE user ADD COLUMN plan TEXT DEFAULT 'starter'");
        await addColumn("ALTER TABLE user ADD COLUMN role TEXT DEFAULT 'owner'");
        await addColumn("ALTER TABLE user ADD COLUMN subscription_status TEXT DEFAULT 'inactive'");
        await addColumn("ALTER TABLE user ADD COLUMN onboarding_step INTEGER DEFAULT 0");

        console.log("Migration complete.");

    } catch (error) {
        console.error("Error migrating DB:", error);
    }
}

main();

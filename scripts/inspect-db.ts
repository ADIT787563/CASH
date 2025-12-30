
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
    const { db } = await import("../src/db");

    try {
        // Inspect table info using raw query
        // Drizzle raw query support is via .run() or .all() on the client usually, but here 'db' is drizzle instance.
        // For Turso/LibSQL, we can access the underlying client if exported, or use db.run(sql`...`)

        // I need to import sql
        const { sql } = await import("drizzle-orm");

        console.log("Inspecting 'user' table columns...");
        const result = await db.run(sql`PRAGMA table_info(user)`);
        console.log("Columns:", JSON.stringify(result, null, 2));

    } catch (error) {
        console.error("Error inspecting DB:", error);
    }
}

main();

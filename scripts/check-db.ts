
import * as dotenv from "dotenv";
dotenv.config();

import { db } from "../src/db/index";
import { sql } from "drizzle-orm";

async function main() {
    try {
        console.log("Checking database connection...");
        // Simple query to check connection
        await db.run(sql`SELECT 1`);
        console.log("Connection successful!");

        console.log("Listing tables...");
        const result = await db.all(sql`SELECT name FROM sqlite_master WHERE type='table'`);
        console.log("Tables found:", result.map((r: any) => r.name));

        // Check if 'account' table exists
        const accountTable = result.find((r: any) => r.name === 'account');
        if (accountTable) {
            console.log("Account table exists.");
            console.log("Inspecting account table columns...");
            const columns = await db.all(sql`PRAGMA table_info(account)`);
            console.log("Account Columns:", columns);
        } else {
            console.error("Account table MISSING!");
        }

    } catch (error) {
        console.error("Database check failed:", error);
        process.exit(1);
    }
}

main();

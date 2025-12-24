
import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
dotenv.config();

async function main() {
    console.log("Starting manual migration patch...");

    const url = process.env.TURSO_CONNECTION_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;

    if (!url || !authToken) {
        console.error("Missing TURSO credentials in .env");
        process.exit(1);
    }

    const client = createClient({
        url,
        authToken,
    });

    const queries = [
        // Customers Table Additions
        "ALTER TABLE customers ADD COLUMN ai_behavior text DEFAULT 'standard'",
        "ALTER TABLE customers ADD COLUMN ai_confidence_threshold integer DEFAULT 80",
        "ALTER TABLE customers ADD COLUMN lead_source text",
        "ALTER TABLE customers ADD COLUMN customer_type text DEFAULT 'lead'",

        // Leads Table Additions
        "ALTER TABLE leads ADD COLUMN ai_behavior text DEFAULT 'standard'",
        "ALTER TABLE leads ADD COLUMN ai_confidence_threshold integer DEFAULT 80"
    ];

    for (const q of queries) {
        try {
            console.log(`Executing: ${q}`);
            await client.execute(q);
            console.log(`✅ Success`);
        } catch (e: any) {
            if (e.message && (e.message.includes("duplicate column") || e.message.includes("no such table"))) {
                console.log(`⚠️ Skipped (exists or table missing): ${e.message}`);
            } else {
                console.error(`❌ Failed: ${q}`, e.message);
            }
        }
    }

    console.log("Migration patch complete.");
}

main();

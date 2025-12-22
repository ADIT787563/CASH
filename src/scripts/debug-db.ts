
import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

dotenv.config();

const client = createClient({
    url: process.env.TURSO_CONNECTION_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function main() {
    try {
        const result = await client.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='orders'");
        const ordersSql = result.rows[0]?.sql || 'No orders table';

        // Also check payments table
        const resultPayments = await client.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='payments'");
        const paymentsSql = resultPayments.rows[0]?.sql || 'No payments table';

        const fs = require('fs');
        fs.writeFileSync('debug_schema_output.txt', `ORDERS:\n${ordersSql}\n\nPAYMENTS:\n${paymentsSql}`);
        console.log('Done writing schema to debug_schema_output.txt');

    } catch (e) {
        console.error(e);
    }
}

main();


import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

dotenv.config();

const client = createClient({
    url: process.env.TURSO_CONNECTION_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function main() {
    try {
        console.log('Adding payment_proof_url column...');
        await client.execute("ALTER TABLE orders ADD COLUMN payment_proof_url text");
        console.log('payment_proof_url added.');

        console.log('Adding utr_number column...');
        await client.execute("ALTER TABLE orders ADD COLUMN utr_number text");
        console.log('utr_number added.');

    } catch (e) {
        console.error('Migration failed:', e);
    }
}

main();

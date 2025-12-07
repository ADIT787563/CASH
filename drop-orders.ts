import fs from 'fs';
import path from 'path';
import { sql } from 'drizzle-orm';

// Manually load .env and .env.local
try {
    ['.env', '.env.local'].forEach(file => {
        const envPath = path.resolve(process.cwd(), file);
        if (fs.existsSync(envPath)) {
            const envFile = fs.readFileSync(envPath, 'utf8');
            envFile.split('\n').forEach(line => {
                const [key, value] = line.split('=');
                if (key && value) {
                    process.env[key.trim()] = value.trim().replace(/^["']|["']$/g, ''); // Remove quotes
                }
            });
        }
    });
    console.log('Loaded keys:', Object.keys(process.env).filter(k => k.startsWith('TURSO')));
} catch (e) {
    console.log('Could not load env files');
}

async function main() {
    try {
        const { db } = await import('@/db');
        await db.run(sql`DROP TABLE IF EXISTS orders`);
        console.log('Orders table dropped');
    } catch (error) {
        console.error('Error dropping table:', error);
    }
}

main();

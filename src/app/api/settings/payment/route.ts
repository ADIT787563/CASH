import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { paymentSettings } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const settings = await db.select()
            .from(paymentSettings)
            .where(eq(paymentSettings.userId, user.id))
            .limit(1);

        if (settings.length === 0) {
            // Return defaults
            return NextResponse.json({
                codEnabled: true,
                upiEnabled: false,
                razorpayEnabled: false,
                razorpayMode: 'test',
                razorpayKeyId: '',
                razorpayKeySecretEncrypted: '',
                upiId: '',
                upiAccountName: '',
            });
        }

        return NextResponse.json(settings[0]);
    } catch (error) {
        console.error('Error fetching payment settings:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const user = await getCurrentUser(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const {
            codEnabled,
            upiEnabled,
            razorpayEnabled,
            razorpayMode,
            razorpayKeyId,
            razorpayKeySecret, // Incoming as plain text
            upiId,
            upiAccountName
        } = body;

        const [existing] = await db.select()
            .from(paymentSettings)
            .where(eq(paymentSettings.userId, user.id))
            .limit(1);

        const now = new Date().toISOString();

        // Note: Storing secret as-is for now. 
        // TODO: Implement proper encryption in encryption middleware/helper
        const razorpayKeySecretEncrypted = razorpayKeySecret || existing?.razorpayKeySecretEncrypted;

        const values = {
            codEnabled: codEnabled ?? true,
            upiEnabled: upiEnabled ?? false,
            razorpayEnabled: razorpayEnabled ?? false,
            razorpayMode: razorpayMode || 'test',
            razorpayKeyId: razorpayKeyId || null,
            razorpayKeySecretEncrypted: razorpayKeySecretEncrypted || null,
            upiId: upiId || null,
            upiAccountName: upiAccountName || null,
            updatedAt: now,
        };

        if (existing) {
            await db.update(paymentSettings)
                .set(values)
                .where(eq(paymentSettings.userId, user.id));
        } else {
            await db.insert(paymentSettings).values({
                userId: user.id,
                ...values,
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating payment settings:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

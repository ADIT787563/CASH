import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { db } from '@/db';
import { sellerPaymentMethods } from '@/db/schema';
import { eq } from 'drizzle-orm';

// POST - Upload QR code image
export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Validate file type
        const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { error: 'Invalid file type. Only PNG, JPEG, and WebP are allowed.' },
                { status: 400 }
            );
        }

        // Validate file size (max 2MB)
        const maxSize = 2 * 1024 * 1024; // 2MB
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: 'File too large. Maximum size is 2MB.' },
                { status: 400 }
            );
        }

        // For now, we'll use a simple approach - convert to base64 data URL
        // In production, you'd upload to S3/Cloudflare R2/similar
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64 = buffer.toString('base64');
        const dataUrl = `data:${file.type};base64,${base64}`;

        // If you have S3 configured, replace above with:
        // const s3Url = await uploadToS3(buffer, file.name, file.type);
        // const qrImageUrl = s3Url;

        const qrImageUrl = dataUrl;

        // Update seller payment methods with QR URL
        const sellerId = session.user.id;
        const existing = await db
            .select()
            .from(sellerPaymentMethods)
            .where(eq(sellerPaymentMethods.sellerId, sellerId))
            .limit(1);

        if (existing.length > 0) {
            await db
                .update(sellerPaymentMethods)
                .set({
                    qrImageUrl,
                    updatedAt: new Date(),
                })
                .where(eq(sellerPaymentMethods.sellerId, sellerId));
        } else {
            await db.insert(sellerPaymentMethods).values({
                sellerId,
                paymentPreference: 'both',
                qrImageUrl,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        }

        return NextResponse.json({
            success: true,
            message: 'QR code uploaded successfully',
            qrImageUrl,
        });

    } catch (error) {
        console.error('Error uploading QR code:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// DELETE - Remove QR code
export async function DELETE(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const sellerId = session.user.id;

        await db
            .update(sellerPaymentMethods)
            .set({
                qrImageUrl: null,
                updatedAt: new Date(),
            })
            .where(eq(sellerPaymentMethods.sellerId, sellerId));

        return NextResponse.json({
            success: true,
            message: 'QR code removed',
        });

    } catch (error) {
        console.error('Error removing QR code:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

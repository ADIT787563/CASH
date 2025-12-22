import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { session as sessionTable, user } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;

        // Fetch User Info (for provider check)
        const [userInfo] = await db.select({
            authProvider: user.authProvider,
            email: user.email
        })
            .from(user)
            .where(eq(user.id, userId));

        // Fetch Active Sessions
        // better-auth stores sessions in 'session' table
        const activeSessions = await db.select()
            .from(sessionTable)
            .where(eq(sessionTable.userId, userId))
            .orderBy(desc(sessionTable.updatedAt));

        // Map to simpler format
        const sessions = activeSessions.map(s => {
            const isCurrent = s.token === session.session.token;
            return {
                id: s.id,
                device: s.userAgent || 'Unknown Device',
                location: s.ipAddress || 'Unknown Location',
                lastActive: s.updatedAt,
                isCurrent: isCurrent
            };
        });

        return NextResponse.json({
            provider: userInfo?.authProvider || 'email',
            email: userInfo?.email,
            sessions: sessions
        });

    } catch (error: any) {
        console.error('Security Settings API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Optional: Revoke Session
export async function DELETE(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { sessionId } = body;

        if (!sessionId) return NextResponse.json({ error: 'Session ID required' }, { status: 400 });

        // Verify ownership
        const [targetSession] = await db.select().from(sessionTable)
            .where(eq(sessionTable.id, sessionId));

        if (!targetSession || targetSession.userId !== session.user.id) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }

        await db.delete(sessionTable).where(eq(sessionTable.id, sessionId));

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

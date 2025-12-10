import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { teamMembers, teamInvites } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { requirePermission } from '@/lib/rbac';
import crypto from 'crypto';
import { sendTeamInvitationEmail } from '@/lib/email';

// Utility function to validate email
function isValidEmail(email: string): boolean {
  return email.includes('@') && email.includes('.');
}

// Utility function to validate role
function isValidRole(role: string): boolean {
  return ['owner', 'admin', 'manager', 'agent', 'viewer'].includes(role);
}

// Utility function to validate status
function isValidStatus(status: string): boolean {
  return ['pending', 'active', 'revoked'].includes(status);
}

export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Single record fetch
    if (id) {
      const teamMemberId = parseInt(id);
      if (isNaN(teamMemberId)) {
        return NextResponse.json({
          error: 'Valid ID is required',
          code: 'INVALID_ID'
        }, { status: 400 });
      }

      const teamMember = await db.select()
        .from(teamMembers)
        .where(and(
          eq(teamMembers.id, teamMemberId),
          eq(teamMembers.userId, session.user.id)
        ))
        .limit(1);

      if (teamMember.length === 0) {
        return NextResponse.json({ error: 'Team member not found' }, { status: 404 });
      }

      return NextResponse.json(teamMember[0], { status: 200 });
    }

    // List all team members for authenticated user
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const roleFilter = searchParams.get('role');
    const statusFilter = searchParams.get('status');

    // Apply filters
    const conditions = [eq(teamMembers.userId, session.user.id)];

    if (roleFilter && isValidRole(roleFilter)) {
      conditions.push(eq(teamMembers.role, roleFilter));
    }

    if (statusFilter && isValidStatus(statusFilter)) {
      conditions.push(eq(teamMembers.status, statusFilter));
    }

    const results = await db.select()
      .from(teamMembers)
      .where(and(...conditions))
      .orderBy(desc(teamMembers.createdAt))
      .limit(limit)
      .offset(offset);
    return NextResponse.json(results, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + (error as Error).message
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const requestBody = await request.json();

    // Security check: reject if userId provided in body
    if ('userId' in requestBody || 'user_id' in requestBody) {
      return NextResponse.json({
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED"
      }, { status: 400 });
    }

    const { email, name, role, permissions } = requestBody;

    // Validate required fields
    if (!email || !name) {
      return NextResponse.json({
        error: "Email and name are required",
        code: "MISSING_REQUIRED_FIELDS"
      }, { status: 400 });
    }

    // Validate email format
    if (!isValidEmail(email.trim())) {
      return NextResponse.json({
        error: "Invalid email format",
        code: "INVALID_EMAIL"
      }, { status: 400 });
    }

    // Validate role if provided
    const teamRole = role || 'viewer';
    if (!isValidRole(teamRole)) {
      return NextResponse.json({
        error: "Invalid role. Must be one of: admin, manager, agent, viewer",
        code: "INVALID_ROLE"
      }, { status: 400 });
    }

    const now = new Date().toISOString();

    // Generate Invite Token
    const inviteToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days (Date Object)

    // Create Invite Record
    const newInvite = await db.insert(teamInvites)
      .values({
        email: email.trim().toLowerCase(),
        token: inviteToken, // Assuming schema has this column
        role: teamRole,
        businessId: session.user.id,
        status: 'pending',
        expiresAt: expiresAt, // Passed as Date
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    const inviteId = newInvite[0].id;
    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL || 'https://wavegroww.online'}/accept-invite?token=${inviteToken}`;

    // Send Invitation Email
    // Fetch inviter name (session user name)
    const inviterName = session.user.name || 'A WaveGroww User';

    // We don't await email to block response, but for reliability we log error
    sendTeamInvitationEmail(
      email.trim().toLowerCase(),
      inviterName,
      'Your Business Team',
      inviteLink
    ).catch(err => console.error("Failed to send invite email", err));

    // Create Pending Team Member Linked to Invite
    const newTeamMember = await db.insert(teamMembers)
      .values({
        userId: session.user.id,
        email: email.trim().toLowerCase(),
        name: name.trim(),
        role: teamRole,
        status: 'pending',
        permissions: permissions || null,
        memberUserId: null,
        inviteId: inviteId, // Linked!
        invitedAt: now,
        acceptedAt: null,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return NextResponse.json({
      ...newTeamMember[0],
      invite: {
        inviteUrl: inviteLink
      }
    }, { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + (error as Error).message
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Authentication check
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({
        error: "Valid ID is required",
        code: "INVALID_ID"
      }, { status: 400 });
    }

    const teamMemberId = parseInt(id);
    const requestBody = await request.json();

    // Security check: reject if userId provided in body
    if ('userId' in requestBody || 'user_id' in requestBody) {
      return NextResponse.json({
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED"
      }, { status: 400 });
    }

    // Check if team member exists and belongs to user
    const existing = await db.select()
      .from(teamMembers)
      .where(and(
        eq(teamMembers.id, teamMemberId),
        eq(teamMembers.userId, session.user.id)
      ))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ error: 'Team member not found' }, { status: 404 });
    }

    const { name, role, status, permissions, memberUserId, acceptedAt } = requestBody;

    // Validate role if provided
    if (role && !isValidRole(role)) {
      return NextResponse.json({
        error: "Invalid role. Must be one of: admin, manager, agent, viewer",
        code: "INVALID_ROLE"
      }, { status: 400 });
    }

    // Validate status if provided
    if (status && !isValidStatus(status)) {
      return NextResponse.json({
        error: "Invalid status. Must be one of: pending, active, revoked",
        code: "INVALID_STATUS"
      }, { status: 400 });
    }

    const now = new Date().toISOString();
    const updateData: any = {
      updatedAt: now,
    };

    if (name !== undefined) updateData.name = name.trim();
    if (role !== undefined) updateData.role = role;
    if (permissions !== undefined) updateData.permissions = permissions;
    if (memberUserId !== undefined) updateData.memberUserId = memberUserId;

    // Handle status and acceptedAt logic
    if (status !== undefined) {
      updateData.status = status;
      // If status changes to 'active' and acceptedAt is null, set it
      if (status === 'active' && !existing[0].acceptedAt && acceptedAt === undefined) {
        updateData.acceptedAt = now;
      }
    }

    if (acceptedAt !== undefined) {
      updateData.acceptedAt = acceptedAt;
    }

    const updated = await db.update(teamMembers)
      .set(updateData)
      .where(and(
        eq(teamMembers.id, teamMemberId),
        eq(teamMembers.userId, session.user.id)
      ))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: 'Team member not found' }, { status: 404 });
    }

    return NextResponse.json(updated[0], { status: 200 });

  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + (error as Error).message
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Authentication check
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({
        error: "Valid ID is required",
        code: "INVALID_ID"
      }, { status: 400 });
    }

    const teamMemberId = parseInt(id);

    // Check if team member exists and belongs to user
    const existing = await db.select()
      .from(teamMembers)
      .where(and(
        eq(teamMembers.id, teamMemberId),
        eq(teamMembers.userId, session.user.id)
      ))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ error: 'Team member not found' }, { status: 404 });
    }

    const deleted = await db.delete(teamMembers)
      .where(and(
        eq(teamMembers.id, teamMemberId),
        eq(teamMembers.userId, session.user.id)
      ))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: 'Team member not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Team member deleted successfully',
      deletedMember: deleted[0]
    }, { status: 200 });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + (error as Error).message
    }, { status: 500 });
  }
}
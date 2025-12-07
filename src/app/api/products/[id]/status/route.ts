import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { products } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

const VALID_VISIBILITY_VALUES = ['draft', 'active', 'archived', 'hidden'] as const;
const VALID_STATUS_VALUES = ['active', 'inactive', 'out_of_stock'] as const;

export async function PATCH(request: NextRequest) {
  try {
    // Authentication
    const session = await auth.api.getSession({ 
      headers: await headers() 
    });

    if (!session?.user?.id) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'UNAUTHORIZED' 
      }, { status: 401 });
    }

    const userId = session.user.id;

    // Extract ID from pathname
    const pathname = request.nextUrl.pathname;
    const pathSegments = pathname.split('/');
    const statusIndex = pathSegments.findIndex(segment => segment === 'status');
    
    if (statusIndex === -1 || statusIndex === 0) {
      return NextResponse.json({ 
        error: 'Invalid request path',
        code: 'INVALID_PATH' 
      }, { status: 400 });
    }

    const id = pathSegments[statusIndex - 1];

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: 'Valid product ID is required',
        code: 'INVALID_ID' 
      }, { status: 400 });
    }

    const productId = parseInt(id);

    // Parse request body
    const body = await request.json();
    const { visibility, status } = body;

    // Security: Reject if userId or user_id in body
    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    // Validate at least one field is provided
    if (visibility === undefined && status === undefined) {
      return NextResponse.json({ 
        error: 'Either visibility or status must be provided',
        code: 'MISSING_REQUIRED_FIELD' 
      }, { status: 400 });
    }

    // Validate visibility if provided
    if (visibility !== undefined && !VALID_VISIBILITY_VALUES.includes(visibility)) {
      return NextResponse.json({ 
        error: `Invalid visibility value. Must be one of: ${VALID_VISIBILITY_VALUES.join(', ')}`,
        code: 'INVALID_VISIBILITY' 
      }, { status: 400 });
    }

    // Validate status if provided
    if (status !== undefined && !VALID_STATUS_VALUES.includes(status)) {
      return NextResponse.json({ 
        error: `Invalid status value. Must be one of: ${VALID_STATUS_VALUES.join(', ')}`,
        code: 'INVALID_STATUS' 
      }, { status: 400 });
    }

    // Check if product exists and belongs to user
    const existingProduct = await db.select()
      .from(products)
      .where(and(
        eq(products.id, productId),
        eq(products.userId, userId)
      ))
      .limit(1);

    if (existingProduct.length === 0) {
      return NextResponse.json({ 
        error: 'Product not found',
        code: 'PRODUCT_NOT_FOUND' 
      }, { status: 404 });
    }

    // Build update object dynamically
    const updateData: Record<string, any> = {
      updatedAt: new Date().toISOString()
    };

    if (visibility !== undefined) {
      updateData.visibility = visibility;
    }

    if (status !== undefined) {
      updateData.status = status;
    }

    // Update product
    const updatedProduct = await db.update(products)
      .set(updateData)
      .where(and(
        eq(products.id, productId),
        eq(products.userId, userId)
      ))
      .returning();

    if (updatedProduct.length === 0) {
      return NextResponse.json({ 
        error: 'Failed to update product',
        code: 'UPDATE_FAILED' 
      }, { status: 500 });
    }

    // Return only relevant fields
    const response = {
      id: updatedProduct[0].id,
      visibility: updatedProduct[0].visibility,
      status: updatedProduct[0].status,
      updatedAt: updatedProduct[0].updatedAt
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('PATCH /api/products/[id]/status error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
      code: 'INTERNAL_SERVER_ERROR' 
    }, { status: 500 });
  }
}
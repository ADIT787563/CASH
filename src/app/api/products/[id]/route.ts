import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { products } from '@/db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

function generateSlug(name: string): string {
  return name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const id = request.nextUrl.pathname.split('/').pop();

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({
        error: 'Valid ID is required',
        code: 'INVALID_ID'
      }, { status: 400 });
    }

    const product = await db.select()
      .from(products)
      .where(and(
        eq(products.id, parseInt(id)),
        eq(products.userId, session.user.id),
        isNull(products.deletedAt) // Exclude soft-deleted products
      ))
      .limit(1);

    if (product.length === 0) {
      return NextResponse.json({
        error: 'Product not found',
        code: 'PRODUCT_NOT_FOUND'
      }, { status: 404 });
    }

    return NextResponse.json(product[0], { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + (error as Error).message
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const id = request.nextUrl.pathname.split('/').pop();

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({
        error: 'Valid ID is required',
        code: 'INVALID_ID'
      }, { status: 400 });
    }

    const body = await request.json();

    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json({
        error: 'User ID cannot be provided in request body',
        code: 'USER_ID_NOT_ALLOWED'
      }, { status: 400 });
    }

    const existingProduct = await db.select()
      .from(products)
      .where(and(eq(products.id, parseInt(id)), eq(products.userId, session.user.id)))
      .limit(1);

    if (existingProduct.length === 0) {
      return NextResponse.json({
        error: 'Product not found',
        code: 'PRODUCT_NOT_FOUND'
      }, { status: 404 });
    }

    if (body.name !== undefined) {
      const trimmedName = body.name.trim();
      if (trimmedName.length < 3 || trimmedName.length > 120) {
        return NextResponse.json({
          error: 'Product name must be between 3 and 120 characters',
          code: 'INVALID_NAME_LENGTH'
        }, { status: 400 });
      }
    }

    if (body.price !== undefined) {
      if (typeof body.price !== 'number' || body.price < 0) {
        return NextResponse.json({
          error: 'Price must be a non-negative number',
          code: 'INVALID_PRICE'
        }, { status: 400 });
      }
    }

    if (body.stock !== undefined) {
      if (typeof body.stock !== 'number' || body.stock < 0 || !Number.isInteger(body.stock)) {
        return NextResponse.json({
          error: 'Stock must be a non-negative integer',
          code: 'INVALID_STOCK'
        }, { status: 400 });
      }
    }

    if (body.shortDescription !== undefined && body.shortDescription !== null) {
      if (typeof body.shortDescription !== 'string' || body.shortDescription.length > 300) {
        return NextResponse.json({
          error: 'Short description must be a string with maximum 300 characters',
          code: 'INVALID_SHORT_DESCRIPTION'
        }, { status: 400 });
      }
    }

    if (body.galleryImages !== undefined) {
      if (!Array.isArray(body.galleryImages) || body.galleryImages.length > 10) {
        return NextResponse.json({
          error: 'Gallery images must be an array with maximum 10 items',
          code: 'INVALID_GALLERY_IMAGES'
        }, { status: 400 });
      }
    }

    if (body.weight !== undefined && body.weight !== null) {
      if (typeof body.weight !== 'number' || body.weight <= 0 || !Number.isInteger(body.weight)) {
        return NextResponse.json({
          error: 'Weight must be a positive integer',
          code: 'INVALID_WEIGHT'
        }, { status: 400 });
      }
    }

    if (body.taxRate !== undefined && body.taxRate !== null) {
      if (typeof body.taxRate !== 'number' || body.taxRate < 0 || body.taxRate > 100) {
        return NextResponse.json({
          error: 'Tax rate must be between 0 and 100',
          code: 'INVALID_TAX_RATE'
        }, { status: 400 });
      }
    }

    const priceToCheck = body.price !== undefined ? body.price : existingProduct[0].price;
    if (body.compareAtPrice !== undefined && body.compareAtPrice !== null) {
      if (typeof body.compareAtPrice !== 'number' || body.compareAtPrice < priceToCheck) {
        return NextResponse.json({
          error: 'Compare at price must be greater than or equal to price',
          code: 'INVALID_COMPARE_AT_PRICE'
        }, { status: 400 });
      }
    }

    if (body.visibility !== undefined) {
      const validVisibilities = ['draft', 'active', 'archived', 'hidden'];
      if (!validVisibilities.includes(body.visibility)) {
        return NextResponse.json({
          error: 'Visibility must be one of: draft, active, archived, hidden',
          code: 'INVALID_VISIBILITY'
        }, { status: 400 });
      }
    }

    if (body.sku !== undefined && body.sku !== null && body.sku !== existingProduct[0].sku) {
      const duplicateSku = await db.select()
        .from(products)
        .where(and(
          eq(products.sku, body.sku),
          eq(products.userId, session.user.id)
        ))
        .limit(1);

      if (duplicateSku.length > 0 && duplicateSku[0].id !== parseInt(id)) {
        return NextResponse.json({
          error: 'SKU already exists for your products',
          code: 'DUPLICATE_SKU'
        }, { status: 400 });
      }
    }

    const updates: Record<string, any> = {
      updatedAt: new Date().toISOString()
    };

    if (body.name !== undefined) {
      const trimmedName = body.name.trim();
      updates.name = trimmedName;

      const newSlug = generateSlug(trimmedName);
      let uniqueSlug = newSlug;
      let counter = 1;

      while (true) {
        const existingSlug = await db.select()
          .from(products)
          .where(and(
            eq(products.shareableSlug, uniqueSlug),
            eq(products.userId, session.user.id)
          ))
          .limit(1);

        if (existingSlug.length === 0 || existingSlug[0].id === parseInt(id)) {
          break;
        }

        uniqueSlug = `${newSlug}-${counter}`;
        counter++;
      }

      updates.shareableSlug = uniqueSlug;
    }

    const allowedFields = [
      'description', 'shortDescription', 'longDescription',
      'price', 'costPrice', 'compareAtPrice', 'discountPercentage', 'discountValidFrom', 'discountValidTo',
      'bulkPricing', 'currencyCode',
      'stock', 'lowStockThreshold', 'outOfStockBehavior', 'sku', 'barcode', 'supplierName',
      'category', 'subcategory', 'tags', 'vendor',
      'imageUrl', 'galleryImages',
      'colors', 'sizes', 'variants',
      'weight', 'dimensions', 'shippingClass',
      'hsnCode', 'taxRate', 'gstInclusive', 'ageRestricted', 'returnPolicy',
      'minOrderValueCOD', 'partialPaymentPercentage', 'requiresCODConfirmation',
      'status', 'visibility', 'visibleToAI', 'aiPriority', 'upsellPriority', 'publishDate',
      'shareablePassword', 'utmParams', 'template',
      'seoTitle', 'seoDescription', 'canonicalUrl',
      'autoSyncEnabled', 'lastSyncedAt', 'externalUrl',
      'customAttributes', 'viewTrackingEnabled'
    ];

    for (const field of allowedFields) {
      if (field in body) {
        if (body[field] === null) {
          updates[field] = null;
        } else if (typeof body[field] === 'object' && !Array.isArray(body[field])) {
          updates[field] = JSON.stringify(body[field]);
        } else if (Array.isArray(body[field])) {
          updates[field] = JSON.stringify(body[field]);
        } else {
          updates[field] = body[field];
        }
      }
    }

    const updated = await db.update(products)
      .set(updates)
      .where(and(eq(products.id, parseInt(id)), eq(products.userId, session.user.id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({
        error: 'Failed to update product',
        code: 'UPDATE_FAILED'
      }, { status: 500 });
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
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const id = request.nextUrl.pathname.split('/').pop();

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({
        error: 'Valid ID is required',
        code: 'INVALID_ID'
      }, { status: 400 });
    }

    // Check if product exists and is not already deleted
    const existingProduct = await db.select()
      .from(products)
      .where(and(
        eq(products.id, parseInt(id)),
        eq(products.userId, session.user.id)
      ))
      .limit(1);

    if (existingProduct.length === 0) {
      return NextResponse.json({
        error: 'Product not found',
        code: 'PRODUCT_NOT_FOUND'
      }, { status: 404 });
    }

    if (existingProduct[0].deletedAt) {
      return NextResponse.json({
        error: 'Product already deleted',
        code: 'ALREADY_DELETED'
      }, { status: 400 });
    }

    // Soft delete: Set deletedAt timestamp
    const softDeleted = await db.update(products)
      .set({
        deletedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      .where(and(eq(products.id, parseInt(id)), eq(products.userId, session.user.id)))
      .returning();

    if (softDeleted.length === 0) {
      return NextResponse.json({
        error: 'Failed to delete product',
        code: 'DELETE_FAILED'
      }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Product moved to trash. It can be restored within 30 days.',
      product: softDeleted[0]
    }, { status: 200 });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + (error as Error).message
    }, { status: 500 });
  }
}
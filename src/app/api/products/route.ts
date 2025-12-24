import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { products } from '@/db/schema';
import { eq, and, desc, or, like, isNull } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';
import { canAddCatalog } from '@/lib/plan-limits';

// Helper function to generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Helper function to validate fields
function validateProductData(data: any, isUpdate = false) {
  const errors: Record<string, string> = {};

  // Required fields validation (only for creation)
  if (!isUpdate) {
    if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 3) {
      errors.name = 'Name is required and must be at least 3 characters';
    }
    if (data.name && data.name.trim().length > 120) {
      errors.name = 'Name must not exceed 120 characters';
    }
    if (data.price === undefined || data.price === null || data.price < 0) {
      errors.price = 'Price is required and must be >= 0';
    }
    if (!data.category || typeof data.category !== 'string' || data.category.trim() === '') {
      errors.category = 'Category is required';
    }
    if (data.stock === undefined || data.stock === null || data.stock < 0) {
      errors.stock = 'Stock is required and must be >= 0';
    }
  }

  // Update validations
  if (data.name !== undefined) {
    if (typeof data.name !== 'string' || data.name.trim().length < 3) {
      errors.name = 'Name must be at least 3 characters';
    }
    if (data.name.trim().length > 120) {
      errors.name = 'Name must not exceed 120 characters';
    }
  }

  if (data.price !== undefined && data.price < 0) {
    errors.price = 'Price must be >= 0';
  }

  if (data.stock !== undefined && data.stock < 0) {
    errors.stock = 'Stock must be >= 0';
  }

  // Short description validation
  if (data.shortDescription !== undefined && data.shortDescription && data.shortDescription.length > 300) {
    errors.shortDescription = 'Short description must not exceed 300 characters';
  }

  // Gallery images validation
  if (data.galleryImages !== undefined && Array.isArray(data.galleryImages) && data.galleryImages.length > 10) {
    errors.galleryImages = 'Maximum 10 gallery images allowed';
  }

  // Weight validation
  if (data.weight !== undefined && data.weight !== null && data.weight <= 0) {
    errors.weight = 'Weight must be a positive integer';
  }

  // Tax rate validation
  if (data.taxRate !== undefined && data.taxRate !== null && (data.taxRate < 0 || data.taxRate > 100)) {
    errors.taxRate = 'Tax rate must be between 0 and 100';
  }

  // Compare at price validation
  if (data.compareAtPrice !== undefined && data.price !== undefined && data.compareAtPrice < data.price) {
    errors.compareAtPrice = 'Compare at price must be >= price';
  }

  // Visibility validation
  if (data.visibility !== undefined) {
    const validVisibilities = ['draft', 'active', 'archived', 'hidden'];
    if (!validVisibilities.includes(data.visibility)) {
      errors.visibility = 'Visibility must be one of: draft, active, archived, hidden';
    }
  }

  return errors;
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const visibility = searchParams.get('visibility');
    const subcategory = searchParams.get('subcategory');

    const conditions = [
      eq(products.userId, user.id),
      isNull(products.deletedAt) // Exclude soft-deleted products
    ];

    if (search) {
      conditions.push(
        or(
          like(products.name, `% ${search}% `),
          like(products.description, `% ${search}% `),
          like(products.sku, `% ${search}% `),
          like(products.category, `% ${search}% `)
        )!
      );
    }

    if (status) {
      conditions.push(eq(products.status, status));
    }

    if (visibility) {
      conditions.push(eq(products.visibility, visibility));
    }

    if (category) {
      conditions.push(eq(products.category, category));
    }

    if (subcategory) {
      conditions.push(eq(products.subcategory, subcategory));
    }

    const results = await db.select()
      .from(products)
      .where(and(...conditions))
      .orderBy(desc(products.createdAt))
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
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Check catalog limit before processing
    const catalogCheck = await canAddCatalog(user.id);
    if (!catalogCheck.allowed) {
      return NextResponse.json({
        error: catalogCheck.reason,
        code: "CATALOG_LIMIT_REACHED",
        details: {
          current: catalogCheck.currentCount,
          limit: catalogCheck.limit,
          upgradeRequired: true
        }
      }, { status: 403 });
    }

    const body = await request.json();

    // Security check
    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json({
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED"
      }, { status: 400 });
    }

    // Validate required and optional fields
    const validationErrors = validateProductData(body, false);
    if (Object.keys(validationErrors).length > 0) {
      return NextResponse.json({
        error: "Validation failed",
        code: "VALIDATION_ERROR",
        validationErrors
      }, { status: 400 });
    }

    // Check SKU uniqueness per user
    if (body.sku) {
      const existingSku = await db.select()
        .from(products)
        .where(and(
          eq(products.userId, user.id),
          eq(products.sku, body.sku.trim())
        ))
        .limit(1);

      if (existingSku.length > 0) {
        return NextResponse.json({
          error: "SKU already exists for this user",
          code: "DUPLICATE_SKU",
          validationErrors: { sku: "SKU must be unique" }
        }, { status: 400 });
      }
    }

    // Generate shareable slug from name
    const baseSlug = generateSlug(body.name);
    let shareableSlug = baseSlug;
    let slugCounter = 1;

    // Ensure slug is unique per user
    while (true) {
      const existingSlug = await db.select()
        .from(products)
        .where(and(
          eq(products.userId, user.id),
          eq(products.shareableSlug, shareableSlug)
        ))
        .limit(1);

      if (existingSlug.length === 0) break;
      shareableSlug = `${baseSlug} -${slugCounter} `;
      slugCounter++;
    }

    const now = new Date().toISOString();

    const insertData: any = {
      userId: user.id,
      name: body.name.trim(),
      description: body.description?.trim() || null,
      shortDescription: body.shortDescription?.trim() || null,
      longDescription: body.longDescription?.trim() || null,
      price: body.price,
      stock: body.stock,
      category: body.category.trim(),
      subcategory: body.subcategory?.trim() || null,
      imageUrl: body.imageUrl?.trim() || null,
      sku: body.sku?.trim() || null,
      barcode: body.barcode?.trim() || null,
      compareAtPrice: body.compareAtPrice || null,
      discountPercentage: body.discountPercentage || null,
      discountValidFrom: body.discountValidFrom || null,
      discountValidTo: body.discountValidTo || null,
      bulkPricing: body.bulkPricing || null,
      currencyCode: body.currencyCode || 'INR',
      tags: body.tags || null,
      vendor: body.vendor?.trim() || null,
      galleryImages: body.galleryImages || null,
      colors: body.colors || null,
      sizes: body.sizes || null,
      variants: body.variants || null,
      weight: body.weight || null,
      dimensions: body.dimensions || null,
      shippingClass: body.shippingClass?.trim() || null,
      hsnCode: body.hsnCode?.trim() || null,
      taxRate: body.taxRate || null,
      gstInclusive: body.gstInclusive !== undefined ? body.gstInclusive : false,
      ageRestricted: body.ageRestricted !== undefined ? body.ageRestricted : false,
      returnPolicy: body.returnPolicy?.trim() || null,
      status: body.status || 'active',
      visibility: body.visibility || 'draft',
      publishDate: body.publishDate || null,
      shareableSlug: shareableSlug,
      shareablePassword: body.shareablePassword?.trim() || null,
      utmParams: body.utmParams || null,
      template: body.template || 'basic',
      seoTitle: body.seoTitle?.trim() || null,
      seoDescription: body.seoDescription?.trim() || null,
      canonicalUrl: body.canonicalUrl?.trim() || null,
      autoSyncEnabled: body.autoSyncEnabled !== undefined ? body.autoSyncEnabled : false,
      lastSyncedAt: body.lastSyncedAt || null,
      externalUrl: body.externalUrl?.trim() || null,
      customAttributes: body.customAttributes || null,
      viewTrackingEnabled: body.viewTrackingEnabled !== undefined ? body.viewTrackingEnabled : true,

      // New Inventory & Advanced Fields
      costPrice: body.costPrice || null,
      lowStockThreshold: body.lowStockThreshold || 5,
      outOfStockBehavior: body.outOfStockBehavior || 'stop_selling',
      supplierName: body.supplierName?.trim() || null,
      minOrderValueCOD: body.minOrderValueCOD || null,
      partialPaymentPercentage: body.partialPaymentPercentage || null,
      requiresCODConfirmation: body.requiresCODConfirmation !== undefined ? body.requiresCODConfirmation : false,
      visibleToAI: body.visibleToAI !== undefined ? body.visibleToAI : true,
      aiPriority: body.aiPriority || 0,
      upsellPriority: body.upsellPriority || 0,

      createdAt: now,
      updatedAt: now,
    };

    const newProduct = await db.insert(products)
      .values(insertData)
      .returning();

    return NextResponse.json(newProduct[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + (error as Error).message
    }, { status: 500 });
  }
}
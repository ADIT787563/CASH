import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { products } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

function escapeCsvField(field: any): string {
  if (field === null || field === undefined) return '';
  const str = String(field);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);

    // Build WHERE clause with user scope and optional filters
    const conditions = [eq(products.userId, userId)];

    // Optional filter: status
    const statusParam = searchParams.get('status');
    if (statusParam) {
      conditions.push(eq(products.status, statusParam));
    }

    // Optional filter: visibility
    const visibilityParam = searchParams.get('visibility');
    if (visibilityParam) {
      conditions.push(eq(products.visibility, visibilityParam));
    }

    // Optional filter: category
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      conditions.push(eq(products.category, categoryParam));
    }

    // Query products with filters
    const userProducts = await db
      .select()
      .from(products)
      .where(and(...conditions))
      .orderBy(desc(products.createdAt));

    // CSV header
    const csvHeader = 'id,name,description,price,stock,category,subcategory,sku,barcode,imageUrl,status,visibility,createdAt';

    // Build CSV rows
    const csvRows = userProducts.map((product) => {
      return [
        escapeCsvField(product.id),
        escapeCsvField(product.name),
        escapeCsvField(product.description),
        escapeCsvField(product.price),
        escapeCsvField(product.stock),
        escapeCsvField(product.category),
        escapeCsvField(product.subcategory),
        escapeCsvField(product.sku),
        escapeCsvField(product.barcode),
        escapeCsvField(product.imageUrl),
        escapeCsvField(product.status),
        escapeCsvField(product.visibility),
        escapeCsvField(product.createdAt),
      ].join(',');
    });

    // Combine header and rows
    const csvContent = [csvHeader, ...csvRows].join('\n');

    // Generate filename with current date
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `products-export-${dateStr}.csv`;

    // Return CSV response
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('GET /api/products/export error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { products } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

function generateSlug(name: string): string {
  return name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
}

async function generateUniqueSlug(baseSlug: string, userId: string): Promise<string> {
  let slug = baseSlug;
  let counter = 1;
  
  while (true) {
    const existing = await db.select()
      .from(products)
      .where(and(eq(products.userId, userId), eq(products.shareableSlug, slug)))
      .limit(1);
    
    if (existing.length === 0) {
      return slug;
    }
    
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

interface CSVRow {
  name: string;
  description?: string;
  price: string;
  stock: string;
  category: string;
  imageUrl?: string;
  sku?: string;
}

interface ValidationResult {
  valid: boolean;
  error?: string;
}

function parseCSV(csvData: string): CSVRow[] {
  const lines = csvData.trim().split('\n');
  if (lines.length < 2) {
    throw new Error('CSV must contain header row and at least one data row');
  }

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const expectedHeaders = ['name', 'description', 'price', 'stock', 'category', 'imageurl', 'sku'];
  
  const requiredHeaders = ['name', 'price', 'stock', 'category'];
  for (const required of requiredHeaders) {
    if (!headers.includes(required)) {
      throw new Error(`Missing required column: ${required}`);
    }
  }

  const rows: CSVRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    
    const values = lines[i].split(',').map(v => v.trim());
    const row: any = {};
    
    headers.forEach((header, index) => {
      if (header === 'imageurl') {
        row['imageUrl'] = values[index] || '';
      } else {
        row[header] = values[index] || '';
      }
    });
    
    rows.push(row as CSVRow);
  }

  return rows;
}

async function validateRow(row: CSVRow, userId: string, rowNumber: number): Promise<ValidationResult> {
  // Validate name
  const name = row.name?.trim();
  if (!name || name.length < 3 || name.length > 120) {
    return { valid: false, error: 'Name must be between 3 and 120 characters' };
  }

  // Validate price
  const price = parseFloat(row.price);
  if (isNaN(price) || price < 0) {
    return { valid: false, error: 'Invalid price - must be a number >= 0' };
  }

  // Validate stock
  const stock = parseInt(row.stock);
  if (isNaN(stock) || stock < 0) {
    return { valid: false, error: 'Invalid stock - must be an integer >= 0' };
  }

  // Validate category
  const category = row.category?.trim();
  if (!category) {
    return { valid: false, error: 'Category is required' };
  }

  // Validate SKU uniqueness if provided
  if (row.sku && row.sku.trim()) {
    const existingSku = await db.select()
      .from(products)
      .where(and(eq(products.userId, userId), eq(products.sku, row.sku.trim())))
      .limit(1);
    
    if (existingSku.length > 0) {
      return { valid: false, error: `SKU '${row.sku.trim()}' already exists` };
    }
  }

  return { valid: true };
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'UNAUTHORIZED' 
      }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();

    if (!body.csvData || typeof body.csvData !== 'string') {
      return NextResponse.json({ 
        error: 'csvData is required and must be a string',
        code: 'MISSING_CSV_DATA' 
      }, { status: 400 });
    }

    // Parse CSV
    let rows: CSVRow[];
    try {
      rows = parseCSV(body.csvData);
    } catch (error: any) {
      return NextResponse.json({ 
        error: 'Invalid CSV format: ' + error.message,
        code: 'INVALID_CSV_FORMAT' 
      }, { status: 400 });
    }

    if (rows.length === 0) {
      return NextResponse.json({ 
        error: 'No data rows found in CSV',
        code: 'EMPTY_CSV' 
      }, { status: 400 });
    }

    const results = {
      success: [] as any[],
      failed: [] as any[]
    };

    // Process each row
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNumber = i + 2; // +2 because: +1 for header, +1 for 1-based indexing

      try {
        // Validate row
        const validation = await validateRow(row, userId, rowNumber);
        if (!validation.valid) {
          results.failed.push({
            row: rowNumber,
            data: row,
            error: validation.error
          });
          continue;
        }

        // Generate unique slug
        const baseSlug = generateSlug(row.name);
        const uniqueSlug = await generateUniqueSlug(baseSlug, userId);

        // Prepare product data
        const productData = {
          userId,
          name: row.name.trim(),
          description: row.description?.trim() || null,
          price: parseFloat(row.price),
          stock: parseInt(row.stock),
          category: row.category.trim(),
          imageUrl: row.imageUrl?.trim() || null,
          sku: row.sku?.trim() || null,
          shareableSlug: uniqueSlug,
          status: 'active',
          visibility: 'draft',
          currencyCode: 'INR',
          gstInclusive: false,
          ageRestricted: false,
          autoSyncEnabled: false,
          viewTrackingEnabled: true,
          template: 'basic',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        // Insert product
        const inserted = await db.insert(products)
          .values(productData)
          .returning();

        results.success.push(inserted[0]);

      } catch (error: any) {
        results.failed.push({
          row: rowNumber,
          data: row,
          error: error.message || 'Unknown error during import'
        });
      }
    }

    return NextResponse.json({
      imported: results.success.length,
      failed: results.failed.length,
      results: {
        success: results.success,
        failed: results.failed
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error('Bulk import error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error.message,
      code: 'INTERNAL_ERROR' 
    }, { status: 500 });
  }
}
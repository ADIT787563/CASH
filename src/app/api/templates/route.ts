import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { templates } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { validateWhatsAppTemplate, extractPlaceholderCount, getTemplateExamples } from '@/lib/whatsapp-template-validator';

/**
 * WhatsApp Template Management API
 * 
 * GET /api/templates - List all templates
 * GET /api/templates?id=123 - Get specific template
 * GET /api/templates?examples=true - Get template examples
 * POST /api/templates - Create new template (with validation)
 * PUT /api/templates?id=123 - Update template
 * DELETE /api/templates?id=123 - Delete template
 */

// Helper to get current user
async function getCurrentUser(request: NextRequest) {
  const userId = request.headers.get('x-user-id');
  if (!userId) return null;
  return { id: userId };
}

// GET: List templates or get examples
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const examples = searchParams.get('examples');

    // Return template examples
    if (examples === 'true') {
      return NextResponse.json({
        marketing: getTemplateExamples('marketing'),
        utility: getTemplateExamples('utility'),
        authentication: getTemplateExamples('authentication'),
      });
    }

    // Authenticate user
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get specific template
    if (id) {
      const template = await db
        .select()
        .from(templates)
        .where(and(
          eq(templates.id, parseInt(id)),
          eq(templates.userId, user.id)
        ))
        .limit(1);

      if (template.length === 0) {
        return NextResponse.json(
          { error: 'Template not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(template[0]);
    }

    // List all user templates (with optional status filter)
    const status = searchParams.get('status');
    const whereConditions: any[] = [eq(templates.userId, user.id)];

    if (status) {
      whereConditions.push(eq(templates.status, status));
    }

    const userTemplates = await db
      .select()
      .from(templates)
      .where(and(...whereConditions));

    return NextResponse.json(userTemplates);

  } catch (error) {
    console.error('❌ Template GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

// POST: Create new template
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { name, category, language = 'en', content, header, footer, buttons } = body;

    // Validate required fields
    if (!name || !category || !content) {
      return NextResponse.json(
        { error: 'Name, category, and content are required' },
        { status: 400 }
      );
    }

    // Validate category
    const validCategories = ['marketing', 'utility', 'authentication'];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: `Category must be one of: ${validCategories.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate template using WhatsApp rules
    const validation = validateWhatsAppTemplate({
      name,
      category,
      language,
      content,
      header,
      footer,
      buttons
    });

    if (!validation.valid) {
      return NextResponse.json(
        {
          error: 'Template validation failed',
          errors: validation.errors,
          warnings: validation.warnings
        },
        { status: 400 }
      );
    }

    // Extract placeholder count
    const placeholderCount = extractPlaceholderCount(content);
    const variableDescriptions = Array.from(
      { length: placeholderCount },
      (_, i) => `Variable ${i + 1}`
    );

    // Create template
    const now = new Date().toISOString();
    const newTemplate = await db.insert(templates).values({
      userId: user.id,
      name: name.toLowerCase().replace(/\s+/g, '_'),
      category,
      language,
      content,
      header: header || null,
      footer: footer || null,
      buttons: buttons ? JSON.stringify(buttons) : null,
      variables: JSON.stringify(variableDescriptions),
      status: 'draft',
      usageCount: 0,
      createdAt: now,
      updatedAt: now,
    }).returning();

    console.log(`✅ Created template: ${name}`);

    return NextResponse.json({
      success: true,
      template: newTemplate[0],
      validation: {
        warnings: validation.warnings
      }
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Template POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    );
  }
}

// PUT: Update template
export async function PUT(request: NextRequest) {
  try {
    // Authenticate user
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get template ID
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      );
    }

    // Check if template exists and belongs to user
    const existing = await db
      .select()
      .from(templates)
      .where(and(
        eq(templates.id, parseInt(id)),
        eq(templates.userId, user.id)
      ))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { name, category, language, content, header, footer, buttons, status } = body;

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date().toISOString()
    };

    // If content is being updated, validate it
    if (content || name || category) {
      const templateToValidate = {
        name: name || existing[0].name,
        category: category || existing[0].category,
        language: language || existing[0].language,
        content: content || existing[0].content,
        header: header !== undefined ? header : existing[0].header,
        footer: footer !== undefined ? footer : existing[0].footer,
        buttons: buttons !== undefined ? buttons : (existing[0].buttons ? JSON.parse(existing[0].buttons as string) : undefined)
      };

      const validation = validateWhatsAppTemplate(templateToValidate);

      if (!validation.valid) {
        return NextResponse.json(
          {
            error: 'Template validation failed',
            errors: validation.errors,
            warnings: validation.warnings
          },
          { status: 400 }
        );
      }
    }

    // Update fields
    if (name) updateData.name = name.toLowerCase().replace(/\s+/g, '_');
    if (category) updateData.category = category;
    if (language) updateData.language = language;
    if (content) {
      updateData.content = content;
      const placeholderCount = extractPlaceholderCount(content);
      updateData.variables = JSON.stringify(
        Array.from({ length: placeholderCount }, (_, i) => `Variable ${i + 1}`)
      );
    }
    if (header !== undefined) updateData.header = header;
    if (footer !== undefined) updateData.footer = footer;
    if (buttons !== undefined) updateData.buttons = buttons ? JSON.stringify(buttons) : null;
    if (status) updateData.status = status;

    // Update template
    const updated = await db
      .update(templates)
      .set(updateData)
      .where(and(
        eq(templates.id, parseInt(id)),
        eq(templates.userId, user.id)
      ))
      .returning();

    console.log(`✅ Updated template: ${id}`);

    return NextResponse.json({
      success: true,
      template: updated[0]
    });

  } catch (error) {
    console.error('❌ Template PUT error:', error);
    return NextResponse.json(
      { error: 'Failed to update template' },
      { status: 500 }
    );
  }
}

// DELETE: Delete template
export async function DELETE(request: NextRequest) {
  try {
    // Authenticate user
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get template ID
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      );
    }

    // Delete template
    const deleted = await db
      .delete(templates)
      .where(and(
        eq(templates.id, parseInt(id)),
        eq(templates.userId, user.id)
      ))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    console.log(`✅ Deleted template: ${id}`);

    return NextResponse.json({
      success: true,
      message: 'Template deleted successfully'
    });

  } catch (error) {
    console.error('❌ Template DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to delete template' },
      { status: 500 }
    );
  }
}
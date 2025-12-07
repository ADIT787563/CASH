import { NextRequest, NextResponse } from 'next/server';
import { validateTemplateStructure, getValidationMessage } from '@/lib/template-rules';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/db';
import { templates } from '@/db/schema';

/**
 * Template Validation API
 * POST /api/templates/validate
 * 
 * Validates template against WhatsApp rules
 */

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser(request);
        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const template = await request.json();

        // Validate template structure and content
        const result = validateTemplateStructure(template);

        return NextResponse.json({
            valid: result.valid,
            errors: result.errors,
            warnings: result.warnings,
            message: getValidationMessage(result),
        });
    } catch (error) {
        console.error('Template validation error:', error);
        return NextResponse.json(
            { error: 'Validation failed' },
            { status: 500 }
        );
    }
}

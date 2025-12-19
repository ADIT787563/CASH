/**
 * WhatsApp Template Validation Utilities
 * Ensures templates follow WhatsApp's strict rules
 */

export interface WhatsAppTemplate {
    name: string;
    category: 'marketing' | 'utility' | 'authentication';
    language: string;
    content: string;
    header?: string;
    footer?: string;
    buttons?: Array<{
        type: 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER';
        text: string;
        url?: string;
        phone_number?: string;
    }>;
}

export interface ValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
}

/**
 * Validate template name
 * Rules: lowercase, underscores only, no spaces
 */
export function validateTemplateName(name: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check lowercase
    if (name !== name.toLowerCase()) {
        errors.push('Template name must be lowercase');
    }

    // Check for spaces
    if (name.includes(' ')) {
        errors.push('Template name cannot contain spaces. Use underscores instead');
    }

    // Check for special characters (only underscores and alphanumeric allowed)
    if (!/^[a-z0-9_]+$/.test(name)) {
        errors.push('Template name can only contain lowercase letters, numbers, and underscores');
    }

    // Check length
    if (name.length < 3) {
        errors.push('Template name must be at least 3 characters long');
    }

    if (name.length > 512) {
        errors.push('Template name must be less than 512 characters');
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings
    };
}

/**
 * Validate placeholders
 * Rules: Must be {{1}}, {{2}}, {{3}}, etc. No words inside
 */
export function validatePlaceholders(content: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Find all placeholders
    const placeholderRegex = /\{\{([^}]+)\}\}/g;
    const matches = content.matchAll(placeholderRegex);

    const foundPlaceholders: string[] = [];

    for (const match of matches) {
        const placeholder = match[1];
        foundPlaceholders.push(placeholder);

        // Check if placeholder is a number
        if (!/^\d+$/.test(placeholder)) {
            errors.push(`Invalid placeholder {{${placeholder}}}. Use {{1}}, {{2}}, {{3}}, etc. No words allowed`);
        }
    }

    // Check if placeholders are sequential starting from 1
    if (foundPlaceholders.length > 0) {
        const numbers = foundPlaceholders.map(p => parseInt(p)).filter(n => !isNaN(n)).sort((a, b) => a - b);

        for (let i = 0; i < numbers.length; i++) {
            if (numbers[i] !== i + 1) {
                warnings.push(`Placeholders should be sequential starting from {{1}}. Found: {{${numbers.join('}}, {{')}}}`);
                break;
            }
        }
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings
    };
}

/**
 * Validate content based on category
 */
export function validateContentByCategory(
    content: string,
    category: 'marketing' | 'utility' | 'authentication'
): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const lowerContent = content.toLowerCase();

    // Promotional keywords (NOT allowed in Utility or Authentication)
    const promotionalKeywords = [
        'discount', 'offer', 'sale', 'buy now', 'hurry', 'limited time',
        'special offer', 'deal', 'promotion', 'save', 'free', 'win',
        'prize', 'contest', 'giveaway', 'exclusive', 'today only'
    ];

    if (category === 'utility' || category === 'authentication') {
        for (const keyword of promotionalKeywords) {
            if (lowerContent.includes(keyword)) {
                errors.push(`Promotional content "${keyword}" is NOT allowed in ${category} templates. Use Marketing category instead`);
            }
        }
    }

    // Authentication templates should be simple
    if (category === 'authentication') {
        if (content.length > 200) {
            warnings.push('Authentication templates should be concise (under 200 characters recommended)');
        }

        // Check for OTP-related keywords
        const hasOTP = lowerContent.includes('otp') || lowerContent.includes('code') || lowerContent.includes('verification');
        if (!hasOTP) {
            warnings.push('Authentication templates typically include OTP/verification code');
        }
    }

    // Check for sensitive data warnings
    const sensitivePatterns = [
        { pattern: /\b\d{16}\b/, message: 'Avoid including full card numbers' },
        { pattern: /\b\d{3}-\d{2}-\d{4}\b/, message: 'Avoid including SSN or similar IDs' },
    ];

    for (const { pattern, message } of sensitivePatterns) {
        if (pattern.test(content)) {
            errors.push(message);
        }
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings
    };
}

/**
 * Validate buttons
 */
export function validateButtons(
    buttons: WhatsAppTemplate['buttons'],
    category: 'marketing' | 'utility' | 'authentication'
): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!buttons || buttons.length === 0) {
        return { valid: true, errors, warnings };
    }

    // Authentication templates cannot have buttons
    if (category === 'authentication') {
        errors.push('Authentication templates (OTP) cannot have buttons');
        return { valid: false, errors, warnings };
    }

    // Max 3 buttons
    if (buttons.length > 3) {
        errors.push('Maximum 3 buttons allowed per template');
    }

    // Validate each button
    for (const button of buttons) {
        // Check button text length
        if (!button.text || button.text.length === 0) {
            errors.push('Button text is required');
        }

        if (button.text && button.text.length > 25) {
            errors.push(`Button text "${button.text}" exceeds 25 characters`);
        }

        // Validate URL buttons
        if (button.type === 'URL') {
            if (!button.url) {
                errors.push('URL button must have a url field');
            } else if (!button.url.startsWith('https://')) {
                errors.push('URL buttons must use HTTPS');
            }
        }

        // Validate phone buttons
        if (button.type === 'PHONE_NUMBER') {
            if (!button.phone_number) {
                errors.push('Phone button must have a phone_number field');
            }
        }
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings
    };
}

/**
 * Validate language consistency
 */
export function validateLanguage(
    content: string,
    language: string
): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic check: if language is English, warn about non-English characters
    if (language === 'en') {
        const hasNonEnglish = /[^\x00-\x7F]/.test(content);
        if (hasNonEnglish) {
            warnings.push('Template language is set to English but contains non-English characters');
        }
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings
    };
}

/**
 * Comprehensive template validation
 */
export function validateWhatsAppTemplate(template: WhatsAppTemplate): ValidationResult {
    const allErrors: string[] = [];
    const allWarnings: string[] = [];

    // Validate name
    const nameValidation = validateTemplateName(template.name);
    allErrors.push(...nameValidation.errors);
    allWarnings.push(...nameValidation.warnings);

    // Validate placeholders
    const placeholderValidation = validatePlaceholders(template.content);
    allErrors.push(...placeholderValidation.errors);
    allWarnings.push(...placeholderValidation.warnings);

    // Validate content by category
    const categoryValidation = validateContentByCategory(template.content, template.category);
    allErrors.push(...categoryValidation.errors);
    allWarnings.push(...categoryValidation.warnings);

    // Validate buttons
    const buttonValidation = validateButtons(template.buttons, template.category);
    allErrors.push(...buttonValidation.errors);
    allWarnings.push(...buttonValidation.warnings);

    // Validate language
    const languageValidation = validateLanguage(template.content, template.language);
    allErrors.push(...languageValidation.errors);
    allWarnings.push(...languageValidation.warnings);

    return {
        valid: allErrors.length === 0,
        errors: allErrors,
        warnings: allWarnings
    };
}

/**
 * Extract placeholder count from content
 */
export function extractPlaceholderCount(content: string): number {
    const placeholderRegex = /\{\{(\d+)\}\}/g;
    const matches = content.matchAll(placeholderRegex);
    const numbers = Array.from(matches).map(m => parseInt(m[1]));
    return numbers.length > 0 ? Math.max(...numbers) : 0;
}

/**
 * Generate template examples based on category
 */
export function getTemplateExamples(category: 'marketing' | 'utility' | 'authentication') {
    const examples = {
        marketing: {
            name: 'summer_sale_offer',
            content: 'Hi {{1}}, unlock your special summer offer today! Get {{2}}% off. Click here: {{3}}',
            category: 'marketing' as const,
            language: 'en',
            buttons: [
                { type: 'URL' as const, text: 'Shop Now', url: 'https://example.com/sale' }
            ]
        },
        utility: {
            name: 'order_shipped_update',
            content: 'Hi {{1}}, your order {{2}} has been shipped. Track here: {{3}}',
            category: 'utility' as const,
            language: 'en',
            buttons: [
                { type: 'URL' as const, text: 'Track Order', url: 'https://example.com/track' }
            ]
        },
        authentication: {
            name: 'otp_verification_code',
            content: 'Your OTP is {{1}}. It will expire in 10 minutes. Do not share this code with anyone.',
            category: 'authentication' as const,
            language: 'en',
            buttons: undefined // No buttons for OTP
        }
    };

    return examples[category];
}

/**
 * Render template with sample values
 */
export function renderTemplate(content: string, variables: string[]): string {
    let rendered = content;
    variables.forEach((value, index) => {
        const placeholder = `{{${index + 1}}}`;
        rendered = rendered.split(placeholder).join(value || `[Variable ${index + 1}]`);
    });
    return rendered;
}

/**
 * Template Rules Engine
 * 
 * Validates WhatsApp templates against content rules
 * Prevents promotional content in Utility/Authentication templates
 */

export type TemplateCategory = 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';

interface ValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
}

// Prohibited keywords for Utility and Authentication templates
const PROMOTIONAL_KEYWORDS = [
    // Discounts & Offers
    'discount', 'sale', 'offer', 'deal', 'promo', 'promotion',
    'limited time', 'hurry', 'act now', 'buy now', 'shop now',
    'save', 'off', '%', 'percent off', 'clearance',

    // Urgency
    'urgent', 'last chance', 'ending soon', 'expires', 'today only',
    'don\'t miss', 'limited stock', 'while supplies last',

    // Marketing
    'free shipping', 'free delivery', 'cashback', 'reward',
    'exclusive', 'special', 'bonus', 'gift',

    // Emojis (common promotional ones)
    '🔥', '💰', '🎁', '🎉', '⚡', '💥', '🛍️', '💸',
];

// Prohibited phrases
const PROMOTIONAL_PHRASES = [
    'buy one get one',
    'bogo',
    'flash sale',
    'mega sale',
    'super sale',
    'grand opening',
    'new arrival',
    'hot deal',
    'best price',
    'lowest price',
    'price drop',
    'limited offer',
];

/**
 * Validate template content against category rules
 */
export function validateTemplateContent(
    content: string,
    category: TemplateCategory
): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Marketing templates can have promotional content
    if (category === 'MARKETING') {
        return { valid: true, errors, warnings };
    }

    const contentLower = content.toLowerCase();

    // Check for promotional keywords
    const foundKeywords = PROMOTIONAL_KEYWORDS.filter(keyword =>
        contentLower.includes(keyword.toLowerCase())
    );

    if (foundKeywords.length > 0) {
        errors.push(
            `Promotional keywords not allowed in ${category} templates: ${foundKeywords.join(', ')}`
        );
    }

    // Check for promotional phrases
    const foundPhrases = PROMOTIONAL_PHRASES.filter(phrase =>
        contentLower.includes(phrase)
    );

    if (foundPhrases.length > 0) {
        errors.push(
            `Promotional phrases not allowed in ${category} templates: ${foundPhrases.join(', ')}`
        );
    }

    // Check for excessive emojis (more than 2)
    const emojiCount = (content.match(/[\u{1F300}-\u{1F9FF}]/gu) || []).length;
    if (emojiCount > 2) {
        warnings.push(
            `Excessive emojis detected (${emojiCount}). ${category} templates should be professional.`
        );
    }

    // Check for all caps (more than 50% of text)
    const words = content.split(/\s+/);
    const capsWords = words.filter(word =>
        word.length > 2 && word === word.toUpperCase()
    );
    const capsPercentage = (capsWords.length / words.length) * 100;

    if (capsPercentage > 50) {
        warnings.push(
            'Excessive use of capital letters. This may appear as shouting.'
        );
    }

    // Check for multiple exclamation marks
    if (content.includes('!!') || content.includes('!!!')) {
        warnings.push(
            'Multiple exclamation marks detected. Keep ${category} templates professional.'
        );
    }

    // Authentication-specific rules
    if (category === 'AUTHENTICATION') {
        // Must contain OTP or verification-related terms
        const hasAuthTerms = /\b(otp|code|verify|verification|authenticate|password)\b/i.test(content);
        if (!hasAuthTerms) {
            warnings.push(
                'Authentication templates should contain verification-related terms (OTP, code, verify, etc.)'
            );
        }

        // Should not be too long
        if (content.length > 300) {
            warnings.push(
                'Authentication templates should be concise (under 300 characters)'
            );
        }
    }

    // Utility-specific rules
    if (category === 'UTILITY') {
        // Should be informational
        const hasInfoTerms = /\b(update|status|confirmation|receipt|notification|reminder)\b/i.test(content);
        if (!hasInfoTerms) {
            warnings.push(
                'Utility templates should be informational (updates, confirmations, notifications, etc.)'
            );
        }
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings,
    };
}

/**
 * Validate template structure
 */
export function validateTemplateStructure(template: {
    name: string;
    category: TemplateCategory;
    language: string;
    components: any[];
}): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Name validation
    if (!template.name || template.name.length < 3) {
        errors.push('Template name must be at least 3 characters');
    }

    if (!/^[a-z0-9_]+$/.test(template.name)) {
        errors.push('Template name can only contain lowercase letters, numbers, and underscores');
    }

    // Language validation
    if (!template.language) {
        errors.push('Template language is required');
    }

    // Components validation
    if (!template.components || template.components.length === 0) {
        errors.push('Template must have at least one component');
    }

    // Check for BODY component
    const hasBody = template.components.some(c => c.type === 'BODY');
    if (!hasBody) {
        errors.push('Template must have a BODY component');
    }

    // Validate each component
    template.components.forEach((component, index) => {
        if (component.type === 'BODY' && component.text) {
            const contentValidation = validateTemplateContent(component.text, template.category);
            errors.push(...contentValidation.errors);
            warnings.push(...contentValidation.warnings);
        }

        // Button validation
        if (component.type === 'BUTTONS') {
            if (!component.buttons || component.buttons.length === 0) {
                errors.push('BUTTONS component must have at least one button');
            }

            if (component.buttons && component.buttons.length > 3) {
                errors.push('Maximum 3 buttons allowed per template');
            }
        }
    });

    return {
        valid: errors.length === 0,
        errors,
        warnings,
    };
}

/**
 * Get user-friendly error message
 */
export function getValidationMessage(result: ValidationResult): string {
    if (result.valid && result.warnings.length === 0) {
        return 'Template is valid';
    }

    if (!result.valid) {
        return `Template validation failed:\n${result.errors.join('\n')}`;
    }

    return `Template is valid with warnings:\n${result.warnings.join('\n')}`;
}

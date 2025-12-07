/**
 * Error Codes and Categories
 * 
 * Standardized error codes for the WhatsApp SaaS platform
 * Format: {CATEGORY}_{NUMBER}_{DESCRIPTION}
 */

export const ERROR_CODES = {
    // ==================== AUTHENTICATION ====================
    AUTH_001_INVALID_CREDENTIALS: {
        message: 'Invalid email or password',
        status: 401,
        severity: 'low',
    },
    AUTH_002_TOKEN_EXPIRED: {
        message: 'Session expired, please login again',
        status: 401,
        severity: 'low',
    },
    AUTH_003_UNAUTHORIZED: {
        message: 'Authentication required',
        status: 401,
        severity: 'medium',
    },

    // ==================== PERMISSION ====================
    PERM_001_INSUFFICIENT_ROLE: {
        message: 'Insufficient permissions for this action',
        status: 403,
        severity: 'low',
    },
    PERM_002_ACCESS_DENIED: {
        message: 'Access denied',
        status: 403,
        severity: 'medium',
    },

    // ==================== VALIDATION ====================
    VAL_001_MISSING_FIELDS: {
        message: 'Required fields are missing',
        status: 400,
        severity: 'low',
    },
    VAL_002_INVALID_FORMAT: {
        message: 'Invalid data format',
        status: 400,
        severity: 'low',
    },
    VAL_003_INVALID_TEMPLATE: {
        message: 'This template is still under review',
        status: 400,
        severity: 'medium',
    },

    // ==================== BILLING ====================
    BILL_001_PLAN_EXPIRED: {
        message: 'Your plan has expired. Please upgrade to continue',
        status: 402,
        severity: 'high',
    },
    BILL_002_PAYMENT_FAILED: {
        message: 'Payment processing failed',
        status: 402,
        severity: 'high',
    },

    // ==================== RATE LIMITING ====================
    RATE_001_API_EXCEEDED: {
        message: 'API rate limit exceeded. Try again in 1 minute',
        status: 429,
        severity: 'medium',
    },
    RATE_002_MESSAGE_EXCEEDED: {
        message: 'Message rate limit exceeded',
        status: 429,
        severity: 'high',
    },

    // ==================== DATABASE ====================
    DB_001_CONNECTION_FAILED: {
        message: 'Database connection failed',
        status: 500,
        severity: 'critical',
    },
    DB_002_QUERY_FAILED: {
        message: 'Database query failed',
        status: 500,
        severity: 'high',
    },
    DB_003_INSERT_FAILED: {
        message: 'Failed to save data',
        status: 500,
        severity: 'high',
    },

    // ==================== AI CHATBOT ====================
    AI_001_TIMEOUT: {
        message: 'The chatbot is temporarily unavailable',
        status: 500,
        severity: 'medium',
    },
    AI_002_TOKEN_LIMIT: {
        message: 'AI token limit exceeded',
        status: 500,
        severity: 'medium',
    },
    AI_003_INVALID_RESPONSE: {
        message: 'Invalid AI response',
        status: 500,
        severity: 'medium',
    },

    // ==================== MESSAGE QUEUE ====================
    QUEUE_001_FAILED: {
        message: 'Message queue failed',
        status: 500,
        severity: 'high',
    },
    QUEUE_002_STUCK: {
        message: 'Message queue is stuck',
        status: 500,
        severity: 'critical',
    },

    // ==================== WHATSAPP API ====================
    // Temporary errors (retry)
    WSP_131000_RATE_LIMIT: {
        message: 'WhatsApp rate limit reached. Slowing down...',
        status: 429,
        severity: 'high',
        retryable: true,
        category: 'temporary',
    },
    WSP_131008_NETWORK_ERROR: {
        message: 'WhatsApp network error',
        status: 503,
        severity: 'medium',
        retryable: true,
        category: 'temporary',
    },
    WSP_131051_THROTTLING: {
        message: 'WhatsApp throttling detected',
        status: 429,
        severity: 'high',
        retryable: true,
        category: 'throttling',
    },

    // Permanent errors (don't retry)
    WSP_470_TEMPLATE_REJECTED: {
        message: 'Template rejected by WhatsApp',
        status: 400,
        severity: 'high',
        retryable: false,
        category: 'permanent',
    },
    WSP_1006_NUMBER_BLOCKED: {
        message: 'Number blocked by WhatsApp',
        status: 400,
        severity: 'critical',
        retryable: false,
        category: 'permanent',
    },
    WSP_132000_API_DOWN: {
        message: 'WhatsApp API is currently unavailable',
        status: 503,
        severity: 'critical',
        retryable: true,
        category: 'temporary',
    },
    WSP_100_GENERIC_ERROR: {
        message: 'WhatsApp API error',
        status: 500,
        severity: 'medium',
        retryable: true,
        category: 'temporary',
    },

    // ==================== WEBHOOK ====================
    HOOK_001_DUPLICATE: {
        message: 'Duplicate webhook event',
        status: 200,
        severity: 'low',
    },
    HOOK_002_PROCESSING_FAILED: {
        message: 'Webhook processing failed',
        status: 500,
        severity: 'medium',
    },
    HOOK_003_SIGNATURE_MISMATCH: {
        message: 'Webhook signature verification failed',
        status: 401,
        severity: 'high',
    },

    // ==================== NETWORK ====================
    NET_001_TIMEOUT: {
        message: 'Network timeout',
        status: 503,
        severity: 'medium',
        retryable: true,
    },
    NET_002_CONNECTION_FAILED: {
        message: 'Connection failed',
        status: 503,
        severity: 'medium',
        retryable: true,
    },

    // ==================== SYSTEM ====================
    SYS_001_MAINTENANCE: {
        message: 'System is currently in maintenance mode',
        status: 503,
        severity: 'high',
    },
    SYS_002_LOCKED: {
        message: 'System is temporarily locked',
        status: 503,
        severity: 'critical',
    },

    // ==================== UNKNOWN ====================
    UNK_001_UNEXPECTED: {
        message: 'An unexpected error occurred',
        status: 500,
        severity: 'medium',
    },
} as const;

export type ErrorCode = keyof typeof ERROR_CODES;

/**
 * Error severity levels
 */
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

/**
 * WhatsApp error categories
 */
export type WhatsAppErrorCategory = 'temporary' | 'permanent' | 'throttling';

/**
 * Check if error code is retryable
 */
export function isRetryableError(code: ErrorCode): boolean {
    const error = ERROR_CODES[code];
    return 'retryable' in error && error.retryable === true;
}

/**
 * Get error severity
 */
export function getErrorSeverity(code: ErrorCode): ErrorSeverity {
    return ERROR_CODES[code].severity;
}

/**
 * Get WhatsApp error category
 */
export function getWhatsAppErrorCategory(code: ErrorCode): WhatsAppErrorCategory | null {
    const error = ERROR_CODES[code];
    if ('category' in error) {
        return error.category as WhatsAppErrorCategory;
    }
    return null;
}

/**
 * Map WhatsApp API error code to our error code
 */
export function mapWhatsAppError(whatsappCode: number): ErrorCode {
    const mapping: Record<number, ErrorCode> = {
        131000: 'WSP_131000_RATE_LIMIT',
        131008: 'WSP_131008_NETWORK_ERROR',
        131051: 'WSP_131051_THROTTLING',
        470: 'WSP_470_TEMPLATE_REJECTED',
        1006: 'WSP_1006_NUMBER_BLOCKED',
        132000: 'WSP_132000_API_DOWN',
    };

    return mapping[whatsappCode] || 'WSP_100_GENERIC_ERROR';
}

/**
 * Create a structured error object
 */
export function createError(
    code: ErrorCode,
    details?: Record<string, any>
): AppError {
    const errorDef = ERROR_CODES[code];
    return {
        code,
        message: errorDef.message,
        status: errorDef.status,
        severity: errorDef.severity,
        details: details || {},
        timestamp: new Date().toISOString(),
    };
}

/**
 * Application error interface
 */
export interface AppError {
    code: ErrorCode;
    message: string;
    status: number;
    severity: ErrorSeverity;
    details: Record<string, any>;
    timestamp: string;
}

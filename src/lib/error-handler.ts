import { NextRequest, NextResponse } from 'next/server';
import { ERROR_CODES, ErrorCode, AppError, createError, getErrorSeverity } from './error-codes';
import { logUserAction } from './audit-logger';

/**
 * Global Error Handler
 * 
 * Provides crash-safe error handling for all API routes
 */

/**
 * Handle and format errors
 */
export async function handleError(
    error: any,
    request?: NextRequest,
    userId?: string
): Promise<NextResponse> {
    let appError: AppError;

    // Check if it's already an AppError
    if (error && typeof error === 'object' && 'code' in error && error.code in ERROR_CODES) {
        appError = error as AppError;
    } else {
        // Convert unknown error to AppError
        appError = createError('UNK_001_UNEXPECTED', {
            originalError: error instanceof Error ? error.message : String(error),
        });
    }

    // Log error to audit logs
    if (userId) {
        try {
            await logError(appError, userId, request);
        } catch (logErr) {
            console.error('Failed to log error:', logErr);
        }
    }

    // Log to console for debugging
    console.error('❌ Error:', {
        code: appError.code,
        message: appError.message,
        severity: appError.severity,
        details: appError.details,
        timestamp: appError.timestamp,
    });

    // Create error response
    return createErrorResponse(appError);
}

/**
 * Create standardized error response
 */
export function createErrorResponse(error: AppError): NextResponse {
    return NextResponse.json(
        {
            success: false,
            error: {
                code: error.code,
                message: error.message,
                details: error.details,
                timestamp: error.timestamp,
            },
        },
        {
            status: error.status,
            headers: {
                'X-Error-Code': error.code,
                'X-Error-Severity': error.severity,
            },
        }
    );
}

/**
 * Log error to audit logs
 */
async function logError(
    error: AppError,
    userId: string,
    request?: NextRequest
): Promise<void> {
    const severity = getErrorSeverity(error.code);

    // Map error severity to audit log severity
    const auditSeverity = severity === 'critical' || severity === 'high' ? 'critical' :
        severity === 'medium' ? 'warning' : 'info';

    await logUserAction(
        userId,
        'error_occurred',
        `Error: ${error.message}`,
        'error',
        undefined,
        {
            errorCode: error.code,
            errorSeverity: error.severity,
            errorDetails: error.details,
        },
        request
    );
}

/**
 * Async error wrapper for route handlers
 * 
 * Usage:
 * export const POST = wrapAsync(async (request) => {
 *   // Your route logic
 * });
 */
export function wrapAsync<T extends any[]>(
    handler: (request: NextRequest, ...args: T) => Promise<NextResponse>
) {
    return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
        try {
            return await handler(request, ...args);
        } catch (error) {
            // Extract user ID if available (from middleware or args)
            let userId: string | undefined;
            if (args.length > 0 && typeof args[0] === 'object' && 'id' in args[0]) {
                userId = args[0].id as string;
            }

            return await handleError(error, request, userId);
        }
    };
}

/**
 * Throw an application error
 * 
 * Usage:
 * throw throwError('AUTH_001_INVALID_CREDENTIALS', { email });
 */
export function throwError(code: ErrorCode, details?: Record<string, any>): never {
    throw createError(code, details);
}

/**
 * Safe async execution with error handling
 * 
 * Usage:
 * const result = await safeAsync(() => riskyOperation());
 * if (!result.success) {
 *   return handleError(result.error);
 * }
 */
export async function safeAsync<T>(
    fn: () => Promise<T>
): Promise<{ success: true; data: T } | { success: false; error: AppError }> {
    try {
        const data = await fn();
        return { success: true, data };
    } catch (error) {
        if (error && typeof error === 'object' && 'code' in error) {
            return { success: false, error: error as AppError };
        }
        return {
            success: false,
            error: createError('UNK_001_UNEXPECTED', {
                originalError: error instanceof Error ? error.message : String(error),
            }),
        };
    }
}

/**
 * Check if error should trigger an alert
 */
export function shouldAlert(error: AppError): boolean {
    return error.severity === 'critical' || error.severity === 'high';
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyMessage(code: ErrorCode): string {
    const error = ERROR_CODES[code];
    return error.message;
}

import { ErrorCode, isRetryableError, getWhatsAppErrorCategory } from './error-codes';

/**
 * Retry Logic with Exponential Backoff
 * 
 * Implements retry strategies for external API calls
 */

interface RetryOptions {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    backoffMultiplier?: number;
    onRetry?: (attempt: number, error: any) => void;
}

/**
 * Retry a function with exponential backoff
 * 
 * Delays: 2s → 5s → 15s → 30s → 60s
 */
export async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
): Promise<T> {
    const {
        maxRetries = 5,
        initialDelay = 2000, // 2 seconds
        maxDelay = 60000, // 60 seconds
        backoffMultiplier = 2.5,
        onRetry,
    } = options;

    let lastError: any;
    let delay = initialDelay;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;

            // Don't retry on last attempt
            if (attempt === maxRetries) {
                break;
            }

            // Check if error is retryable
            if (error && typeof error === 'object' && 'code' in error) {
                const errorCode = error.code as ErrorCode;
                if (!isRetryableError(errorCode)) {
                    // Non-retryable error, throw immediately
                    throw error;
                }

                // Check WhatsApp error category
                const category = getWhatsAppErrorCategory(errorCode);
                if (category === 'permanent') {
                    // Permanent error, don't retry
                    throw error;
                }

                if (category === 'throttling') {
                    // Throttling error, use longer delay
                    delay = Math.min(delay * 3, maxDelay);
                }
            }

            // Call retry callback
            if (onRetry) {
                onRetry(attempt + 1, error);
            }

            // Log retry attempt
            console.log(`🔄 Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`);

            // Wait before retrying
            await sleep(delay);

            // Exponential backoff
            delay = Math.min(delay * backoffMultiplier, maxDelay);
        }
    }

    // All retries failed
    throw lastError;
}

/**
 * Retry WhatsApp API call
 * 
 * Specialized retry for WhatsApp with 5 retries
 */
export async function retryWhatsAppAPI<T>(
    apiCall: () => Promise<T>,
    onRetry?: (attempt: number, error: any) => void
): Promise<T> {
    return retryWithBackoff(apiCall, {
        maxRetries: 5,
        initialDelay: 2000,
        maxDelay: 60000,
        backoffMultiplier: 2.5,
        onRetry,
    });
}

/**
 * Retry AI call
 * 
 * Specialized retry for AI with 2 retries (faster timeout)
 */
export async function retryAICall<T>(
    aiCall: () => Promise<T>,
    onRetry?: (attempt: number, error: any) => void
): Promise<T> {
    return retryWithBackoff(aiCall, {
        maxRetries: 2,
        initialDelay: 1000,
        maxDelay: 5000,
        backoffMultiplier: 2,
        onRetry,
    });
}

/**
 * Retry database operation
 * 
 * Specialized retry for database with 3 retries
 */
export async function retryDatabaseOp<T>(
    dbOp: () => Promise<T>,
    onRetry?: (attempt: number, error: any) => void
): Promise<T> {
    return retryWithBackoff(dbOp, {
        maxRetries: 3,
        initialDelay: 500,
        maxDelay: 5000,
        backoffMultiplier: 2,
        onRetry,
    });
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry with circuit breaker
 * 
 * Stops retrying if too many failures in a row
 */
export class CircuitBreaker {
    private failures = 0;
    private lastFailureTime = 0;
    private state: 'closed' | 'open' | 'half-open' = 'closed';

    constructor(
        private threshold: number = 5,
        private timeout: number = 60000 // 1 minute
    ) { }

    async execute<T>(fn: () => Promise<T>): Promise<T> {
        if (this.state === 'open') {
            const now = Date.now();
            if (now - this.lastFailureTime > this.timeout) {
                this.state = 'half-open';
            } else {
                throw new Error('Circuit breaker is open');
            }
        }

        try {
            const result = await fn();
            this.onSuccess();
            return result;
        } catch (error) {
            this.onFailure();
            throw error;
        }
    }

    private onSuccess() {
        this.failures = 0;
        this.state = 'closed';
    }

    private onFailure() {
        this.failures++;
        this.lastFailureTime = Date.now();

        if (this.failures >= this.threshold) {
            this.state = 'open';
            console.error(`🔴 Circuit breaker opened after ${this.failures} failures`);
        }
    }

    getState() {
        return this.state;
    }

    reset() {
        this.failures = 0;
        this.state = 'closed';
    }
}

/**
 * Global circuit breakers for different services
 */
export const whatsappCircuitBreaker = new CircuitBreaker(10, 120000); // 10 failures, 2 min timeout
export const aiCircuitBreaker = new CircuitBreaker(5, 60000); // 5 failures, 1 min timeout
export const databaseCircuitBreaker = new CircuitBreaker(3, 30000); // 3 failures, 30 sec timeout

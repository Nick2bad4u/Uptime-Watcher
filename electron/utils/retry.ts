import { dbLogger } from "./logger";

/**
 * Generic retry utility with configurable parameters
 */
export async function withRetry<T>(
    operation: () => Promise<T>,
    options: {
        delayMs?: number;
        maxRetries?: number;
        onError?: (error: unknown, attempt: number) => void;
        operationName?: string;
    } = {}
): Promise<T> {
    const { delayMs = 300, maxRetries = 5, onError, operationName = "operation" } = options;

    const errors: unknown[] = [];

    for (const attempt of Array.from({ length: maxRetries }, (_, i) => i)) {
        try {
            return await operation();
        } catch (error) {
            errors.push(error);

            if (onError) {
                onError(error, attempt + 1);
            } else {
                dbLogger.error(`${operationName} failed (attempt ${attempt + 1}/${maxRetries})`, error);
            }

            if (attempt < maxRetries - 1) {
                await new Promise((resolve) => setTimeout(resolve, delayMs));
            }
        }
    }

    const lastError = errors[errors.length - 1];
    dbLogger.error(`Persistent failure after ${maxRetries} retries for ${operationName}`, lastError);
    throw lastError;
}

/**
 * Database-specific retry wrapper
 */
export async function withDbRetry<T>(operation: () => Promise<T>, operationName: string, maxRetries = 5): Promise<T> {
    return withRetry(operation, {
        delayMs: 300,
        maxRetries,
        operationName,
    });
}

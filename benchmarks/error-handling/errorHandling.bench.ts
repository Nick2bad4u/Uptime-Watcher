/**
 * Benchmark tests for error handling operations
 *
 * @file Performance benchmarks for error handling, validation, and recovery
 *   operations across the application.
 *
 * @author GitHub Copilot
 *
 * @since 2025-08-11
 *
 * @category Performance
 *
 * @benchmark ErrorHandling
 *
 * @tags ["performance", "error-handling", "validation", "recovery"]
 */

import { bench, describe, beforeAll } from "vitest";

// Error types for benchmarking
class ValidationError extends Error {
    constructor(
        message: string,
        public errors: string[] = []
    ) {
        super(message);
        this.name = "ValidationError";
    }
}

class NetworkError extends Error {
    constructor(
        message: string,
        public statusCode?: number
    ) {
        super(message);
        this.name = "NetworkError";
    }
}

class DatabaseError extends Error {
    constructor(
        message: string,
        public query?: string
    ) {
        super(message);
        this.name = "DatabaseError";
    }
}

// Error handling utilities for benchmarking
function validateMonitorData(data: any): string[] {
    const errors: string[] = [];

    if (!data) {
        errors.push("Data is required");
        return errors;
    }

    if (!data.url && !data.host) {
        errors.push("Either URL or host is required");
    }

    if (data.url && typeof data.url !== "string") {
        errors.push("URL must be a string");
    }

    if (
        data.timeout &&
        (typeof data.timeout !== "number" || data.timeout < 1000)
    ) {
        errors.push("Timeout must be a number >= 1000ms");
    }

    if (
        data.retryAttempts &&
        (typeof data.retryAttempts !== "number" || data.retryAttempts < 0)
    ) {
        errors.push("Retry attempts must be a non-negative number");
    }

    return errors;
}

function handleError(error: Error): {
    handled: boolean;
    shouldRetry: boolean;
    message: string;
} {
    if (error instanceof ValidationError) {
        return {
            handled: true,
            shouldRetry: false,
            message: `Validation failed: ${error.errors.join(", ")}`,
        };
    }

    if (error instanceof NetworkError) {
        return {
            handled: true,
            shouldRetry: error.statusCode !== 404 && error.statusCode !== 401,
            message: `Network error (${error.statusCode}): ${error.message}`,
        };
    }

    if (error instanceof DatabaseError) {
        return {
            handled: true,
            shouldRetry: !error.message.includes("constraint"),
            message: `Database error: ${error.message}`,
        };
    }

    return {
        handled: false,
        shouldRetry: false,
        message: `Unknown error: ${error.message}`,
    };
}

async function withRetry<T>(
    operation: () => Promise<T>,
    maxRetries = 3,
    baseDelay = 1000
): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error as Error;

            const errorInfo = handleError(lastError);
            if (!errorInfo.shouldRetry || attempt === maxRetries) {
                throw lastError;
            }

            // Exponential backoff (simulated)
            const delay = baseDelay * Math.pow(2, attempt);
            await new Promise((resolve) =>
                setTimeout(resolve, Math.min(delay, 0.1))
            ); // Very short for benchmarking
        }
    }

    throw lastError!;
}

// Data generators for benchmarking
function generateValidMonitorData(count: number): any[] {
    return Array.from({ length: count }, (_, i) => ({
        id: `monitor-${i}`,
        url: `https://example${i}.com`,
        timeout: 5000 + (i % 1000),
        retryAttempts: i % 5,
        type: [
            "http",
            "ping",
            "port",
        ][i % 3],
    }));
}

function generateInvalidMonitorData(count: number): any[] {
    return Array.from({ length: count }, (_, i) => {
        const invalid: any = {};

        // Various types of invalid data
        switch (i % 5) {
            case 0:
                invalid.url = null;
                break;
            case 1:
                invalid.timeout = -1;
                break;
            case 2:
                invalid.retryAttempts = -5;
                break;
            case 3:
                invalid.url = 123;
                break;
            case 4:
                // Empty object
                break;
        }

        return invalid;
    });
}

function generateErrors(count: number): Error[] {
    return Array.from({ length: count }, (_, i) => {
        switch (i % 4) {
            case 0:
                return new ValidationError(`Validation failed ${i}`, [
                    `Error ${i}`,
                ]);
            case 1:
                return new NetworkError(`Network error ${i}`, 500 + (i % 100));
            case 2:
                return new DatabaseError(
                    `Database error ${i}`,
                    `SELECT * FROM table${i}`
                );
            default:
                return new Error(`Generic error ${i}`);
        }
    });
}

describe("Error Handling Performance Benchmarks", () => {
    let validData: any[];
    let invalidData: any[];
    let errors: Error[];

    beforeAll(() => {
        validData = generateValidMonitorData(1000);
        invalidData = generateInvalidMonitorData(1000);
        errors = generateErrors(1000);
    });

    // Validation Benchmarks
    bench("Validation - Small dataset (100 items)", () => {
        const data = validData.slice(0, 100);
        data.forEach((item) => validateMonitorData(item));
    });

    bench("Validation - Medium dataset (1K items)", () => {
        validData.forEach((item) => validateMonitorData(item));
    });

    bench("Validation with errors - Small dataset (100 items)", () => {
        const data = invalidData.slice(0, 100);
        data.forEach((item) => {
            const errors = validateMonitorData(item);
            if (errors.length > 0) {
                // Simulate error processing
                errors.join(", ");
            }
        });
    });

    bench("Validation with errors - Medium dataset (1K items)", () => {
        invalidData.forEach((item) => {
            const errors = validateMonitorData(item);
            if (errors.length > 0) {
                // Simulate error processing
                errors.join(", ");
            }
        });
    });

    // Error Classification Benchmarks
    bench("Error classification - Small batch (100 errors)", () => {
        const errorBatch = errors.slice(0, 100);
        errorBatch.forEach((error) => handleError(error));
    });

    bench("Error classification - Medium batch (1K errors)", () => {
        errors.forEach((error) => handleError(error));
    });

    // Error Recovery Benchmarks
    bench("Error recovery simulation - Immediate success", async () => {
        const operations = Array.from({ length: 100 }, (_, i) => async () => {
            return `Success ${i}`;
        });

        await Promise.all(operations.map((op) => withRetry(op, 3, 10)));
    });

    bench("Error recovery simulation - Success after 1 retry", async () => {
        const operations = Array.from({ length: 50 }, (_, i) => {
            let attempt = 0;
            return async () => {
                attempt++;
                if (attempt === 1) {
                    throw new NetworkError(`Temporary error ${i}`, 503);
                }
                return `Success ${i}`;
            };
        });

        await Promise.all(operations.map((op) => withRetry(op, 3, 10)));
    });

    bench("Error recovery simulation - Success after 2 retries", async () => {
        const operations = Array.from({ length: 20 }, (_, i) => {
            let attempt = 0;
            return async () => {
                attempt++;
                if (attempt <= 2) {
                    throw new NetworkError(`Temporary error ${i}`, 502);
                }
                return `Success ${i}`;
            };
        });

        await Promise.all(operations.map((op) => withRetry(op, 3, 10)));
    });

    // Exception Handling Performance
    bench("Exception throwing and catching - Small batch", () => {
        for (let i = 0; i < 100; i++) {
            try {
                throw new ValidationError(`Test error ${i}`, [`Detail ${i}`]);
            } catch (error) {
                handleError(error as Error);
            }
        }
    });

    bench("Exception throwing and catching - Medium batch", () => {
        for (let i = 0; i < 1000; i++) {
            try {
                throw new DatabaseError(`Test error ${i}`, `query-${i}`);
            } catch (error) {
                handleError(error as Error);
            }
        }
    });

    // Complex Error Scenarios
    bench("Complex validation with nested errors", () => {
        const complexData = Array.from({ length: 100 }, (_, i) => ({
            monitors: Array.from({ length: 10 }, (_, j) => ({
                id: `${i}-${j}`,
                url: j % 3 === 0 ? null : `https://test${i}-${j}.com`,
                timeout: j % 4 === 0 ? -1 : 5000,
                retryAttempts: j % 5 === 0 ? -1 : 3,
            })),
        }));

        complexData.forEach((item) => {
            const allErrors: string[] = [];
            item.monitors.forEach((monitor, index) => {
                const errors = validateMonitorData(monitor);
                if (errors.length > 0) {
                    allErrors.push(
                        ...errors.map((err) => `Monitor ${index}: ${err}`)
                    );
                }
            });

            if (allErrors.length > 0) {
                handleError(
                    new ValidationError("Complex validation failed", allErrors)
                );
            }
        });
    });

    // Error Aggregation and Reporting
    bench("Error aggregation and reporting", () => {
        const errorGroups: Record<string, number> = {};
        const errorDetails: string[] = [];

        errors.forEach((error) => {
            const info = handleError(error);
            errorGroups[error.name] = (errorGroups[error.name] || 0) + 1;
            errorDetails.push(info.message);
        });

        // Simulate report generation
        Object.entries(errorGroups).map(([type, count]) => `${type}: ${count}`);
        errorDetails.slice(0, 10); // Top 10 errors
    });

    // Stack trace processing simulation
    bench("Stack trace processing simulation", () => {
        for (let i = 0; i < 100; i++) {
            try {
                const error = new Error(`Stack trace test ${i}`);
                Error.captureStackTrace(error);
                throw error;
            } catch (error) {
                const e = error as Error;
                // Simulate stack trace processing
                e.stack?.split("\n").slice(0, 5).join("\n");
            }
        }
    });
});

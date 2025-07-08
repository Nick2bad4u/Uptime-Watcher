/**
 * Correlation ID utilities for tracking operations across the application.
 * Provides unique identifiers for request/operation tracking and debugging.
 */

import { randomBytes } from "node:crypto";

/**
 * Generate a unique correlation ID for tracking operations.
 * Uses crypto.randomBytes for cryptographically secure random values.
 *
 * @returns A unique correlation ID string
 */
export function generateCorrelationId(): string {
    return randomBytes(8).toString("hex");
}

/**
 * Validation error class for business rule violations.
 * Extends Error with additional validation context.
 */
export class ValidationError extends Error {
    constructor(public errors: string[]) {
        super(`Validation failed: ${errors.join(", ")}`);
        this.name = "ValidationError";
    }
}

/**
 * Correlation ID utilities for tracking operations across the application.
 * Provides unique identifiers for request/operation tracking and debugging.
 *
 * @remarks
 * This module uses Node.js built-in modules and is intended for Electron main process (backend) use only.
 */

import { randomBytes } from "node:crypto";

/**
 * Validation error class for business rule violations.
 * Extends Error with additional validation context.
 *
 * @param errors - Array of validation error messages
 *
 * @example
 * ```typescript
 * throw new ValidationError(['Invalid email format', 'Password too short']);
 * ```
 */
export class ValidationError extends Error {
    constructor(public errors: string[]) {
        super(`Validation failed: ${errors.join(", ")}`);
        this.name = "ValidationError";
    }
}

/**
 * Generate a unique correlation ID for tracking operations.
 * Uses crypto.randomBytes for cryptographically secure random values.
 *
 * @returns A unique correlation ID string (16 hex characters)
 *
 * @example
 * ```typescript
 * const correlationId = generateCorrelationId();
 * console.log(correlationId); // "a1b2c3d4e5f67890"
 * ```
 */
export function generateCorrelationId(): string {
    return randomBytes(8).toString("hex");
}

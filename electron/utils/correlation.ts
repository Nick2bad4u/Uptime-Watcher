/**
 * Correlation ID utilities and validation error handling for tracking
 * operations across the backend.
 *
 * @remarks
 * Provides unique identifiers for request/operation tracking and debugging in
 * the Electron main process. Includes validation error handling for business
 * rule violations. Uses Node.js built-in crypto module for secure random ID
 * generation.
 *
 * Key features:
 *
 * - Cryptographically secure correlation ID generation
 * - Validation error class with multiple error support
 * - Backend-specific utilities for Electron main process
 * - Operation tracking across service boundaries
 * - Debugging aid for distributed operations
 *
 * @example
 *
 * ```typescript
 * import { generateCorrelationId, ValidationError } from "./correlation";
 *
 * // Generate secure correlation ID
 * const operationId = generateCorrelationId();
 * logger.info(`Operation ID: ${operationId}`); // "a1b2c3d4e5f67890"
 *
 * // Throw validation errors with multiple messages
 * throw new ValidationError([
 *     "Invalid email format",
 *     "Password too short",
 * ]);
 * ```
 *
 * @packageDocumentation
 */

import { randomBytes } from "node:crypto";

/**
 * Validation error class for business rule violations. Extends Error with
 * additional validation context.
 *
 * @example
 *
 * ```typescript
 * throw new ValidationError([
 *     "Invalid email format",
 *     "Password too short",
 * ]);
 * ```
 *
 * @param errors - Array of validation error messages
 */
export class ValidationError extends Error {
    /**
     * Array of validation error messages
     */
    public errors: string[];

    public constructor(errors: string[]) {
        super(`Validation failed: ${errors.join(", ")}`);
        this.name = "ValidationError";
        this.errors = errors;
    }
}

/**
 * Generate a unique correlation ID for tracking operations. Uses
 * crypto.randomBytes for cryptographically secure random values.
 *
 * @example
 *
 * ```typescript
 * const correlationId = generateCorrelationId();
 * logger.debug(`Correlation ID: ${correlationId}`); // "a1b2c3d4e5f67890"
 * ```
 *
 * @returns A unique correlation ID string (16 hex characters)
 */
export function generateCorrelationId(): string {
    return randomBytes(8).toString("hex");
}

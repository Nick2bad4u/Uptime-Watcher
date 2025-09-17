/**
 * Common error utilities shared across the application.
 *
 * @remarks
 * This module provides shared utilities for consistent error handling and
 * formatting across both frontend and backend code.
 *
 * @packageDocumentation
 */

/**
 * Extracts a human-readable error message from an unknown error value.
 *
 * @remarks
 * This utility standardizes error message extraction across the application,
 * providing consistent fallback behavior for non-Error values.
 *
 * @example
 *
 * ```typescript
 * try {
 *     await riskyOperation();
 * } catch (error) {
 *     console.error(`Operation failed: ${getErrorMessage(error)}`);
 * }
 * ```
 *
 * @param error - Unknown error value from catch block or callback
 * @param fallback - Custom fallback message (default: "Unknown error")
 *
 * @returns Human-readable error message
 */
export function getErrorMessage(
    error: unknown,
    fallback = "Unknown error"
): string {
    return error instanceof Error ? error.message : fallback;
}

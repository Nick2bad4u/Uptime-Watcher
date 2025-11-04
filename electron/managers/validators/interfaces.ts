/* V8 ignore start */

/** @internal Runtime marker to satisfy coverage for the pure type module. */
export const VALIDATOR_INTERFACES_RUNTIME_MARKER = true as const;

/**
 * Represents the result of a validation operation, providing error details and
 * validity status.
 *
 * @remarks
 * Used by validators throughout the application to return standardized results.
 * Enables consistent error handling and user feedback by encapsulating both
 * error messages and overall validity.
 *
 * @example
 *
 * ```typescript
 * const result: ValidationResult = {
 *     errors: [],
 *     success: true,
 * };
 * // or
 * const result: ValidationResult = {
 *     errors: ["Field is required"],
 *     success: false,
 * };
 * ```
 *
 * Base validation interface.
 *
 * @public
 */
// Validation result interface - import directly from shared/types/validation
// if needed
export interface ValidationResult {
    /** Array of error messages describing validation failures */
    errors: readonly string[];
    /** Boolean indicating whether validation was successful */
    success: boolean;
}

/* V8 ignore end */

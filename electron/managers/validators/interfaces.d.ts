/**
 * Base validation interface.
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
 * @public
 */
export interface ValidationResult {
    /** Array of error messages describing validation failures */
    errors: readonly string[];
    /** Boolean indicating whether validation was successful */
    success: boolean;
}

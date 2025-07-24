/**
 * Validation result interface for consistent error reporting across the application.
 *
 * @remarks
 * Used by validators to return standardized validation results with error details and validity status.
 * Enables consistent error handling and user feedback throughout the system.
 *
 * @example
 * ```typescript
 * const result: ValidationResult = {
 *   errors: [],
 *   isValid: true
 * };
 * // or
 * const result: ValidationResult = {
 *   errors: ["Field is required"],
 *   isValid: false
 * };
 * ```
 *
 * @public
 */
export interface ValidationResult {
    /**
     * Array of validation error messages (empty if valid).
     *
     * @remarks
     * If validation passes, this array will be empty. If validation fails, it contains error messages describing each failure.
     */
    errors: string[];
    /**
     * True if validation passed, false if any errors were found.
     *
     * @defaultValue false
     */
    isValid: boolean;
}

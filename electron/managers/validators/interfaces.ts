/**
 * Represents the result of a validation operation, providing error details and validity status.
 *
 * @remarks
 * Used by validators throughout the application to return standardized results.
 * Enables consistent error handling and user feedback by encapsulating both error messages and overall validity.
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
     * An array of validation error messages.
     *
     * @remarks
     * If validation passes, this array will be empty. If validation fails, it contains one or more error messages describing each failure.
     */
    errors: string[];
    /**
     * Indicates whether the validation passed.
     *
     * @remarks
     * `true` if validation passed (no errors), `false` if any errors were found.
     *
     * @defaultValue false
     */
    isValid: boolean;
}

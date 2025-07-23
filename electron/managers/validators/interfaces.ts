/**
 * Validation result interface for consistent error reporting across the application.
 *
 * @remarks
 * Used by validators to return standardized validation results with error details
 * and validity status. Enables consistent error handling and user feedback.
 */
export interface ValidationResult {
    /** Array of validation error messages (empty if valid) */
    errors: string[];
    /** True if validation passed, false if any errors were found */
    isValid: boolean;
}

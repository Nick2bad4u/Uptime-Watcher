/**
 * Shared interfaces for validation across the application.
 */

export interface ValidationResult {
    isValid: boolean;
    errors: string[];
}

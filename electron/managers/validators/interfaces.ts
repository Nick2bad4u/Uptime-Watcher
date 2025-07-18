/**
 * Shared interfaces for validation across the application.
 */

export interface ValidationResult {
    errors: string[];
    isValid: boolean;
}

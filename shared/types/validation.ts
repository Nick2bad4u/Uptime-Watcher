/**
 * Unified validation result types for the Uptime Watcher application.
 *
 * @remarks
 * This module provides a single source of truth for validation result interfaces,
 * eliminating the duplication that existed across multiple files.
 *
 * @packageDocumentation
 */

/**
 * Base validation result interface.
 *
 * @remarks
 * Provides the core structure for validation results across the application.
 * Other validation interfaces can extend this for domain-specific needs.
 *
 * @public
 */
export interface BaseValidationResult {
    /** Array of validation error messages */
    errors: string[];
    /** Whether validation passed (no errors) */
    success: boolean;
    /** Optional warning messages that don't prevent validation success */
    warnings?: string[];
}

/**
 * Form-specific validation result.
 *
 * @remarks
 * Extends base validation with field-specific error mapping
 * for UI form validation scenarios.
 *
 * @public
 */
export interface FormValidationResult extends BaseValidationResult {
    /** Field-specific error messages mapped by field name */
    fieldErrors?: Record<string, string[]>;
}

/**
 * Monitor configuration validation result.
 *
 * @remarks
 * Specialized validation result for monitor configuration validation.
 *
 * @public
 */
export interface MonitorConfigValidationResult extends BaseValidationResult {
    /** Configuration error messages */
    configErrors?: string[];
    /** Monitor type specific validation errors */
    monitorTypeErrors?: Record<string, string[]>;
}

/**
 * Theme validation result.
 *
 * @remarks
 * Specialized validation result for theme configuration validation.
 *
 * @public
 */
export interface ThemeValidationResult extends BaseValidationResult {
    /** Missing theme properties */
    missingProperties?: string[];
    /** Theme-specific validation errors */
    themeErrors?: string[];
}

/**
 * Enhanced validation result with metadata and data.
 *
 * @remarks
 * Used for complex validation scenarios that need to return
 * validated data and contextual information.
 *
 * @public
 */
export interface ValidationResult extends BaseValidationResult {
    /** The validated data, if validation succeeded */
    data?: unknown;
    /** Metadata about the validation process */
    metadata?: Record<string, unknown>;
}

/**
 * Helper function to create a failed validation result.
 *
 * @param errors - Array of error messages
 * @param metadata - Optional metadata about the validation
 * @returns A failed ValidationResult
 *
 * @public
 */
export function createFailureResult(errors: string[], metadata?: Record<string, unknown>): ValidationResult {
    return {
        errors,
        metadata: metadata ?? {},
        success: false,
        warnings: [],
    };
}

/**
 * Helper function to create a successful validation result.
 *
 * @param data - Optional validated data
 * @param warnings - Optional warning messages
 * @returns A successful ValidationResult
 *
 * @public
 */
export function createSuccessResult(data?: unknown, warnings?: string[]): ValidationResult {
    const result: ValidationResult = {
        data,
        errors: [],
        metadata: {},
        success: true,
    };

    if (warnings) {
        result.warnings = warnings;
    }

    return result;
}

/**
 * Type guard to check if a result is a valid BaseValidationResult.
 *
 * @param result - The object to check
 * @returns True if the object matches BaseValidationResult structure
 *
 * @public
 */
export function isValidationResult(result: unknown): result is BaseValidationResult {
    return (
        typeof result === "object" &&
        result !== null &&
        "errors" in result &&
        "success" in result &&
        Array.isArray((result as BaseValidationResult).errors) &&
        typeof (result as BaseValidationResult).success === "boolean"
    );
}

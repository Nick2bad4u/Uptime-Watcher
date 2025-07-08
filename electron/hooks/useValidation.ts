/**
 * Validation hook for business rule enforcement with error handling.
 * Provides reusable validation patterns with consistent error reporting.
 */

import type { ValidationResult } from "../managers";
import type { Site } from "../types";

import { configurationManager } from "../managers";
import { ValidationError } from "./correlationUtils";

/**
 * Hook for validation operations with consistent error handling.
 * Provides centralized validation logic and error formatting.
 *
 * @returns Object containing validation functions and utilities
 */
export const useValidation = () => {
    return {
        /**
         * Validate monitor configuration according to business rules.
         */
        validateMonitor: (monitor: Site["monitors"][0]): ValidationResult => {
            return configurationManager.validateMonitorConfiguration(monitor);
        },
        /**
         * Validate site configuration according to business rules.
         */
        validateSite: (site: Site): ValidationResult => {
            return configurationManager.validateSiteConfiguration(site);
        },
        /**
         * Execute an operation with validation, throwing ValidationError on failure.
         */
        withValidation: async <T>(
            data: unknown,
            validator: (data: unknown) => ValidationResult,
            operation: () => Promise<T>
        ): Promise<T> => {
            const result = validator(data);
            if (!result.isValid) {
                throw new ValidationError(result.errors);
            }
            return operation();
        },
    };
};

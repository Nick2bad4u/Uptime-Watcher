/**
 * Backend Operational Hooks - Usage Examples
 *
 * This file demonstrates how to use the new Backend Operational Hooks
 * in your application code for consistent patterns across operations.
 */

import type { Site } from "../types";

import { useTransaction, useValidation, useRetry, ValidationError } from "../hooks";

// Helper for delays to avoid nesting issues
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Example 1: Using useValidation hook for consistent validation patterns
 */
export async function validateAndProcessSite(siteData: Site): Promise<void> {
    const validation = useValidation();

    try {
        // Validate site configuration
        const siteResult = validation.validateSite(siteData);
        if (!siteResult.isValid) {
            throw new ValidationError(siteResult.errors);
        }

        // Validate each monitor
        for (const monitor of siteData.monitors || []) {
            const monitorResult = validation.validateMonitor(monitor);
            if (!monitorResult.isValid) {
                throw new ValidationError(monitorResult.errors);
            }
        }

        console.log("✓ Site validation passed");
    } catch (error) {
        if (error instanceof ValidationError) {
            console.error("❌ Validation failed:", error.errors);
        }
        throw error;
    }
}

/**
 * Example 2: Using useTransaction hook for database operations
 */
export async function createSiteWithTransaction(siteData: Site): Promise<void> {
    const transaction = useTransaction();

    try {
        await transaction(async (_db) => {
            // All database operations within this block are automatically
            // wrapped in a transaction with proper error handling and logging
            console.log("Creating site in transaction...");

            // Simulated database operations
            console.log(`Site ${siteData.identifier} created in database`);

            for (const monitor of siteData.monitors || []) {
                console.log(`Monitor ${monitor.type} created for site ${siteData.identifier}`);
            }

            // If any operation fails, the transaction will be automatically rolled back
        });

        console.log("✓ Site created successfully with all monitors");
    } catch (error) {
        console.error("❌ Transaction failed:", error);
        throw error;
    }
}

/**
 * Example 3: Using useRetry hook for resilient operations
 */
export async function fetchSiteWithRetry(identifier: string): Promise<Site | null> {
    const retry = useRetry();

    return retry(
        async () => {
            // Simulated network operation that might fail
            const randomFailure = Math.random() < 0.3; // 30% chance of failure

            if (randomFailure) {
                throw new Error("Network timeout");
            }

            // Simulated successful response
            const site: Site = {
                identifier,
                monitors: [],
                name: `Site ${identifier}`,
            };

            console.log(`✓ Successfully fetched site: ${identifier}`);
            return site;
        },
        {
            backoff: "exponential",
            delay: 1000,
            maxAttempts: 3,
        }
    );
}

/**
 * Example 4: Combining all hooks for comprehensive operation handling
 */
export async function comprehensiveOperation(siteData: Site): Promise<Site> {
    const validation = useValidation();
    const transaction = useTransaction();
    const retry = useRetry();

    // Use withValidation for streamlined validation + operation pattern
    return validation.withValidation(
        siteData,
        (data) => validation.validateSite(data as Site),
        () =>
            retry(
                () =>
                    transaction(async () => {
                        // Complex operation combining validation, retry, and transaction
                        console.log("Performing comprehensive operation...");

                        // Simulated complex database operations
                        await delay(100);

                        const processedSite: Site = {
                            ...siteData,
                            name: siteData.name || `Processed ${siteData.identifier}`,
                        };

                        console.log("✓ Comprehensive operation completed");
                        return processedSite;
                    }),
                {
                    backoff: "linear",
                    delay: 500,
                    maxAttempts: 2,
                }
            )
    );
}

/**
 * Example 5: Error handling patterns with hooks
 */
export async function demonstrateErrorHandling(): Promise<void> {
    const validation = useValidation();
    const retry = useRetry();

    try {
        // Example of validation error
        const invalidSite: Site = {
            identifier: "", // Invalid - empty identifier
            monitors: [],
        };

        await validation.withValidation(
            invalidSite,
            (data) => validation.validateSite(data as Site),
            async () => {
                console.log("This won't be reached due to validation failure");
            }
        );
    } catch (error) {
        if (error instanceof ValidationError) {
            console.log("✓ Caught validation error:", error.errors);
        }
    }

    try {
        // Example of retry exhaustion
        await retry(
            async () => {
                throw new Error("Always fails");
            },
            {
                backoff: "exponential",
                delay: 100,
                maxAttempts: 2,
            }
        );
    } catch (error) {
        console.log("✓ Caught retry exhaustion error:", error instanceof Error ? error.message : String(error));
    }
}

/**
 * Usage Documentation:
 *
 * These hooks provide several benefits:
 *
 * 1. **Consistency**: All operations use the same patterns for logging, error handling, and retries
 * 2. **Reusability**: Hooks can be used across different managers and services
 * 3. **Testability**: Hooks are easily mockable for unit testing
 * 4. **Observability**: Built-in correlation IDs and structured logging
 * 5. **Reliability**: Automatic retry logic and transaction management
 *
 * Best Practices:
 *
 * - Always use useValidation.withValidation for operations that need input validation
 * - Use useTransaction for any multi-step database operations
 * - Apply useRetry for operations that might fail due to temporary issues
 * - Combine hooks for comprehensive error handling and reliability
 * - Handle ValidationError specifically for better user experience
 */

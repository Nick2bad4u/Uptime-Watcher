/**
 * Shared interfaces and contracts for utility modules in the Electron backend.
 *
 * @remarks
 * Contains common interface definitions used across multiple utility files
 * providing consistent contracts for logging, error handling, and operations.
 * These interfaces ensure standardized behavior patterns throughout the backend
 * service layer. Logger interfaces are now imported from
 * shared/utils/logger/interfaces to ensure consistency between frontend and
 * backend logging.
 *
 * Key interfaces:
 *
 * - Logger: Standardized logging interface for consistent log formatting
 * - Error handling contracts for utilities and services
 * - Common operation patterns for backend utilities
 * - Shared contracts for service communication
 *
 * @example
 *
 * ```typescript
 * import { Logger } from "@shared/utils/logger/interfaces";
 *
 * class MyUtility {
 *     constructor(private logger: Logger) {}
 *
 *     async performOperation(): Promise<void> {
 *         this.logger.info("Starting operation");
 *         try {
 *             // Operation logic
 *             this.logger.debug("Operation completed successfully");
 *         } catch (error) {
 *             this.logger.error("Operation failed", error);
 *             throw error;
 *         }
 *     }
 * }
 * ```
 *
 * @packageDocumentation
 */

// This file serves as documentation for interface usage in the backend.
// All logger interfaces are now imported from @shared/utils/logger/interfaces
// to ensure consistency between frontend and backend logging.
//
// For logger interfaces, import directly from the shared module:
// import type { Logger } from "@shared/utils/logger/interfaces";

/**
 * Placeholder export to satisfy module requirements. All actual logger
 * interfaces are now defined in the shared module at
 * shared/utils/logger/interfaces.
 */
export const BACKEND_INTERFACES_DOC: string =
    "Use @shared/utils/logger/interfaces for logger types";

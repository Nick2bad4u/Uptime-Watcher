/**
 * Backend hooks module exports.
 * Provides centralized access to all operational hooks.
 */

export { generateCorrelationId, ValidationError } from "./correlationUtils";
export { useRetry } from "./useRetry";
export type { RetryOptions } from "./useRetry";
export { useTransaction } from "./useTransaction";
export { useValidation } from "./useValidation";

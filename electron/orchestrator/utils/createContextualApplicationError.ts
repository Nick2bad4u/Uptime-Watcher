import type { Logger } from "@shared/utils/logger/interfaces";

import {
    ApplicationError,
    type ApplicationErrorOptions,
} from "@shared/utils/errorHandling";

/**
 * Input for {@link createContextualApplicationError}.
 */
export interface CreateContextualApplicationErrorInput {
    /** Original thrown value. */
    readonly cause: unknown;
    /** Stable code used for grouping/telemetry. */
    readonly code: string;
    /** Additional structured metadata. */
    readonly details?: Record<string, unknown>;
    /** Diagnostics logger used for deeper debugging signals. */
    readonly diagnosticsLogger: Logger;
    /** Prefix included with diagnostics messages (defaults to "[Orchestrator]"). */
    readonly diagnosticsPrefix?: string;
    /** Primary logger used for user-facing / general logs. */
    readonly logger: Logger;
    /** Human readable message. */
    readonly message: string;
    /** Operation name for debugging/correlation. */
    readonly operation: string;
}

/**
 * Creates an {@link ApplicationError} and logs it with standardized context.
 *
 * @remarks
 * This helper centralizes the orchestrator-style error normalization + logging
 * so orchestrator modules stay focused on coordination logic.
 */
export function createContextualApplicationError(
    input: CreateContextualApplicationErrorInput
): ApplicationError {
    const {
        cause,
        code,
        details,
        diagnosticsLogger,
        diagnosticsPrefix = "[Orchestrator]",
        logger,
        message,
        operation,
    } = input;

    const errorOptions: ApplicationErrorOptions = {
        cause,
        code,
        message,
        operation,
        ...(details ? { details } : {}),
    };

    const appError = new ApplicationError(errorOptions);

    logger.error(appError.message, {
        code,
        details,
        error: cause,
        operation,
    });

    diagnosticsLogger.error(`${diagnosticsPrefix} ${operation} failed`, {
        code,
        details,
        error: appError,
    });

    return appError;
}

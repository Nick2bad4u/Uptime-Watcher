import type { ApplicationError } from "@shared/utils/errorHandling";
import type { Logger } from "@shared/utils/logger/interfaces";
import type { UnknownRecord } from "type-fest";

import { createContextualApplicationError } from "./createContextualApplicationError";

/**
 * Input contract for contextual error creation.
 */
export interface ContextualErrorInput {
    /** Original thrown value. */
    readonly cause: unknown;
    /** Stable error code used for grouping/telemetry. */
    readonly code: string;
    /** Additional structured metadata. */
    readonly details?: UnknownRecord;
    /** Human-readable error message. */
    readonly message: string;
    /** Operation name for debugging/correlation. */
    readonly operation: string;
}

/**
 * Factory signature for producing contextual {@link ApplicationError} instances.
 */
export type ContextualErrorFactory = (
    input: ContextualErrorInput
) => ApplicationError;

/**
 * Dependencies required to construct a contextual error factory.
 */
export interface ContextualErrorFactoryOptions {
    /** Diagnostics logger used for deep debugging signals. */
    readonly diagnosticsLogger: Logger;
    /** Optional prefix included with diagnostics messages. */
    readonly diagnosticsPrefix?: string;
    /** Primary logger used for user-facing / general logs. */
    readonly logger: Logger;
}

/**
 * Builds a reusable contextual error factory for orchestrator modules.
 */
export function createContextualErrorFactory(
    options: ContextualErrorFactoryOptions
): ContextualErrorFactory {
    return (input: ContextualErrorInput): ApplicationError =>
        createContextualApplicationError({
            ...input,
            diagnosticsLogger: options.diagnosticsLogger,
            ...(options.diagnosticsPrefix === undefined
                ? {}
                : { diagnosticsPrefix: options.diagnosticsPrefix }),
            logger: options.logger,
        });
}

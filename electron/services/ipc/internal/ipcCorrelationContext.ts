/**
 * IPC correlation envelope helpers.
 */

import type { CorrelationId } from "@shared/types/events";

import { isIpcCorrelationEnvelope } from "@shared/types/ipc";

/** Parsed correlation context extracted from an IPC invoke argument list. */
export interface ExtractedIpcContext {
    readonly args: readonly unknown[];
    readonly correlationId?: CorrelationId;
}

/**
 * Extracts correlation metadata from the final IPC argument when present.
 */
export function extractIpcCorrelationContext(
    args: readonly unknown[]
): ExtractedIpcContext {
    const correlationEnvelope = args.at(-1);

    if (isIpcCorrelationEnvelope(correlationEnvelope)) {
        const envelope = correlationEnvelope;
        return {
            args: args.slice(0, -1),
            correlationId: envelope.correlationId,
        };
    }

    return { args };
}

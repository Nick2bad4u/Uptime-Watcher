/**
 * IPC correlation envelope helpers.
 */

import type { CorrelationId } from "@shared/types/events";
import type { UnknownArray } from "type-fest";

import { isIpcCorrelationEnvelope } from "@shared/types/ipc";
import { arrayAt } from "ts-extras";

/** Parsed correlation context extracted from an IPC invoke argument list. */
export interface ExtractedIpcContext {
    readonly args: Readonly<UnknownArray>;
    readonly correlationId?: CorrelationId;
}

/**
 * Extracts correlation metadata from the final IPC argument when present.
 */
export function extractIpcCorrelationContext(
    args: Readonly<UnknownArray>
): ExtractedIpcContext {
    const correlationEnvelope = arrayAt(args, -1);

    if (isIpcCorrelationEnvelope(correlationEnvelope)) {
        const envelope = correlationEnvelope;
        return {
            args: args.slice(0, -1),
            correlationId: envelope.correlationId,
        };
    }

    return { args };
}

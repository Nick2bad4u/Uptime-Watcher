/**
 * @module eventMetadataGuards
 * Shared type guards for typed event metadata.
 */

import type { EventMetadata } from "@shared/types/events";

/**
 * Determines whether the provided value conforms to {@link EventMetadata}.
 *
 * @public
 */
export function isEventMetadata(value: unknown): value is EventMetadata {
    if (!value || typeof value !== "object") {
        return false;
    }

    const candidate = value as Partial<EventMetadata>;

    return (
        typeof candidate.busId === "string" &&
        typeof candidate.correlationId === "string" &&
        typeof candidate.eventName === "string" &&
        typeof candidate.timestamp === "number"
    );
}

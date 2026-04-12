/**
 * @module eventMetadataGuards
 * Shared type guards for typed event metadata.
 */

import type { EventMetadata } from "@shared/types/events";

import { isRecord } from "@shared/utils/typeHelpers";

/**
 * Determines whether the provided value conforms to {@link EventMetadata}.
 *
 * @public
 */
export function isEventMetadata(value: unknown): value is EventMetadata {
    if (!isRecord(value)) {
        return false;
    }

    return (
        typeof value["busId"] === "string" &&
        typeof value["correlationId"] === "string" &&
        typeof value["eventName"] === "string" &&
        typeof value["timestamp"] === "number"
    );
}

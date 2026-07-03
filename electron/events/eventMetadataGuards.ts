/**
 * @module eventMetadataGuards
 * Shared type guards for typed event metadata.
 */

import type { EventMetadata } from "@shared/types/events";

import { eventMetadataSchema } from "@shared/types/events";

/**
 * Determines whether the provided value conforms to {@link EventMetadata}.
 *
 * @public
 */
export function isEventMetadata(value: unknown): value is EventMetadata {
    return eventMetadataSchema.safeParse(value).success;
}

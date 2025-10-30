/**
 * @module EventMetadataForwarding
 * Utilities for forwarding typed event metadata from internal events.
 */

import type { EventMetadata } from "@shared/types/events";

import { ORIGINAL_METADATA_SYMBOL } from "../events/TypedEventBus";

/** Metadata property key used when forwarding typed event metadata. */
export const FORWARDED_METADATA_PROPERTY_KEY = "_meta" as const;
/** Metadata property key used to preserve original event metadata. */
export const ORIGINAL_METADATA_PROPERTY_KEY = "_originalMeta" as const;

/**
 * Parameters for attaching forwarded metadata to an event payload.
 */
interface AttachForwardedMetadataParams<TPayload extends object> {
    /** Identifier of the event bus emitting the forwarded event. */
    busId: string;
    /** Public event name that metadata should reflect. */
    forwardedEvent: string;
    /** Payload being forwarded to renderer listeners. */
    payload: TPayload;
    /** Internal event payload that may contain metadata. */
    source: unknown;
}

/**
 * Determines whether the provided value conforms to {@link EventMetadata}.
 */
function isEventMetadataCandidate(value: unknown): value is EventMetadata {
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

/**
 * Attaches existing metadata from an internal event to the forwarded payload.
 *
 * @param params - Forwarding configuration.
 *
 * @returns The original payload reference with metadata forwarding applied.
 */
export function attachForwardedMetadata<TPayload extends object>(
    params: AttachForwardedMetadataParams<TPayload>
): TPayload {
    const { busId, forwardedEvent, payload, source } = params;

    if (typeof source !== "object" || source === null) {
        return payload;
    }

    if (!Reflect.has(source, FORWARDED_METADATA_PROPERTY_KEY)) {
        return payload;
    }

    const metaCandidate = Reflect.get(
        source,
        FORWARDED_METADATA_PROPERTY_KEY
    ) as unknown;

    if (!isEventMetadataCandidate(metaCandidate)) {
        return payload;
    }

    const originalMetaCandidate = Reflect.has(
        source,
        ORIGINAL_METADATA_PROPERTY_KEY
    )
        ? (Reflect.get(source, ORIGINAL_METADATA_PROPERTY_KEY) as unknown)
        : undefined;

    const originalMeta = isEventMetadataCandidate(originalMetaCandidate)
        ? originalMetaCandidate
        : metaCandidate;

    const forwardedMetadata: EventMetadata = {
        busId,
        correlationId: originalMeta.correlationId,
        eventName: forwardedEvent,
        timestamp: Date.now(),
    };

    Object.defineProperty(payload, ORIGINAL_METADATA_SYMBOL, {
        configurable: true,
        enumerable: false,
        value: originalMeta,
        writable: false,
    });

    Object.defineProperty(payload, ORIGINAL_METADATA_PROPERTY_KEY, {
        configurable: true,
        enumerable: false,
        value: originalMeta,
        writable: false,
    });

    Object.defineProperty(payload, FORWARDED_METADATA_PROPERTY_KEY, {
        configurable: true,
        enumerable: false,
        value: forwardedMetadata,
        writable: false,
    });

    return payload;
}

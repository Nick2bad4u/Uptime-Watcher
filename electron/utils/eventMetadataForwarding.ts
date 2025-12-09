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

export const isEventMetadata: (value: unknown) => value is EventMetadata =
    isEventMetadataCandidate;

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

/**
 * Produces a shallow clone of the provided payload with event-bus metadata
 * properties removed.
 *
 * @remarks
 * Internal event buses attach metadata on the `_meta`, `_originalMeta`, and
 * {@link ORIGINAL_METADATA_SYMBOL} properties. When forwarding these payloads
 * across process or layer boundaries (for example, from the orchestrator to the
 * renderer), consumers often need a clean view of the domain payload without
 * bus-specific metadata.
 *
 * This helper centralises that stripping logic so multiple callers do not
 * duplicate knowledge of the metadata property keys.
 *
 * @param payload - Payload that may carry forwarded metadata. Must be an array
 *   or an object; primitives are rejected at runtime.
 *
 * @returns A shallow clone of {@link payload} with metadata properties removed.
 *   The original object is never mutated.
 *
 * @throws TypeError If a primitive payload (non-object, non-array) is provided.
 *   Event metadata is only attached to object or array payloads, so attempting
 *   to strip metadata from primitives usually indicates a programming error.
 */
export function stripForwardedEventMetadata(
    payload: object | readonly unknown[]
): object | readonly unknown[] {
    if (Array.isArray(payload)) {
        // After the Array.isArray check we know payload is an array. Narrow to a
        // readonly array for Array.from while preserving element types.

        const arrayPayload = payload as readonly unknown[];
        const clonedArray = Array.from(arrayPayload);

        Reflect.deleteProperty(clonedArray, FORWARDED_METADATA_PROPERTY_KEY);
        Reflect.deleteProperty(clonedArray, ORIGINAL_METADATA_PROPERTY_KEY);
        Reflect.deleteProperty(clonedArray, ORIGINAL_METADATA_SYMBOL);

        return clonedArray;
    }

    if (Object(payload) !== payload) {
        throw new TypeError(
            "Unexpected primitive payload when stripping metadata"
        );
    }

    // At this point payload is a non-null object. Clone into a plain record to
    // strip well-known metadata keys while preserving the remaining shape.

    const clonedPayload: Record<PropertyKey, unknown> = {
        ...(payload as object),
    };

    if (Reflect.has(clonedPayload, FORWARDED_METADATA_PROPERTY_KEY)) {
        Reflect.deleteProperty(clonedPayload, FORWARDED_METADATA_PROPERTY_KEY);
    }

    if (Reflect.has(clonedPayload, ORIGINAL_METADATA_PROPERTY_KEY)) {
        Reflect.deleteProperty(clonedPayload, ORIGINAL_METADATA_PROPERTY_KEY);
    }

    if (Reflect.has(clonedPayload, ORIGINAL_METADATA_SYMBOL)) {
        Reflect.deleteProperty(clonedPayload, ORIGINAL_METADATA_SYMBOL);
    }

    return clonedPayload;
}

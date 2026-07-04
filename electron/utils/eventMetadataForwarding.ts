/**
 * @module EventMetadataForwarding
 * Utilities for forwarding typed event metadata from internal events.
 */

import type { EventMetadata } from "@shared/types/events";
import type { Except, UnknownArray, UnknownRecord } from "type-fest";

import { createNullPrototypeObject } from "@shared/utils/objectSafety";
import { castUnchecked } from "@shared/utils/typeHelpers";

import { isEventMetadata as isEventMetadataGuard } from "../events/eventMetadataGuards";
import { ORIGINAL_METADATA_SYMBOL } from "../events/TypedEventBus";

/**
 * Determines whether the provided value conforms to {@link EventMetadata}.
 *
 * @public
 */
export const isEventMetadata = (value: unknown): value is EventMetadata =>
    isEventMetadataGuard(value);

/** Metadata property key used when forwarding typed event metadata. */
export const FORWARDED_METADATA_PROPERTY_KEY = "_meta" as const;
/** Metadata property key used to preserve original event metadata. */
export const ORIGINAL_METADATA_PROPERTY_KEY = "_originalMeta" as const;

type ForwardedMetadataKey =
    | typeof FORWARDED_METADATA_PROPERTY_KEY
    | typeof ORIGINAL_METADATA_PROPERTY_KEY
    | typeof ORIGINAL_METADATA_SYMBOL;

export function readOwnForwardedMetadataValue(
    source: object,
    key: ForwardedMetadataKey
): unknown {
    const descriptor = Object.getOwnPropertyDescriptor(source, key);
    return descriptor && "value" in descriptor ? descriptor.value : undefined;
}

function isForwardedMetadataKey(key: PropertyKey): boolean {
    return (
        key === FORWARDED_METADATA_PROPERTY_KEY ||
        key === ORIGINAL_METADATA_PROPERTY_KEY ||
        key === ORIGINAL_METADATA_SYMBOL
    );
}

function cloneArrayPayloadWithoutMetadata(
    payload: Readonly<UnknownArray>
): unknown[] {
    const lengthDescriptor = Object.getOwnPropertyDescriptor(payload, "length");
    const length =
        typeof lengthDescriptor?.value === "number" &&
        Number.isSafeInteger(lengthDescriptor.value) &&
        lengthDescriptor.value >= 0
            ? lengthDescriptor.value
            : 0;
    const clonedArray = Array.from<unknown>({ length });

    for (const key of Reflect.ownKeys(payload)) {
        if (key === "length" || isForwardedMetadataKey(key)) {
            continue;
        }

        const descriptor = Object.getOwnPropertyDescriptor(payload, key);
        if (!descriptor?.enumerable || !("value" in descriptor)) {
            continue;
        }

        Object.defineProperty(clonedArray, key, {
            configurable: true,
            enumerable: true,
            value: descriptor.value,
            writable: true,
        });
    }

    return clonedArray;
}

type StrippedForwardedEventMetadata<TPayload> =
    TPayload extends Readonly<UnknownArray>
        ? TPayload
        : TPayload extends object
          ? Except<TPayload, Extract<ForwardedMetadataKey, keyof TPayload>>
          : never;

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

    const metaCandidate = readOwnForwardedMetadataValue(
        source,
        FORWARDED_METADATA_PROPERTY_KEY
    );

    if (!isEventMetadataGuard(metaCandidate)) {
        return payload;
    }

    const originalMetaCandidate = readOwnForwardedMetadataValue(
        source,
        ORIGINAL_METADATA_PROPERTY_KEY
    );

    const originalMeta = isEventMetadataGuard(originalMetaCandidate)
        ? originalMetaCandidate
        : metaCandidate;

    const forwardedMetadata: EventMetadata = {
        busId,
        correlationId: originalMeta.correlationId,
        eventName: forwardedEvent,
        timestamp: Date.now(),
    };

    Object.defineProperties(payload, {
        [ORIGINAL_METADATA_SYMBOL]: {
            configurable: true,
            enumerable: false,
            value: originalMeta,
            writable: false,
        },
        [ORIGINAL_METADATA_PROPERTY_KEY]: {
            configurable: true,
            enumerable: false,
            value: originalMeta,
            writable: false,
        },
        [FORWARDED_METADATA_PROPERTY_KEY]: {
            configurable: true,
            enumerable: false,
            value: forwardedMetadata,
            writable: false,
        },
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
 * For object payloads, the return type is {@link Omit} of `_meta` and
 * `_originalMeta`. For array payloads, the same array type is returned.
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
export function stripForwardedEventMetadata<
    TPayload extends object | Readonly<UnknownArray>,
>(payload: TPayload): StrippedForwardedEventMetadata<TPayload> {
    if (Array.isArray(payload)) {
        return castUnchecked<StrippedForwardedEventMetadata<TPayload>>(
            cloneArrayPayloadWithoutMetadata(payload)
        );
    }

    const candidate: unknown = payload;

    if (typeof candidate !== "object" || candidate === null) {
        throw new TypeError(
            "Expected object/array payload for metadata stripping"
        );
    }

    // At this point payload is a non-null object. Clone own enumerable data
    // properties into a null-prototype record while skipping event-bus
    // metadata. This intentionally ignores accessors so forwarding cannot
    // execute arbitrary getters while stripping metadata.
    const clonedPayload =
        createNullPrototypeObject<Record<PropertyKey, unknown>>();
    for (const key of Reflect.ownKeys(payload)) {
        if (isForwardedMetadataKey(key)) {
            continue;
        }

        const descriptor = Object.getOwnPropertyDescriptor(payload, key);
        if (!descriptor?.enumerable || !("value" in descriptor)) {
            continue;
        }

        Object.defineProperty(clonedPayload, key, {
            configurable: true,
            enumerable: true,
            value: descriptor.value,
            writable: true,
        });
    }

    return castUnchecked<StrippedForwardedEventMetadata<TPayload>>(
        castUnchecked<UnknownRecord>(clonedPayload)
    );
}

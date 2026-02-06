/**
 * Internal payload helpers used by {@link TypedEventBus}.
 *
 * @remarks
 * This module centralizes cloning and metadata-carrier logic so the main event
 * bus implementation can stay focused on orchestration rather than low-level
 * object manipulation.
 */

import type { EventMetadata } from "@shared/types/events";

import { castUnchecked } from "@shared/utils/typeHelpers";

import { isEventMetadata } from "../eventMetadataGuards";
import { tryStructuredClone } from "./structuredClone";

interface MetaCarrier {
    readonly _meta: EventMetadata;
}

interface OriginalMetaCarrier {
    readonly _originalMeta: EventMetadata;
}

/**
 * Read-only array payload supported by the event bus.
 *
 * @internal
 */
export type ArrayPayload = readonly unknown[] | unknown[];

/**
 * Non-array object payload shape used to distinguish plain objects from arrays.
 *
 * @internal
 */
export type NonArrayObjectPayload = Record<string, unknown> & {
    readonly length?: never;
};

/**
 * Resolves the first valid {@link EventMetadata} entry from a list of candidate
 * values.
 */
export function resolveOriginalMetadata(
    ...candidates: readonly unknown[]
): EventMetadata | undefined {
    return candidates.find(isEventMetadata);
}

/**
 * Defines a non-writable, non-configurable property on an object.
 */
export function defineHiddenProperty(
    target: object,
    key: string | symbol,
    value: unknown,
    options?: { enumerable?: boolean }
): void {
    Object.defineProperty(target, key, {
        configurable: false,
        enumerable: options?.enumerable ?? true,
        value,
        writable: false,
    });
}

/**
 * Reads a hidden property value if it exists.
 */
export function getHiddenProperty(
    target: NonArrayObjectPayload,
    key: string | symbol
): unknown {
    if (!Reflect.has(target, key)) {
        return undefined;
    }

    return Reflect.get(target, key);
}

export const attachMetadata: <TPayload extends object>(
    payload: TPayload,
    metadata: EventMetadata,
    options?: { enumerable?: boolean }
) => asserts payload is MetaCarrier & TPayload = (
    payload,
    metadata,
    options
) => {
    defineHiddenProperty(payload, "_meta", metadata, options);
};

export const attachOriginalMetadata: <TPayload extends object>(
    payload: TPayload,
    metadata: EventMetadata
) => asserts payload is OriginalMetaCarrier & TPayload = (
    payload,
    metadata
) => {
    defineHiddenProperty(payload, "_originalMeta", metadata);
};

/**
 * Clones an array payload.
 *
 * @remarks
 * Uses {@link structuredClone} when available and falls back to `Array.from`
 * when cloning fails.
 */
export function cloneArrayPayload<TPayload extends ArrayPayload>(
    payload: TPayload
): TPayload {
    const structuredCloneResult = tryStructuredClone<TPayload>(payload);
    if (structuredCloneResult !== undefined) {
        return structuredCloneResult;
    }

    // Fall back to manual cloning for non-cloneable payload entries (e.g.
    // functions).
    return castUnchecked<TPayload>(Array.from(payload));
}

/**
 * Clones a non-array object payload while preserving its prototype.
 *
 * @remarks
 * Uses {@link structuredClone} when available and falls back to a shallow clone
 * when cloning fails.
 */
export function cloneObjectPayload<TPayload extends NonArrayObjectPayload>(
    payload: TPayload
): TPayload {
    const structuredCloneResult = tryStructuredClone<TPayload>(payload);
    if (structuredCloneResult !== undefined) {
        return structuredCloneResult;
    }

    const prototype = Reflect.getPrototypeOf(payload) ?? Object.prototype;
    const clone: NonArrayObjectPayload = { ...payload };
    Reflect.setPrototypeOf(clone, prototype);
    return castUnchecked<TPayload>(clone);
}

/**
 * Internal payload helpers used by
 * {@link electron/events/TypedEventBus#TypedEventBus}.
 *
 * @remarks
 * This module centralizes cloning and metadata-carrier logic so the main event
 * bus implementation can stay focused on orchestration rather than low-level
 * object manipulation.
 */

import type { EventMetadata } from "@shared/types/events";
import type { UnknownArray, UnknownRecord } from "type-fest";

import { getOwnDataProperty } from "@shared/utils/errorPropertyAccess";
import { castUnchecked } from "@shared/utils/typeHelpers";
import { isDefined } from "ts-extras";

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
export type ArrayPayload = Readonly<UnknownArray> | unknown[];

/**
 * Non-array object payload shape used to distinguish plain objects from arrays.
 *
 * @internal
 */
export type NonArrayObjectPayload = UnknownRecord & {
    readonly length?: never;
};

/**
 * Resolves the first valid {@link EventMetadata} entry from a list of candidate
 * values.
 */
export function resolveOriginalMetadata(
    ...candidates: Readonly<UnknownArray>
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
    const property = getOwnDataProperty(target, key);

    return property.found ? property.value : undefined;
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
    if (!hasOwnAccessorProperties(payload)) {
        const structuredCloneResult = tryStructuredClone(payload);
        if (isDefined(structuredCloneResult)) {
            return structuredCloneResult;
        }
    }

    // Fall back to manual cloning for non-cloneable payload entries (e.g.
    // functions).
    const clone: unknown[] = [];
    clone.length = payload.length;
    for (const key of Reflect.ownKeys(payload)) {
        if (!isArrayIndexKey(key)) {
            continue;
        }

        const descriptor = Object.getOwnPropertyDescriptor(payload, key);
        if (!descriptor?.enumerable || !("value" in descriptor)) {
            continue;
        }

        defineDataProperty(clone, key, descriptor.value);
    }

    return castUnchecked<TPayload>(clone);
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
    if (!hasOwnAccessorProperties(payload)) {
        const structuredCloneResult = tryStructuredClone(payload);
        if (isDefined(structuredCloneResult)) {
            return structuredCloneResult;
        }
    }

    const prototype = Reflect.getPrototypeOf(payload) ?? Object.prototype;
    const clone = castUnchecked<NonArrayObjectPayload>(
        Object.create(prototype)
    );
    for (const key of Reflect.ownKeys(payload)) {
        const descriptor = Object.getOwnPropertyDescriptor(payload, key);
        if (!descriptor?.enumerable || !("value" in descriptor)) {
            continue;
        }

        defineDataProperty(clone, key, descriptor.value);
    }

    return castUnchecked<TPayload>(clone);
}

function hasOwnAccessorProperties(value: object): boolean {
    for (const key of Reflect.ownKeys(value)) {
        const descriptor = Object.getOwnPropertyDescriptor(value, key);
        if (
            descriptor &&
            ("get" in descriptor || "set" in descriptor) &&
            !("value" in descriptor)
        ) {
            return true;
        }
    }

    return false;
}

function defineDataProperty(
    target: object,
    key: PropertyKey,
    value: unknown
): void {
    Object.defineProperty(target, key, {
        configurable: true,
        enumerable: true,
        value,
        writable: true,
    });
}

function isArrayIndexKey(key: PropertyKey): key is `${number}` {
    if (typeof key !== "string" || key.length === 0) {
        return false;
    }

    const index = Number(key);
    return (
        Number.isInteger(index) &&
        index >= 0 &&
        index < 4_294_967_295 &&
        String(index) === key
    );
}

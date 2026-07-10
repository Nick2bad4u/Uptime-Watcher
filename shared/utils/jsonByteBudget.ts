/**
 * Approximate JSON byte budgeting utilities.
 *
 * @remarks
 * Used as a defense-in-depth guard before sending potentially large snapshots
 * (e.g. state sync payloads) across process boundaries.
 *
 * The estimate is conservative and stops early once the budget is exceeded.
 */

import { isRecord } from "@shared/utils/typeHelpers";
import { getUtfByteLength } from "@shared/utils/utfByteLength";
import { getOwnDataProperty } from "./errorPropertyAccess";
import {
    isDefined,
    isFinite as isFiniteNumber,
    objectHasIn,
    objectKeys,
} from "ts-extras";

const JSON_BYTE_BUDGET_LEAVE = Symbol("json-byte-budget-leave");
const INVALID_DATE_JSON_VALUE = "[Invalid Date]" as const;
const UNSERIALIZABLE_OBJECT_JSON_VALUE = "[Unserializable Object]" as const;

type NativeGetter = (this: unknown) => unknown;
type NativeMethod = (this: unknown) => unknown;

function isNativeFunction(
    value: unknown
): value is NativeGetter & NativeMethod {
    return typeof value === "function";
}

function getPrototypeObject(value: object): object | null {
    const prototype: unknown = Object.getPrototypeOf(value);

    return typeof prototype === "object" && prototype !== null
        ? prototype
        : null;
}

function getNativeGetter(
    holder: object,
    key: PropertyKey
): NativeGetter | undefined {
    let current: object | null = holder;

    while (current) {
        const descriptor = Object.getOwnPropertyDescriptor(current, key);
        const getter = descriptor
            ? getOwnDataProperty(descriptor, "get")
            : { found: false as const };
        if (getter.found && isNativeFunction(getter.value)) {
            return getter.value;
        }

        current = getPrototypeObject(current);
    }

    return undefined;
}

function getNativeMethod(
    holder: object,
    key: PropertyKey
): NativeMethod | undefined {
    let current: object | null = holder;

    while (current) {
        const descriptor = Object.getOwnPropertyDescriptor(current, key);
        if (
            descriptor &&
            "value" in descriptor &&
            isNativeFunction(descriptor.value)
        ) {
            return descriptor.value;
        }

        current = getPrototypeObject(current);
    }

    return undefined;
}

const DATE_GET_TIME = getNativeMethod(Date.prototype, "getTime");
const DATE_TO_ISO_STRING = getNativeMethod(Date.prototype, "toISOString");
const TYPED_ARRAY_PROTOTYPE =
    getPrototypeObject(Uint8Array.prototype) ?? Uint8Array.prototype;
const ARRAY_BUFFER_BYTE_LENGTH = getNativeGetter(
    ArrayBuffer.prototype,
    "byteLength"
);
const DATA_VIEW_BYTE_LENGTH = getNativeGetter(DataView.prototype, "byteLength");
const TYPED_ARRAY_BYTE_LENGTH = getNativeGetter(
    TYPED_ARRAY_PROTOTYPE,
    "byteLength"
);
const URL_TO_STRING = getNativeMethod(URL.prototype, "toString");

interface JsonByteBudgetState {
    bytes: number;
    readonly maxBytes: number;
    /** Tracks objects currently on the traversal path to detect cycles only. */
    readonly path: WeakSet<object>;
    readonly stack: unknown[];
}

interface LeaveMarker {
    readonly [JSON_BYTE_BUDGET_LEAVE]: object;
}

/**
 * Returns a conservative estimate of JSON UTF-8 byte length, stopping early
 * once the budget is exceeded.
 */
export function getJsonByteLengthUpTo(
    value: unknown,
    maxBytes: number
): number {
    if (!isFiniteNumber(maxBytes) || maxBytes <= 0) {
        return 0;
    }

    const state: JsonByteBudgetState = {
        bytes: 0,
        maxBytes,
        path: new WeakSet<object>(),
        stack: [value],
    };

    while (state.stack.length > 0 && !isBudgetExceeded(state)) {
        const next = state.stack.pop();
        addJsonBytesForValue(state, next);
    }

    return state.bytes;
}

/** Returns true when {@link getJsonByteLengthUpTo} exceeds `maxBytes`. */
export function isJsonByteBudgetExceeded(
    value: unknown,
    maxBytes: number
): boolean {
    return getJsonByteLengthUpTo(value, maxBytes) > maxBytes;
}

function addBytes(state: JsonByteBudgetState, increment: number): void {
    state.bytes += increment;
}

function addJsonBytesForObject(
    state: JsonByteBudgetState,
    value: object
): void {
    if (value instanceof Date) {
        addBytes(state, getJsonBytesForDate(value));
        return;
    }

    if (value instanceof URL) {
        addBytes(state, getJsonBytesForUrl(value));
        return;
    }

    if (value instanceof ArrayBuffer) {
        addBytes(
            state,
            getNativeByteLength(value, ARRAY_BUFFER_BYTE_LENGTH) ??
                state.maxBytes + 1
        );
        return;
    }

    if (ArrayBuffer.isView(value)) {
        addBytes(
            state,
            getNativeByteLength(value, getByteLengthGetterForView(value)) ??
                state.maxBytes + 1
        );
        return;
    }

    const isArray = Array.isArray(value);

    // Detect only true cycles (the same object encountered again while still
    // on the current traversal path). Shared references are valid in JSON and
    // structured clone payloads and must not be treated as overflow.
    if (state.path.has(value)) {
        addBytes(state, state.maxBytes + 1);
        return;
    }

    state.path.add(value);
    state.stack.push({ [JSON_BYTE_BUDGET_LEAVE]: value });

    if (isArray) {
        addBytes(state, 2);
        if (value.length > 1) {
            addBytes(state, value.length - 1);
        }

        for (let i = value.length - 1; i >= 0; i--) {
            const key = String(i);
            const descriptor = Object.getOwnPropertyDescriptor(value, key);
            if (!descriptor) {
                if (Reflect.has(value, key)) {
                    addBytes(state, state.maxBytes + 1);
                    return;
                }

                state.stack.push(undefined);
                continue;
            }

            if (!("value" in descriptor)) {
                addBytes(state, state.maxBytes + 1);
                return;
            }

            state.stack.push(descriptor.value);
        }

        return;
    }

    if (!isRecord(value)) {
        addBytes(state, state.maxBytes + 1);
        return;
    }

    addBytes(state, 2);

    const record = value;
    const keys = objectKeys(record);

    if (keys.length > 1) {
        addBytes(state, keys.length - 1);
    }

    for (let i = keys.length - 1; i >= 0; i--) {
        const key = keys[i];
        if (!isDefined(key)) {
            addBytes(state, state.maxBytes + 1);
            return;
        }

        const descriptor = Object.getOwnPropertyDescriptor(record, key);
        if (!descriptor || !("value" in descriptor)) {
            addBytes(state, state.maxBytes + 1);
            return;
        }

        addBytes(state, getJsonBytesForObjectKey(key));
        state.stack.push(descriptor.value);
    }
}

function addJsonBytesForValue(
    state: JsonByteBudgetState,
    value: unknown
): void {
    if (isLeaveMarker(value)) {
        state.path.delete(value[JSON_BYTE_BUDGET_LEAVE]);
        return;
    }

    if (value === null) {
        addBytes(state, getJsonBytesForNull());
        return;
    }

    if (typeof value === "string") {
        addBytes(state, getJsonBytesForString(value));
        return;
    }

    if (typeof value === "number") {
        addBytes(state, getJsonBytesForNumber(value));
        return;
    }

    if (typeof value === "boolean") {
        addBytes(state, value ? 4 : 5);
        return;
    }

    if (!isDefined(value)) {
        addBytes(state, getJsonBytesForNull());
        return;
    }

    if (
        typeof value === "bigint" ||
        typeof value === "function" ||
        typeof value === "symbol"
    ) {
        addBytes(state, state.maxBytes + 1);
        return;
    }

    if (typeof value !== "object") {
        addBytes(state, state.maxBytes + 1);
        return;
    }

    addJsonBytesForObject(state, value);
}

function getJsonBytesForNull(): number {
    return 4;
}

function getJsonBytesForNumber(value: number): number {
    return getUtfByteLength(JSON.stringify(value));
}

function getJsonBytesForDate(value: Date): number {
    if (!DATE_GET_TIME || !DATE_TO_ISO_STRING) {
        return getJsonBytesForString(INVALID_DATE_JSON_VALUE);
    }

    let timestamp: unknown;
    try {
        timestamp = Reflect.apply(DATE_GET_TIME, value, []);
    } catch {
        return getJsonBytesForString(INVALID_DATE_JSON_VALUE);
    }

    if (typeof timestamp !== "number" || !isFiniteNumber(timestamp)) {
        return getJsonBytesForString(INVALID_DATE_JSON_VALUE);
    }

    try {
        const serialized: unknown = Reflect.apply(
            DATE_TO_ISO_STRING,
            value,
            []
        );
        return getJsonBytesForString(
            typeof serialized === "string"
                ? serialized
                : INVALID_DATE_JSON_VALUE
        );
    } catch {
        return getJsonBytesForString(INVALID_DATE_JSON_VALUE);
    }
}

function getJsonBytesForUrl(value: URL): number {
    if (!URL_TO_STRING) {
        return getJsonBytesForString(UNSERIALIZABLE_OBJECT_JSON_VALUE);
    }

    try {
        const serialized: unknown = Reflect.apply(URL_TO_STRING, value, []);
        return getJsonBytesForString(
            typeof serialized === "string"
                ? serialized
                : UNSERIALIZABLE_OBJECT_JSON_VALUE
        );
    } catch {
        return getJsonBytesForString(UNSERIALIZABLE_OBJECT_JSON_VALUE);
    }
}

function getNativeByteLength(
    value: ArrayBuffer | ArrayBufferView,
    byteLength: NativeGetter | undefined
): number | undefined {
    if (!byteLength) {
        return undefined;
    }

    try {
        const valueByteLength: unknown = Reflect.apply(byteLength, value, []);
        return typeof valueByteLength === "number" &&
            Number.isSafeInteger(valueByteLength) &&
            valueByteLength >= 0
            ? valueByteLength
            : undefined;
    } catch {
        return undefined;
    }
}

function getByteLengthGetterForView(
    value: ArrayBufferView
): NativeGetter | undefined {
    return value instanceof DataView
        ? DATA_VIEW_BYTE_LENGTH
        : TYPED_ARRAY_BYTE_LENGTH;
}

function getJsonBytesForString(value: string): number {
    return getUtfByteLength(JSON.stringify(value));
}

function getJsonBytesForObjectKey(value: string): number {
    // JSON object entries encode as `"key":value`.
    return getJsonBytesForString(value) + 1;
}

function isBudgetExceeded(state: JsonByteBudgetState): boolean {
    return state.bytes > state.maxBytes;
}

function isLeaveMarker(value: unknown): value is LeaveMarker {
    return isRecord(value) && objectHasIn(value, JSON_BYTE_BUDGET_LEAVE);
}

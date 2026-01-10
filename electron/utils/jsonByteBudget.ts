/**
 * Approximate JSON byte budgeting utilities for Electron main.
 *
 * @remarks
 * This is used as a defense-in-depth guard before broadcasting potentially
 * large snapshots (e.g. state sync) to renderers.
 *
 * The estimate is conservative and stops early once the budget is exceeded.
 */

import { isRecord } from "@shared/utils/typeHelpers";
import { getUtfByteLength } from "@shared/utils/utfByteLength";

const JSON_BYTE_BUDGET_LEAVE = Symbol("json-byte-budget-leave");

interface LeaveMarker {
    readonly [JSON_BYTE_BUDGET_LEAVE]: object;
}

function isLeaveMarker(value: unknown): value is LeaveMarker {
    return (
        typeof value === "object" &&
        value !== null &&
        JSON_BYTE_BUDGET_LEAVE in value
    );
}

interface JsonByteBudgetState {
    bytes: number;
    readonly maxBytes: number;
    /** Tracks objects currently on the traversal path to detect cycles only. */
    readonly path: WeakSet<object>;
    readonly stack: unknown[];
}

function addBytes(state: JsonByteBudgetState, increment: number): void {
    state.bytes += increment;
}

function isBudgetExceeded(state: JsonByteBudgetState): boolean {
    return state.bytes > state.maxBytes;
}

function getJsonBytesForString(value: string): number {
    // Quotes + bytes (rough; ignores escaping overhead).
    return getUtfByteLength(value) + 2;
}

function getJsonBytesForNumber(value: number): number {
    return getUtfByteLength(String(value));
}

function getJsonBytesForNull(): number {
    return 4;
}

function addJsonBytesForObject(
    state: JsonByteBudgetState,
    value: object
): void {
    if (value instanceof Date) {
        addBytes(state, getJsonBytesForString(value.toISOString()));
        return;
    }

    if (value instanceof URL) {
        addBytes(state, getJsonBytesForString(value.toString()));
        return;
    }

    if (value instanceof ArrayBuffer) {
        addBytes(state, value.byteLength);
        return;
    }

    if (ArrayBuffer.isView(value)) {
        addBytes(state, value.byteLength);
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
            state.stack.push(value[i]);
        }

        return;
    }

    if (!isRecord(value)) {
        addBytes(state, state.maxBytes + 1);
        return;
    }

    addBytes(state, 2);

    const record = value;
    const keys = Object.keys(record);

    if (keys.length > 1) {
        addBytes(state, keys.length - 1);
    }

    for (let i = keys.length - 1; i >= 0; i--) {
        const key = keys[i];
        if (key === undefined) {
            addBytes(state, state.maxBytes + 1);
            return;
        }

        addBytes(state, getUtfByteLength(key) + 3);
        state.stack.push(record[key]);
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

    if (value === undefined) {
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

/**
 * Returns a conservative estimate of JSON UTF-8 byte length, stopping early
 * once the budget is exceeded.
 */
export function getJsonByteLengthUpTo(
    value: unknown,
    maxBytes: number
): number {
    if (!Number.isFinite(maxBytes) || maxBytes <= 0) {
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

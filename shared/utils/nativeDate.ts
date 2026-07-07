import { isFinite as isFiniteNumber } from "ts-extras";

import { getOwnDataProperty } from "./errorPropertyAccess";

type NativeDateMethod = (this: Date) => unknown;

function isNativeDateMethod(value: unknown): value is NativeDateMethod {
    return typeof value === "function";
}

function getPrototypeObject(value: object): object | null {
    const prototype: unknown = Object.getPrototypeOf(value);

    return typeof prototype === "object" && prototype !== null
        ? prototype
        : null;
}

function getNativeDateMethod(
    value: Date,
    key: "getTime" | "toISOString"
): NativeDateMethod | undefined {
    let current = getPrototypeObject(value);

    while (current) {
        const property = getOwnDataProperty(current, key);
        if (property.found && isNativeDateMethod(property.value)) {
            return property.value;
        }

        current = getPrototypeObject(current);
    }

    return undefined;
}

export function getNativeDateEpochMs(value: Date): number | undefined {
    const getTime = getNativeDateMethod(value, "getTime");
    if (!getTime) {
        return undefined;
    }

    const epochMs: unknown = Reflect.apply(getTime, value, []);

    return typeof epochMs === "number" && isFiniteNumber(epochMs)
        ? epochMs
        : undefined;
}

export function toNativeDateISOString(value: Date): string | undefined {
    const toISOString = getNativeDateMethod(value, "toISOString");
    if (!toISOString) {
        return undefined;
    }

    try {
        const serialized: unknown = Reflect.apply(toISOString, value, []);

        return typeof serialized === "string" ? serialized : undefined;
    } catch {
        return undefined;
    }
}

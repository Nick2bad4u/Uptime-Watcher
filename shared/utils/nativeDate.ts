import { isFinite as isFiniteNumber } from "ts-extras";

type NativeDateMethod = (this: Date) => unknown;

function isNativeDateMethod(value: unknown): value is NativeDateMethod {
    return typeof value === "function";
}

function getNativeDateMethod(
    holder: object,
    key: "getTime" | "toISOString"
): NativeDateMethod | undefined {
    const descriptor = Object.getOwnPropertyDescriptor(holder, key);

    return descriptor &&
        "value" in descriptor &&
        isNativeDateMethod(descriptor.value)
        ? descriptor.value
        : undefined;
}

const DATE_GET_TIME = getNativeDateMethod(Date.prototype, "getTime");
const DATE_TO_ISO_STRING = getNativeDateMethod(Date.prototype, "toISOString");

export function getNativeDateEpochMs(value: Date): number | undefined {
    if (!DATE_GET_TIME) {
        return undefined;
    }

    let epochMs: unknown;
    try {
        epochMs = Reflect.apply(DATE_GET_TIME, value, []);
    } catch {
        return undefined;
    }

    return typeof epochMs === "number" && isFiniteNumber(epochMs)
        ? epochMs
        : undefined;
}

export function toNativeDateISOString(value: Date): string | undefined {
    if (!DATE_TO_ISO_STRING) {
        return undefined;
    }

    try {
        const serialized: unknown = Reflect.apply(
            DATE_TO_ISO_STRING,
            value,
            []
        );

        return typeof serialized === "string" ? serialized : undefined;
    } catch {
        return undefined;
    }
}

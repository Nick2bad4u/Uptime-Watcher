import { getOwnDataProperty } from "./errorPropertyAccess";

type NativeGetter = (this: ArrayBuffer) => unknown;

function isNativeGetter(value: unknown): value is NativeGetter {
    return typeof value === "function";
}

function getNativeArrayBufferByteLengthGetter(): NativeGetter | undefined {
    const descriptor = Object.getOwnPropertyDescriptor(
        ArrayBuffer.prototype,
        "byteLength"
    );

    const getter = descriptor
        ? getOwnDataProperty(descriptor, "get")
        : { found: false as const };

    return getter.found && isNativeGetter(getter.value)
        ? getter.value
        : undefined;
}

const ARRAY_BUFFER_BYTE_LENGTH = getNativeArrayBufferByteLengthGetter();

export function getNativeArrayBufferByteLength(
    value: unknown
): number | undefined {
    if (
        typeof value !== "object" ||
        value === null ||
        !ARRAY_BUFFER_BYTE_LENGTH
    ) {
        return undefined;
    }

    try {
        const byteLength: unknown = Reflect.apply(
            ARRAY_BUFFER_BYTE_LENGTH,
            value,
            []
        );

        return typeof byteLength === "number" &&
            Number.isSafeInteger(byteLength) &&
            byteLength >= 0
            ? byteLength
            : undefined;
    } catch {
        return undefined;
    }
}

export function isNativeArrayBuffer(value: unknown): value is ArrayBuffer {
    return getNativeArrayBufferByteLength(value) !== undefined;
}

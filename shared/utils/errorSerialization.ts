import type { SerializedError } from "@shared/utils/logger/common";

import { ensureError } from "@shared/utils/errorHandling";
import { normalizeLogValue } from "@shared/utils/loggingContext";
import { serializeError } from "@shared/utils/logger/common";
import { objectEntries } from "ts-extras";

type ExtendedError = Error & SerializedError;

const isExtendedError = (candidate: unknown): candidate is ExtendedError =>
    Error.isError(candidate) && typeof candidate.message === "string";

const createExtendedError = (message: string): ExtendedError => {
    const error = new Error(message);
    if (!isExtendedError(error)) {
        throw new TypeError("Failed to create extended error");
    }

    return error;
};

const defineAdditionalErrorProperty = (
    target: ExtendedError,
    key: PropertyKey,
    value: unknown
): void => {
    Object.defineProperty(target, key, {
        configurable: true,
        enumerable: true,
        value,
        writable: true,
    });
};

const copyAdditionalProperties = (
    source: Error,
    target: ExtendedError
): void => {
    for (const key of Reflect.ownKeys(source)) {
        const isCoreKey =
            key === "message" || key === "name" || key === "stack";

        if (!isCoreKey) {
            const descriptor = Object.getOwnPropertyDescriptor(source, key);
            if (descriptor && "value" in descriptor) {
                defineAdditionalErrorProperty(
                    target,
                    key,
                    normalizeLogValue(descriptor.value as unknown)
                );
            }
        }
    }
};

const cloneSerializedError = (payload: SerializedError): ExtendedError => {
    const errorInstance = createExtendedError(payload.message);

    if (payload.name) {
        Object.defineProperty(errorInstance, "name", {
            configurable: true,
            enumerable: false,
            value: payload.name,
            writable: true,
        });
    }

    if (payload.stack) {
        Object.defineProperty(errorInstance, "stack", {
            configurable: true,
            enumerable: false,
            value: payload.stack,
            writable: true,
        });
    }

    for (const [key, value] of objectEntries(payload)) {
        const isCoreKey =
            key === "message" || key === "name" || key === "stack";

        if (!isCoreKey) {
            defineAdditionalErrorProperty(errorInstance, key, value);
        }
    }

    return errorInstance;
};

const buildFallbackError = (error: Error): ExtendedError => {
    const fallback = createExtendedError(error.message);
    Object.defineProperty(fallback, "name", {
        configurable: true,
        enumerable: false,
        value: error.name,
        writable: true,
    });

    if (error.stack) {
        Object.defineProperty(fallback, "stack", {
            configurable: true,
            enumerable: false,
            value: error.stack,
            writable: true,
        });
    }

    copyAdditionalProperties(error, fallback);

    return fallback;
};

/**
 * Converts an unknown error input into a structured {@link SerializedError}.
 */
export const toSerializedError = (error: unknown): ExtendedError => {
    const normalizedError = ensureError(error);
    const serialized = serializeError(normalizedError);

    if (serialized) {
        const clone = cloneSerializedError(serialized);
        copyAdditionalProperties(normalizedError, clone);
        return clone;
    }

    return buildFallbackError(normalizedError);
};

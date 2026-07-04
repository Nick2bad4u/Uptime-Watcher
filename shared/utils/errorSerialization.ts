import type { SerializedError } from "@shared/utils/logger/common";

import { ensureError } from "@shared/utils/errorHandling";
import { normalizeLogValue } from "@shared/utils/loggingContext";
import { serializeError } from "@shared/utils/logger/common";
import { castUnchecked } from "@shared/utils/typeHelpers";
import { objectEntries } from "ts-extras";

type ExtendedError = Error & SerializedError;

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
    const errorInstance = castUnchecked<ExtendedError>(
        new Error(payload.message)
    );

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
    const fallback = castUnchecked<ExtendedError>(new Error(error.message));
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

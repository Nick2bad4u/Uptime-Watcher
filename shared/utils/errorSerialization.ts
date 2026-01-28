import type { SerializedError } from "@shared/utils/logger/common";

import { ensureError } from "@shared/utils/errorHandling";
import { serializeError } from "@shared/utils/logger/common";
import { castUnchecked } from "@shared/utils/typeHelpers";

type ExtendedError = Error & SerializedError;

const copyAdditionalProperties = (
    source: Error,
    target: ExtendedError
): void => {
    for (const key of Reflect.ownKeys(source)) {
        const isCoreKey =
            key === "message" || key === "name" || key === "stack";

        if (!isCoreKey) {
            try {
                Reflect.set(target, key, Reflect.get(source, key));
            } catch {
                Reflect.set(target, key, undefined);
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

    for (const [key, value] of Object.entries(payload)) {
        const isCoreKey =
            key === "message" || key === "name" || key === "stack";

        if (!isCoreKey) {
            Reflect.set(errorInstance, key, value);
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
        return cloneSerializedError(serialized);
    }

    return buildFallbackError(normalizedError);
};

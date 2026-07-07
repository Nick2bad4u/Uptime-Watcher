/**
 * Descriptor-safe property access helpers for error and diagnostic paths.
 *
 * @remarks
 * Logging, preview, and validation code often handles untrusted error-shaped
 * values. These helpers avoid invoking user-defined getters while still
 * preserving native Error stack access where runtimes expose it through a
 * built-in accessor.
 */

export type OwnDataPropertyResult =
    | { readonly found: false }
    | { readonly found: true; readonly value: unknown };

export type CallableDataProperty = (this: unknown) => unknown;

export type ErrorStringPropertyKey =
    | "message"
    | "name"
    | "stack";

function isDescriptorTarget(candidate: unknown): candidate is object {
    return (
        (typeof candidate === "object" && candidate !== null) ||
        typeof candidate === "function"
    );
}

function isCallableDataProperty(
    candidate: unknown
): candidate is CallableDataProperty {
    return typeof candidate === "function";
}

export function getOwnDataProperty(
    holder: object,
    key: PropertyKey
): OwnDataPropertyResult {
    const descriptor = Object.getOwnPropertyDescriptor(holder, key);

    if (!descriptor || !("value" in descriptor)) {
        return { found: false };
    }

    return { found: true, value: descriptor.value };
}

/**
 * Reads an own data property or an own accessor property whose getter can be
 * invoked safely.
 *
 * @remarks
 * Prefer {@link getOwnDataProperty} for untrusted payloads, errors, and metadata
 * where getters should never run. This helper is for trusted runtime boundaries
 * such as `globalThis.crypto`, where modern runtimes expose native capabilities
 * through configurable global accessors.
 */
export function getOwnPropertyValue(
    holder: object,
    key: PropertyKey
): OwnDataPropertyResult {
    const descriptor = Object.getOwnPropertyDescriptor(holder, key);

    if (!descriptor) {
        return { found: false };
    }

    if ("value" in descriptor) {
        return { found: true, value: descriptor.value };
    }

    const getterProperty = getOwnDataProperty(descriptor, "get");
    const getter = getterProperty.found ? getterProperty.value : undefined;
    if (typeof getter !== "function") {
        return { found: false };
    }

    try {
        return { found: true, value: Reflect.apply(getter, holder, []) };
    } catch {
        return { found: false };
    }
}

export function getOwnStringDataProperty(
    holder: object,
    key: PropertyKey
): string | undefined {
    const property = getOwnDataProperty(holder, key);

    return property.found && typeof property.value === "string"
        ? property.value
        : undefined;
}

export function getOwnDataCause(error: Error): unknown {
    const property = getOwnDataProperty(error, "cause");

    return property.found ? property.value : undefined;
}

export function getCallableDataProperty(
    holder: unknown,
    key: PropertyKey
): CallableDataProperty | undefined {
    if (!isDescriptorTarget(holder)) {
        return undefined;
    }

    let current: object | null = holder;
    while (current) {
        const descriptor = Object.getOwnPropertyDescriptor(current, key);

        if (descriptor) {
            const value: unknown =
                "value" in descriptor ? descriptor.value : undefined;
            return isCallableDataProperty(value) ? value : undefined;
        }

        const prototype: unknown = Object.getPrototypeOf(current);
        current = isDescriptorTarget(prototype) ? prototype : null;
    }

    return undefined;
}

function isNativeErrorStringGetter(
    value: unknown
): value is (this: Error) => unknown {
    if (typeof value !== "function") {
        return false;
    }

    const functionToString: unknown = Object.getOwnPropertyDescriptor(
        Function.prototype,
        "toString"
    )?.value;

    if (typeof functionToString !== "function") {
        return false;
    }

    const source: unknown = Reflect.apply(functionToString, value, []);

    return typeof source === "string" && source.includes("[native code]");
}

export function getErrorStringProperty(
    error: Error,
    key: ErrorStringPropertyKey
): string | undefined {
    let current: object | null = error;

    while (current) {
        const descriptor = Object.getOwnPropertyDescriptor(current, key);

        if (descriptor) {
            if ("value" in descriptor) {
                const value: unknown = descriptor.value;
                return typeof value === "string" ? value : undefined;
            }

            const getterProperty = Object.getOwnPropertyDescriptor(
                descriptor,
                "get"
            );
            const getter: unknown =
                getterProperty && "value" in getterProperty
                    ? getterProperty.value
                    : undefined;
            if (key === "stack" && isNativeErrorStringGetter(getter)) {
                try {
                    const value: unknown = Reflect.apply(getter, error, []);
                    return typeof value === "string" ? value : undefined;
                } catch {
                    return undefined;
                }
            }

            return undefined;
        }

        const prototype: unknown = Object.getPrototypeOf(current);
        current =
            typeof prototype === "object" && prototype !== null
                ? prototype
                : null;
    }

    return undefined;
}

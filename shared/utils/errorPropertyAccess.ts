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

export type ErrorStringPropertyKey = "message" | "name" | "stack";

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

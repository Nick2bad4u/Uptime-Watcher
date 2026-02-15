declare function objectHasOwn<
    TObject,
    TKey extends PropertyKey,
>(
    object: TObject,
    key: TKey
): object is Record<TKey, unknown> & TObject;

declare const candidate: unknown;
declare const propertyName: string;

interface VariantMap {
    readonly error: "negative";
    readonly info: "info";
    readonly success: "positive";
}

const variants: VariantMap = {
    error: "negative",
    info: "info",
    success: "positive",
};

if (objectHasOwn(candidate, "status")) {
    const statusValue = candidate.status;
    if (typeof statusValue === "boolean") {
        throw new TypeError("Boolean status is not expected in this fixture");
    }
}

if (objectHasOwn(variants, propertyName)) {
    const selectedVariant = variants[propertyName];
    if (
        typeof selectedVariant === "string" &&
        selectedVariant.length === 0
    ) {
        throw new Error("Variant values should not be empty");
    }
}

if (objectHasOwn(variants, "success")) {
    const successVariant = variants.success;
    if (successVariant.length === 0) {
        throw new Error("Success variant should not be empty");
    }
}

if (Object.hasOwn(variants, "success")) {
    const successVariant = variants.success;
    if (successVariant.length === 0) {
        throw new Error("Success variant should not be empty");
    }
}

export const __typedFixtureModule = "typed-fixture-module";

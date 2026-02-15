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

if (
    typeof candidate === "object" &&
    candidate !== null &&
    Object.hasOwn(candidate, "status")
) {
    const statusValue = (candidate as { readonly status?: unknown }).status;
    if (typeof statusValue === "boolean") {
        throw new TypeError("Boolean status is not expected in this fixture");
    }
}

if (Object.hasOwn(variants, propertyName)) {
    const selectedVariant = variants[propertyName as keyof VariantMap];
    if (selectedVariant.length === 0) {
        throw new TypeError("Variant values should not be empty");
    }
}

if (Object.hasOwn(variants, "success")) {
    const successVariant = variants.success;
    if (successVariant.length === 0) {
        throw new TypeError("Success variant should not be empty");
    }
}

export const __typedFixtureModule = "typed-fixture-module";

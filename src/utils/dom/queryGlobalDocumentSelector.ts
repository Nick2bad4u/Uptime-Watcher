import { getOwnPropertyValue } from "@shared/utils/errorPropertyAccess";

const isObjectLike = (value: unknown): value is object =>
    (typeof value === "object" && value !== null) ||
    typeof value === "function";

/**
 * Safely queries `globalThis.document` without assuming DOM availability.
 */
export function queryGlobalDocumentSelector(selector: string): unknown {
    const documentProperty = getOwnPropertyValue(globalThis, "document");

    if (!documentProperty.found || !isObjectLike(documentProperty.value)) {
        return null;
    }

    try {
        const querySelector: unknown = Reflect.get(
            documentProperty.value,
            "querySelector"
        );

        if (typeof querySelector !== "function") {
            return null;
        }

        return Reflect.apply(querySelector, documentProperty.value, [selector]);
    } catch {
        return null;
    }
}

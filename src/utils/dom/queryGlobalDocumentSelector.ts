import { getOwnPropertyValue } from "@shared/utils/errorPropertyAccess";

const isObjectLike = (value: unknown): value is object =>
    (typeof value === "object" && value !== null) ||
    typeof value === "function";

function getGlobalDocumentObject(): object | null {
    const documentProperty = getOwnPropertyValue(globalThis, "document");

    return documentProperty.found && isObjectLike(documentProperty.value)
        ? documentProperty.value
        : null;
}

/**
 * Checks whether an unknown value is a DOM element node.
 */
export function isGlobalElementNode(value: unknown): value is Element {
    if (!isObjectLike(value)) {
        return false;
    }

    try {
        return Reflect.get(value, "nodeType") === 1;
    } catch {
        return false;
    }
}

/**
 * Safely reads `globalThis.document.activeElement`.
 */
export function getGlobalDocumentActiveElement(): Element | null {
    const documentObject = getGlobalDocumentObject();

    if (!documentObject) {
        return null;
    }

    try {
        const activeElement: unknown = Reflect.get(
            documentObject,
            "activeElement"
        );

        return isGlobalElementNode(activeElement) ? activeElement : null;
    } catch {
        return null;
    }
}

/**
 * Safely reads `globalThis.document.body`.
 */
export function getGlobalDocumentBodyElement(): Element | null {
    const documentObject = getGlobalDocumentObject();

    if (!documentObject) {
        return null;
    }

    try {
        const body: unknown = Reflect.get(documentObject, "body");
        return isGlobalElementNode(body) ? body : null;
    } catch {
        return null;
    }
}

/**
 * Safely queries `globalThis.document` without assuming DOM availability.
 */
export function queryGlobalDocumentSelector(selector: string): unknown {
    const documentObject = getGlobalDocumentObject();

    if (!documentObject) {
        return null;
    }

    try {
        const querySelector: unknown = Reflect.get(
            documentObject,
            "querySelector"
        );

        if (typeof querySelector !== "function") {
            return null;
        }

        return Reflect.apply(querySelector, documentObject, [selector]);
    } catch {
        return null;
    }
}

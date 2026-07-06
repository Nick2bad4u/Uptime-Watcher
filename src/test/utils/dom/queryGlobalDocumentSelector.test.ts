import { describe, expect, it, vi } from "vitest";

import {
    getGlobalDocumentActiveElement,
    getGlobalDocumentBodyElement,
    isGlobalElementNode,
    queryGlobalDocumentSelector,
} from "../../../utils/dom/queryGlobalDocumentSelector";

function withGlobalDocumentGetter(
    getter: () => unknown,
    callback: () => void
): void {
    const originalDocument = Object.getOwnPropertyDescriptor(
        globalThis,
        "document"
    );

    Object.defineProperty(globalThis, "document", {
        configurable: true,
        get: getter,
    });

    try {
        callback();
    } finally {
        if (originalDocument) {
            Object.defineProperty(globalThis, "document", originalDocument);
        } else {
            Reflect.deleteProperty(globalThis, "document");
        }
    }
}

describe(isGlobalElementNode, () => {
    it("returns true for element nodes", () => {
        expect(isGlobalElementNode(document.createElement("div"))).toBeTruthy();
    });

    it("returns false for non-element values", () => {
        expect(isGlobalElementNode(null)).toBeFalsy();
        expect(
            isGlobalElementNode(document.createTextNode("text"))
        ).toBeFalsy();
    });
});

describe(getGlobalDocumentActiveElement, () => {
    it("returns the active document element", () => {
        const button = document.createElement("button");
        document.body.append(button);
        button.focus();

        expect(getGlobalDocumentActiveElement()).toBe(button);

        button.remove();
    });

    it("returns null when document access throws", () => {
        withGlobalDocumentGetter(
            () => {
                throw new Error("document unavailable");
            },
            () => {
                expect(getGlobalDocumentActiveElement()).toBeNull();
            }
        );
    });
});

describe(getGlobalDocumentBodyElement, () => {
    it("returns the document body element", () => {
        expect(getGlobalDocumentBodyElement()).toBe(document.body);
    });

    it("returns null when the document body is not an element", () => {
        withGlobalDocumentGetter(
            () => ({
                body: null,
            }),
            () => {
                expect(getGlobalDocumentBodyElement()).toBeNull();
            }
        );
    });
});

describe(queryGlobalDocumentSelector, () => {
    it("returns the matching document element", () => {
        document.body.replaceChildren();

        const element = document.createElement("div");
        element.id = "target";
        document.body.append(element);

        expect(queryGlobalDocumentSelector("#target")).toBe(element);
    });

    it("returns null when document access throws", () => {
        withGlobalDocumentGetter(
            () => {
                throw new Error("document unavailable");
            },
            () => {
                expect(queryGlobalDocumentSelector("#target")).toBeNull();
            }
        );
    });

    it("returns null when querySelector throws", () => {
        const querySelectorSpy = vi
            .spyOn(document, "querySelector")
            .mockImplementation(() => {
                throw new Error("query selector unavailable");
            });

        expect(queryGlobalDocumentSelector("#target")).toBeNull();
        expect(querySelectorSpy).toHaveBeenCalledWith("#target");
    });
});

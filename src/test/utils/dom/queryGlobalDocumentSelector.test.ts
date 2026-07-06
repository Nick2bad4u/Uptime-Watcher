import { describe, expect, it, vi } from "vitest";

import { queryGlobalDocumentSelector } from "../../../utils/dom/queryGlobalDocumentSelector";

describe(queryGlobalDocumentSelector, () => {
    it("returns the matching document element", () => {
        document.body.replaceChildren();

        const element = document.createElement("div");
        element.id = "target";
        document.body.append(element);

        expect(queryGlobalDocumentSelector("#target")).toBe(element);
    });

    it("returns null when document access throws", () => {
        const originalDocument = Object.getOwnPropertyDescriptor(
            globalThis,
            "document"
        );

        Object.defineProperty(globalThis, "document", {
            configurable: true,
            get() {
                throw new Error("document unavailable");
            },
        });

        try {
            expect(queryGlobalDocumentSelector("#target")).toBeNull();
        } finally {
            if (originalDocument) {
                Object.defineProperty(globalThis, "document", originalDocument);
            } else {
                Reflect.deleteProperty(globalThis, "document");
            }
        }
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

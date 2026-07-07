/**
 * Browser-side file download helpers.
 *
 * @remarks
 * Centralizes DOM download mechanics (Blob → object URL → `<a download>` click)
 * so feature modules can focus on business logic and error policy.
 *
 * @packageDocumentation
 */

import { getOwnPropertyValue } from "@shared/utils/errorPropertyAccess";

/**
 * Thrown when the download anchor cannot be attached to the DOM.
 */
export class FileDownloadDomAttachmentError extends Error {
    public constructor(message: string, options?: ErrorOptions) {
        super(message, options);
        this.name = "FileDownloadDomAttachmentError";
    }
}

type DownloadAnchorElement = Pick<
    HTMLAnchorElement,
    | "click"
    | "download"
    | "href"
    | "remove"
    | "style"
>;

const isObjectLike = (value: unknown): value is object =>
    (typeof value === "object" && value !== null) ||
    typeof value === "function";

function getDocumentObject(): object {
    const documentProperty = getOwnPropertyValue(globalThis, "document");

    if (!documentProperty.found || !isObjectLike(documentProperty.value)) {
        throw new TypeError("Document is unavailable");
    }

    return documentProperty.value;
}

function getDocumentBody(): object {
    const documentObject = getDocumentObject();
    const body: unknown = Reflect.get(documentObject, "body");

    if (!isObjectLike(body)) {
        throw new TypeError("Document body is unavailable");
    }

    return body;
}

function isDownloadAnchorElement(
    value: unknown
): value is DownloadAnchorElement {
    if (!isObjectLike(value)) {
        return false;
    }

    try {
        return (
            typeof Reflect.get(value, "click") === "function" &&
            typeof Reflect.get(value, "remove") === "function" &&
            isObjectLike(Reflect.get(value, "style"))
        );
    } catch {
        return false;
    }
}

function createAnchorElement(): DownloadAnchorElement {
    try {
        const documentObject = getDocumentObject();
        const createElement: unknown = Reflect.get(
            documentObject,
            "createElement"
        );

        if (typeof createElement !== "function") {
            throw new TypeError("createElement not available");
        }

        const anchor: unknown = Reflect.apply(createElement, documentObject, [
            "a",
        ]);

        if (!isDownloadAnchorElement(anchor)) {
            throw new TypeError(
                "createElement did not return a download anchor"
            );
        }

        return anchor;
    } catch (error: unknown) {
        throw new TypeError("createElement not available", { cause: error });
    }
}

function appendAnchorToBody(body: object, anchor: DownloadAnchorElement): void {
    const append: unknown = Reflect.get(body, "append");

    if (typeof append !== "function") {
        throw new TypeError("Document body append is unavailable");
    }

    Reflect.apply(append, body, [anchor]);
}

/**
 * Triggers a programmatic click on a download anchor.
 */
function clickDownloadAnchor(args: {
    anchor: DownloadAnchorElement;
    attachToDom: boolean;
}): void {
    const { anchor, attachToDom } = args;

    if (!attachToDom) {
        anchor.click();
        return;
    }

    anchor.style.display = "none";

    try {
        const body = getDocumentBody();
        appendAnchorToBody(body, anchor);
    } catch (error: unknown) {
        throw new FileDownloadDomAttachmentError(
            "Failed to attach download anchor to DOM",
            { cause: error }
        );
    }

    try {
        anchor.click();
    } finally {
        // Best-effort cleanup.
        try {
            anchor.remove();
        } catch {
            // Ignore cleanup errors.
        }
    }
}

/**
 * Creates and triggers a file download from an {@link ArrayBuffer}.
 */
export function triggerArrayBufferDownload(args: {
    attachToDom: boolean;
    buffer: ArrayBuffer;
    fileName: string;
    mimeType: string;
}): void {
    const { attachToDom, buffer, fileName, mimeType } = args;
    const blob = new Blob([buffer], { type: mimeType });

    triggerBlobDownload({ attachToDom, blob, fileName });
}

/**
 * Creates and triggers a file download from a Blob.
 */
export function triggerBlobDownload(args: {
    attachToDom: boolean;
    blob: Blob;
    fileName: string;
}): void {
    const { attachToDom, blob, fileName } = args;

    withObjectUrl(blob, (objectURL) => {
        const anchor = createDownloadAnchor(objectURL, fileName);
        clickDownloadAnchor({ anchor, attachToDom });
    });
}

/**
 * Creates an object URL for the provided blob and guarantees cleanup.
 */
function withObjectUrl(blob: Blob, run: (objectURL: string) => void): void {
    const objectURL = URL.createObjectURL(blob);
    let shouldRevokeImmediately = true;

    try {
        run(objectURL);
        shouldRevokeImmediately = false;
    } finally {
        if (shouldRevokeImmediately) {
            URL.revokeObjectURL(objectURL);
        } else {
            scheduleObjectUrlRevoke(objectURL);
        }
    }
}

function scheduleObjectUrlRevoke(objectURL: string): void {
    // Give the browser one turn of the event loop to start resolving the blob
    // URL for download before revoking it.
    globalThis.setTimeout(() => {
        URL.revokeObjectURL(objectURL);
    }, 0);
}

function createDownloadAnchor(
    objectURL: string,
    fileName: string
): DownloadAnchorElement {
    const anchor = createAnchorElement();
    anchor.href = objectURL;
    anchor.download = fileName;
    return anchor;
}

/**
 * Browser-side file download helpers.
 *
 * @remarks
 * Centralizes DOM download mechanics (Blob → object URL → `<a download>` click)
 * so feature modules can focus on business logic and error policy.
 *
 * @packageDocumentation
 */

import { getUserFacingErrorDetail } from "@shared/utils/userFacingErrors";

/** Optional warning logger used by download helpers. */
export interface BrowserDownloadWarnLogger {
    /** Logs a non-fatal warning raised during download triggering. */
    warn: (message: string, error: Error) => void;
}

/**
 * Thrown when the download anchor cannot be attached to the DOM.
 */
export class FileDownloadDomAttachmentError extends Error {
    public constructor(message: string, options?: ErrorOptions) {
        super(message, options);
        this.name = "FileDownloadDomAttachmentError";
    }
}

/**
 * Triggers a programmatic click on a download anchor.
 */
export function clickDownloadAnchor(args: {
    anchor: HTMLAnchorElement;
    attachToDom: boolean;
    warnLogger?: BrowserDownloadWarnLogger | undefined;
}): void {
    const { anchor, attachToDom, warnLogger } = args;

    if (!attachToDom) {
        anchor.click();
        return;
    }

    anchor.style.display = "none";

    const { body } = document;

    try {
        body.append(anchor);
    } catch (error: unknown) {
        throw new FileDownloadDomAttachmentError(
            "Failed to attach download anchor to DOM",
            { cause: error }
        );
    }

    try {
        anchor.click();
    } catch (domError) {
        const error = Error.isError(domError)
            ? domError
            : new Error(getUserFacingErrorDetail(domError));
        warnLogger?.warn("DOM click failed, retrying direct click", error);
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
    warnLogger?: BrowserDownloadWarnLogger | undefined;
}): void {
    const { attachToDom, buffer, fileName, mimeType, warnLogger } = args;
    const blob = new Blob([buffer], { type: mimeType });

    triggerBlobDownload({ attachToDom, blob, fileName, warnLogger });
}

/**
 * Creates and triggers a file download from a Blob.
 */
export function triggerBlobDownload(args: {
    attachToDom: boolean;
    blob: Blob;
    fileName: string;
    warnLogger?: BrowserDownloadWarnLogger | undefined;
}): void {
    const { attachToDom, blob, fileName, warnLogger } = args;

    withObjectUrl(blob, (objectURL) => {
        const anchor = createDownloadAnchor(objectURL, fileName);
        clickDownloadAnchor({ anchor, attachToDom, warnLogger });
    });
}

/**
 * Creates an object URL for the provided blob and guarantees cleanup.
 */
export function withObjectUrl(
    blob: Blob,
    run: (objectURL: string) => void
): void {
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
): HTMLAnchorElement {
    const anchor = document.createElement("a");
    anchor.href = objectURL;
    anchor.download = fileName;
    return anchor;
}

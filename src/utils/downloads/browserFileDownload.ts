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

/**
 * Thrown when the download anchor cannot be attached to the DOM.
 */
export class FileDownloadDomAttachmentError extends Error {
    public constructor(message: string, options?: ErrorOptions) {
        super(message, options);
        this.name = "FileDownloadDomAttachmentError";
    }
}

/** Optional warning logger used by download helpers. */
export interface BrowserDownloadWarnLogger {
    /** Logs a non-fatal warning raised during download triggering. */
    warn: (message: string, error: Error) => void;
}

/**
 * Creates an object URL for the provided blob and guarantees cleanup.
 */
export function withObjectUrl(blob: Blob, run: (objectURL: string) => void): void {
    const objectURL = URL.createObjectURL(blob);
    try {
        run(objectURL);
    } finally {
        URL.revokeObjectURL(objectURL);
    }
}

function createDownloadAnchor(objectURL: string, fileName: string): HTMLAnchorElement {
    const anchor = document.createElement("a");
    anchor.href = objectURL;
    anchor.download = fileName;
    return anchor;
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
        const error =
            domError instanceof Error
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
 * Creates and triggers a file download from a Blob.
 */
export function triggerBlobDownload(args: {
    blob: Blob;
    fileName: string;
    attachToDom: boolean;
    warnLogger?: BrowserDownloadWarnLogger | undefined;
}): void {
    const { blob, fileName, attachToDom, warnLogger } = args;

    withObjectUrl(blob, (objectURL) => {
        const anchor = createDownloadAnchor(objectURL, fileName);
        clickDownloadAnchor({ anchor, attachToDom, warnLogger });
    });
}

/**
 * Creates and triggers a file download from an {@link ArrayBuffer}.
 */
export function triggerArrayBufferDownload(args: {
    buffer: ArrayBuffer;
    fileName: string;
    mimeType: string;
    attachToDom: boolean;
    warnLogger?: BrowserDownloadWarnLogger | undefined;
}): void {
    const { buffer, fileName, mimeType, attachToDom, warnLogger } = args;
    const blob = new Blob([buffer], { type: mimeType });

    triggerBlobDownload({ blob, fileName, attachToDom, warnLogger });
}

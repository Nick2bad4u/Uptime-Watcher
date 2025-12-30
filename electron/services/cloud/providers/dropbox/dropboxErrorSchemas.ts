import { tryParseJsonRecord } from "@shared/utils/jsonSafety";
import { formatZodIssues } from "@shared/utils/zodIssueFormatting";
import * as z from "zod";

/**
 * Minimal subset of a Dropbox API error payload.
 */
interface DropboxErrorSummaryPayload {
    readonly error_summary: string;
}

const dropboxErrorSummarySchema: z.ZodType<DropboxErrorSummaryPayload> =
    z.looseObject({
        error_summary: z.string().min(1),
    });

function tryParseDropboxErrorSummaryFromObject(
    value: unknown
): string | undefined {
    const parsed = dropboxErrorSummarySchema.safeParse(value);
    if (parsed.success) {
        return parsed.data.error_summary;
    }

    formatZodIssues(parsed.error.issues);
    return undefined;
}

/**
 * Best-effort extraction of a Dropbox `error_summary` string.
 *
 * @remarks
 * Dropbox errors can arrive as:
 *
 * - Objects
 * - JSON strings
 * - Buffers/array buffers (e.g. axios responseType=arraybuffer)
 */
export function tryParseDropboxErrorSummary(
    value: unknown
): string | undefined {
    if (!value) {
        return undefined;
    }

    if (typeof value === "object") {
        return tryParseDropboxErrorSummaryFromObject(value);
    }

    if (typeof value === "string") {
        const trimmed = value.trim();
        if (!trimmed) {
            return undefined;
        }

        const parsed = tryParseJsonRecord(trimmed);
        return parsed
            ? tryParseDropboxErrorSummaryFromObject(parsed)
            : undefined;
    }

    if (value instanceof ArrayBuffer) {
        const text = Buffer.from(new Uint8Array(value)).toString("utf8").trim();
        if (!text) {
            return undefined;
        }

        const parsed = tryParseJsonRecord(text);
        return parsed
            ? tryParseDropboxErrorSummaryFromObject(parsed)
            : undefined;
    }

    if (Buffer.isBuffer(value)) {
        const text = value.toString("utf8").trim();
        if (!text) {
            return undefined;
        }

        const parsed = tryParseJsonRecord(text);
        return parsed
            ? tryParseDropboxErrorSummaryFromObject(parsed)
            : undefined;
    }

    return undefined;
}

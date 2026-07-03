import { tryParseJsonRecord } from "@shared/utils/jsonSafety";
import { normalizeLogValue } from "@shared/utils/loggingContext";
import { formatZodIssues } from "@shared/utils/zodIssueFormatting";
import * as z from "zod";

/**
 * Minimal subset of a Dropbox API error payload.
 */
interface DropboxErrorSummaryPayload {
    readonly error_summary?: string | undefined;
}

const dropboxErrorSummarySchema: z.ZodType<DropboxErrorSummaryPayload> = z
    .object({
        error_summary: z.string().trim().min(1).optional(),
    })
    .loose();

const MAX_DROPBOX_ERROR_SUMMARY_CHARS = 500;

function removeAsciiControlCharacters(value: string): string {
    let sanitized = "";
    for (const character of value) {
        const codePoint = character.codePointAt(0);
        if (
            codePoint !== undefined &&
            (codePoint < 0x20 || codePoint === 0x7f)
        ) {
            sanitized += " ";
            continue;
        }

        sanitized += character;
    }

    return sanitized;
}

function normalizeDropboxErrorSummary(value: string): string | undefined {
    const normalized = normalizeLogValue(value);
    if (typeof normalized !== "string") {
        return undefined;
    }

    const sanitized = removeAsciiControlCharacters(normalized)
        .replaceAll(/\s+/gu, " ")
        .trim();
    if (!sanitized) {
        return undefined;
    }

    return sanitized.length <= MAX_DROPBOX_ERROR_SUMMARY_CHARS
        ? sanitized
        : `${sanitized.slice(0, MAX_DROPBOX_ERROR_SUMMARY_CHARS)}...`;
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

function tryParseDropboxErrorSummaryFromObject(
    value: unknown
): string | undefined {
    const parsed = dropboxErrorSummarySchema.safeParse(value);
    if (parsed.success) {
        return parsed.data.error_summary
            ? normalizeDropboxErrorSummary(parsed.data.error_summary)
            : undefined;
    }

    formatZodIssues(parsed.error.issues);
    return undefined;
}

import { ensureError } from "@shared/utils/errorHandling";
import { tryParseJsonRecord } from "@shared/utils/jsonSafety";
import { isRecord } from "@shared/utils/typeHelpers";
import { formatZodIssues } from "@shared/utils/zodIssueFormatting";
import * as z from "zod";

/**
 * Minimal subset of the Google API error shape returned by Drive endpoints.
 */
const googleApiErrorEnvelopeSchema = z.looseObject({
    error: z
        .looseObject({
            code: z.number().optional(),
            errors: z
                .array(
                    z.looseObject({
                        message: z.string().optional(),
                        reason: z.string().optional(),
                    })
                )
                .optional(),
            message: z.string().optional(),
            status: z.string().optional(),
        })
        .optional(),
});

type GoogleApiErrorEnvelope = z.infer<typeof googleApiErrorEnvelopeSchema>;

function tryParseGoogleApiErrorEnvelope(
    value: unknown
): GoogleApiErrorEnvelope | null {
    const parsed = googleApiErrorEnvelopeSchema.safeParse(value);
    if (parsed.success) {
        return parsed.data;
    }

    formatZodIssues(parsed.error.issues);
    return null;
}

function normalizeGoogleApiErrorCandidate(value: unknown): unknown {
    if (typeof value === "string") {
        const parsed = tryParseJsonRecord(value);
        return parsed ?? value;
    }

    if (value instanceof ArrayBuffer) {
        const text = Buffer.from(new Uint8Array(value)).toString("utf8");
        const parsed = tryParseJsonRecord(text);
        return parsed ?? text;
    }

    if (Buffer.isBuffer(value)) {
        const text = value.toString("utf8");
        const parsed = tryParseJsonRecord(text);
        return parsed ?? text;
    }

    return value;
}

/**
 * Best-effort extraction of a concise Google Drive API error detail string.
 */
export function tryDescribeGoogleDriveApiError(
    error: unknown
): string | undefined {
    const normalized = ensureError(error);
    const fallbackMessage = normalized.message.trim();

    if (!isRecord(error)) {
        return fallbackMessage.length > 0 ? fallbackMessage : undefined;
    }

    const responseCandidate = error["response"];
    const response = isRecord(responseCandidate)
        ? responseCandidate
        : undefined;

    const statusCandidate = response?.["status"];
    const status =
        typeof statusCandidate === "number" ? statusCandidate : undefined;

    const data = normalizeGoogleApiErrorCandidate(response?.["data"]);

    const envelope = tryParseGoogleApiErrorEnvelope(data);
    const apiMessage = envelope?.error?.message?.trim();
    const apiStatus = envelope?.error?.status?.trim();

    const reasons = (envelope?.error?.errors ?? [])
        .map((entry) => entry.reason)
        .filter(
            (reason): reason is string =>
                typeof reason === "string" && reason.trim().length > 0
        );

    const suffixParts: string[] = [];
    if (typeof status === "number") {
        suffixParts.push(String(status));
    }
    if (apiStatus) {
        suffixParts.push(apiStatus);
    }

    const prefix = suffixParts.length > 0 ? `${suffixParts.join("/")}: ` : "";

    if (apiMessage) {
        const reasonSuffix =
            reasons.length > 0 ? ` (reason: ${reasons[0]})` : "";
        return `${prefix}${apiMessage}${reasonSuffix}`;
    }

    return fallbackMessage.length > 0
        ? `${prefix}${fallbackMessage}`
        : undefined;
}

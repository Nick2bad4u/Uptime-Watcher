import { ensureError } from "@shared/utils/errorHandling";
import { getOwnDataProperty } from "@shared/utils/errorPropertyAccess";
import { tryParseJsonRecord } from "@shared/utils/jsonSafety";
import { isRecord } from "@shared/utils/typeHelpers";
import { arrayFirst, arrayJoin, isFinite as isFiniteNumber } from "ts-extras";
import * as z from "zod";

/**
 * Minimal subset of the Google API error shape returned by Drive endpoints.
 */
const googleApiErrorEnvelopeSchema = z
    .object({
        error: z
            .object({
                code: z.number().optional(),
                errors: z
                    .array(
                        z
                            .object({
                                message: z.string().trim().optional(),
                                reason: z.string().trim().optional(),
                            })
                            .loose()
                    )
                    .optional(),
                message: z.string().trim().optional(),
                status: z.string().trim().optional(),
            })
            .loose()
            .optional(),
    })
    .loose();

type GoogleApiErrorEnvelope = z.infer<typeof googleApiErrorEnvelopeSchema>;

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

    const responseCandidate = getOwnDataProperty(error, "response");
    const response =
        responseCandidate.found && isRecord(responseCandidate.value)
            ? responseCandidate.value
            : undefined;

    const statusCandidate = response
        ? getOwnDataProperty(response, "status")
        : undefined;
    const status =
        statusCandidate?.found &&
        typeof statusCandidate.value === "number" &&
        isFiniteNumber(statusCandidate.value)
            ? statusCandidate.value
            : undefined;

    const dataCandidate = response
        ? getOwnDataProperty(response, "data")
        : undefined;
    const data = normalizeGoogleApiErrorCandidate(
        dataCandidate?.found ? dataCandidate.value : undefined
    );

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

    const prefix =
        suffixParts.length > 0 ? `${arrayJoin(suffixParts, "/")}: ` : "";

    if (apiMessage) {
        const reasonSuffix =
            reasons.length > 0 ? ` (reason: ${arrayFirst(reasons)})` : "";
        return `${prefix}${apiMessage}${reasonSuffix}`;
    }

    return fallbackMessage.length > 0
        ? `${prefix}${fallbackMessage}`
        : undefined;
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

function tryParseGoogleApiErrorEnvelope(
    value: unknown
): GoogleApiErrorEnvelope | null {
    const parsed = googleApiErrorEnvelopeSchema.safeParse(value);
    if (parsed.success) {
        return parsed.data;
    }

    return null;
}

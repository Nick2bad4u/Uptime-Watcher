import { ensureError } from "@shared/utils/errorHandling";
import { tryParseJsonRecord } from "@shared/utils/jsonSafety";
import { normalizeLogValue } from "@shared/utils/loggingContext";
import axios from "axios";

import { GOOGLE_OAUTH_REQUEST_TIMEOUT_MS } from "./googleDriveOAuthConstants";
import {
    type GoogleTokenResponse,
    googleTokenResponseSchema,
    tryParseGoogleOAuthErrorResponse,
} from "./googleDriveTokenSchemas";

const GOOGLE_OAUTH_TOKEN_ENDPOINT =
    "https://oauth2.googleapis.com/token" as const;

const MAX_FALLBACK_BODY_CHARS = 500;

const toSafeDetailString = (value: unknown): string | undefined => {
    const normalized = normalizeLogValue(value);
    if (typeof normalized === "string") {
        return normalized;
    }

    if (typeof normalized === "number" || typeof normalized === "boolean") {
        return String(normalized);
    }

    return undefined;
};

const toTruncatedBodyString = (value: unknown): string | undefined => {
    if (typeof value === "string") {
        return value.slice(0, MAX_FALLBACK_BODY_CHARS);
    }

    // Axios may surface ArrayBuffer / Uint8Array payloads when configured for
    // binary responses.
    if (value instanceof Uint8Array) {
        return Buffer.from(value)
            .toString("utf8")
            .slice(0, MAX_FALLBACK_BODY_CHARS);
    }

    if (value instanceof ArrayBuffer) {
        return Buffer.from(new Uint8Array(value))
            .toString("utf8")
            .slice(0, MAX_FALLBACK_BODY_CHARS);
    }

    return undefined;
};

/**
 * Input for {@link requestGoogleOAuthToken}.
 */
export interface RequestGoogleOAuthTokenInput {
    clientId: string;
    clientSecret?: string;
    /** Human-readable operation label included in thrown error messages. */
    operationLabel: "refresh" | "token exchange";
    /** OAuth grant specific fields (excluding client_id / client_secret). */
    params: Record<string, string>;
}

/**
 * Performs a POST request to Google's OAuth token endpoint.
 *
 * @remarks
 * Shared by the interactive auth flow (authorization_code + PKCE) and the
 * background refresh flow. Centralizing this logic keeps request construction
 * and error handling consistent (including secret redaction).
 */
export async function requestGoogleOAuthToken(
    input: RequestGoogleOAuthTokenInput
): Promise<GoogleTokenResponse> {
    const body = new URLSearchParams({
        client_id: input.clientId,
        ...input.params,
    });

    if (input.clientSecret) {
        body.set("client_secret", input.clientSecret);
    }

    try {
        const response = await axios.post(
            GOOGLE_OAUTH_TOKEN_ENDPOINT,
            body.toString(),
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                timeout: GOOGLE_OAUTH_REQUEST_TIMEOUT_MS,
            }
        );

        return googleTokenResponseSchema.parse(response.data);
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            const status = error.response?.status;
            const responseData: unknown = error.response?.data;

            const parsedData =
                typeof responseData === "string"
                    ? tryParseJsonRecord(responseData)
                    : responseData;

            const oauthError = tryParseGoogleOAuthErrorResponse(parsedData);

            if (oauthError?.error) {
                const details = oauthError.error_description
                    ? `${oauthError.error} (${oauthError.error_description})`
                    : oauthError.error;

                const safeDetails =
                    toSafeDetailString(details) ?? oauthError.error;

                throw new Error(
                    `Google OAuth ${input.operationLabel} failed (${status ?? "unknown"}): ${safeDetails}`,
                    {
                        cause: error,
                    }
                );
            }

            const fallbackBody = toSafeDetailString(
                toTruncatedBodyString(responseData)
            );
            const safeMessage = toSafeDetailString(error.message) ?? "Unknown";

            throw new Error(
                `Google OAuth ${input.operationLabel} failed (${status ?? "unknown"}): ${fallbackBody ?? safeMessage}`,
                {
                    cause: error,
                }
            );
        }

        const normalized = ensureError(error);
        throw new Error(
            `Google OAuth ${input.operationLabel} failed: ${normalized.message}`,
            {
                cause: error,
            }
        );
    }
}

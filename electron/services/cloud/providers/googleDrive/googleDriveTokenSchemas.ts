import * as z from "zod";

/**
 * Shared Zod schemas for Google Drive OAuth token responses.
 *
 * @remarks
 * Centralizing these schemas avoids duplicated validation logic between the
 * interactive auth flow and background token refresh code.
 */
// Match the project's current token response parsing behavior.
export interface GoogleTokenResponse {
    readonly access_token: string;
    readonly expires_in?: number | undefined;
    readonly refresh_token?: string | undefined;
    readonly scope?: string | undefined;
    readonly token_type?: string | undefined;
}

export const googleTokenResponseSchema: z.ZodType<GoogleTokenResponse> = z
    .object({
        access_token: z.string().min(1),
        expires_in: z.int().positive().optional(),
        refresh_token: z.string().min(1).optional(),
        scope: z.string().optional(),
        token_type: z.string().optional(),
    })
    .loose();

/**
 * Minimal error payload shape returned by Google's OAuth token endpoint.
 */
export interface GoogleOAuthErrorResponse {
    readonly error: string;
    readonly error_description?: string | undefined;
}

const googleOAuthErrorResponseSchema: z.ZodType<GoogleOAuthErrorResponse> = z
    .object({
        error: z.string().min(1),
        error_description: z.string().optional(),
    })
    .loose();

/**
 * Best-effort parser for OAuth token exchange errors.
 */
export function tryParseGoogleOAuthErrorResponse(
    value: unknown
): GoogleOAuthErrorResponse | null {
    const result = googleOAuthErrorResponseSchema.safeParse(value);
    return result.success ? result.data : null;
}

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

export const googleTokenResponseSchema: z.ZodType<GoogleTokenResponse> =
    z.looseObject({
        access_token: z.string().min(1),
        expires_in: z.number().int().positive().optional(),
        refresh_token: z.string().min(1).optional(),
        scope: z.string().optional(),
        token_type: z.string().optional(),
    });

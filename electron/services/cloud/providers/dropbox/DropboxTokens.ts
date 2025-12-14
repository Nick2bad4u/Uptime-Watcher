import * as z from "zod";

/**
 * Stored OAuth tokens for Dropbox.
 */
export interface DropboxTokens {
    accessToken: string;
    expiresAtEpochMs: number;
    refreshToken: string;
}

const dropboxTokensSchema: z.ZodType<DropboxTokens> = z
    .object({
        accessToken: z.string().min(1),
        expiresAtEpochMs: z.number().int().nonnegative(),
        refreshToken: z.string().min(1),
    })
    .strict();

/** Parses and validates stored Dropbox tokens. */
export function parseDropboxTokens(candidate: unknown): DropboxTokens {
    return dropboxTokensSchema.parse(candidate);
}

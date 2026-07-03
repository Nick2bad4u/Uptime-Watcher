import * as z from "zod";

import { epochMsSchema } from "@shared/validation/timestampSchemas";

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
        accessToken: z.string().trim().min(1),
        expiresAtEpochMs: epochMsSchema,
        refreshToken: z.string().trim().min(1),
    })
    .strict();

/** Parses and validates stored Dropbox tokens. */
export function parseDropboxTokens(candidate: unknown): DropboxTokens {
    return dropboxTokensSchema.parse(candidate);
}

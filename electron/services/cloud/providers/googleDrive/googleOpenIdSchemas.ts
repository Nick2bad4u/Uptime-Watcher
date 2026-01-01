import { formatZodIssues } from "@shared/utils/zodIssueFormatting";
import * as z from "zod";

/**
 * Minimal subset of the Google OpenID Connect userinfo payload.
 */
export interface GoogleUserInfoResponse {
    /** Email address (if provided). */
    readonly email?: string | undefined;
    /** Display name (if provided). */
    readonly name?: string | undefined;
}

const googleUserInfoSchema: z.ZodType<GoogleUserInfoResponse> = z.looseObject({
    email: z.string().min(1).optional(),
    name: z.string().min(1).optional(),
});

/**
 * Parses the Google OpenID Connect `userinfo` response.
 *
 * @remarks
 * This is best-effort and intentionally tolerant: we only validate the fields
 * we use for display.
 */
export function tryParseGoogleUserInfoResponse(
    value: unknown
): GoogleUserInfoResponse | null {
    const result = googleUserInfoSchema.safeParse(value);
    if (result.success) {
        return result.data;
    }

    // Do not throw: caller treats missing/invalid userinfo as "no label".
    // Still keep this available for debugging by returning null.
    formatZodIssues(result.error.issues);
    return null;
}

import { epochMsSchema } from "@shared/validation/timestampSchemas";
import { isFinite as isFiniteNumber } from "ts-extras";

const DEFAULT_EXPIRES_IN_SECONDS = 3600;

/**
 * Calculates and validates an OAuth access-token expiration timestamp.
 *
 * @remarks
 * OAuth providers return relative `expires_in` values. Convert them to an
 * absolute epoch value only after bounding the result to the app-wide timestamp
 * range, otherwise a malformed provider response can produce an invalid Date.
 */
export function calculateOAuthTokenExpiresAtEpochMs(args: {
    readonly expiresInSeconds?: number | undefined;
    readonly nowEpochMs: number;
    readonly providerName: string;
}): number {
    const expiresInSeconds =
        args.expiresInSeconds ?? DEFAULT_EXPIRES_IN_SECONDS;

    if (!isFiniteNumber(expiresInSeconds) || expiresInSeconds <= 0) {
        throw new TypeError(
            `${args.providerName} OAuth token expiration must be a positive finite number of seconds`
        );
    }

    const expiresAtEpochMs = args.nowEpochMs + expiresInSeconds * 1000;
    const result = epochMsSchema.safeParse(expiresAtEpochMs);
    if (result.success) {
        return result.data;
    }

    throw new RangeError(
        `${args.providerName} OAuth token expiration is outside the supported Date range`
    );
}

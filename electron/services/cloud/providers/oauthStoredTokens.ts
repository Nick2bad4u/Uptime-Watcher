/**
 * Shared helpers for loading/storing OAuth token JSON in {@link SecretStore}.
 *
 * @remarks
 * Several cloud providers persist OAuth tokens as JSON. This module centralizes
 * the "load JSON → validate schema → clear if invalid" flow so providers don't
 * drift and we avoid near-identical codepaths.
 */

import type { Logger } from "@shared/utils/logger/interfaces";

import { tryParseJsonRecord } from "@shared/utils/jsonSafety";
import { getUserFacingErrorDetail } from "@shared/utils/userFacingErrors";

import type { SecretStore } from "../secrets/SecretStore";

/** Logger surface used by this module. */
export type OAuthStoredTokensLogger = Pick<Logger, "warn">;

/** Arguments for {@link readStoredJsonSecret}. */
export interface ReadStoredJsonSecretArgs<T> {
    /** Clears the invalid secret from storage (best-effort). */
    readonly clear: () => Promise<void>;

    /** Logger used for warning-level diagnostics. */
    readonly logger: OAuthStoredTokensLogger;

    /** Prefix included in warning messages (e.g. "[DropboxTokenManager]"). */
    readonly logPrefix: string;

    /** Parses/validates the decoded JSON record into a concrete token type. */
    readonly parse: (record: Record<string, unknown>) => T;

    /** Secret storage provider. */
    readonly secretStore: SecretStore;

    /** Secret key used to store the JSON blob. */
    readonly storageKey: string;
}

/**
 * Reads a JSON secret from a {@link SecretStore} and validates it.
 *
 * @remarks
 * When the stored secret is invalid (not JSON or schema validation fails), the
 * secret is cleared best-effort and `undefined` is returned.
 */
export async function readStoredJsonSecret<T>(
    args: ReadStoredJsonSecretArgs<T>
): Promise<T | undefined> {
    const raw = await args.secretStore.getSecret(args.storageKey);
    if (!raw) {
        return undefined;
    }

    const parsed = tryParseJsonRecord(raw);
    if (!parsed) {
        args.logger.warn(
            `${args.logPrefix} Stored tokens were not valid JSON; clearing`,
            {
                storageKey: args.storageKey,
            }
        );
        try {
            await args.clear();
        } catch (error) {
            args.logger.warn(
                `${args.logPrefix} Failed to clear invalid stored tokens`,
                {
                    message: getUserFacingErrorDetail(error),
                    storageKey: args.storageKey,
                }
            );
        }
        return undefined;
    }

    try {
        return args.parse(parsed);
    } catch (error) {
        args.logger.warn(
            `${args.logPrefix} Stored tokens failed schema validation; clearing`,
            {
                message: getUserFacingErrorDetail(error),
                storageKey: args.storageKey,
            }
        );
        try {
            await args.clear();
        } catch (clearError) {
            args.logger.warn(
                `${args.logPrefix} Failed to clear invalid stored tokens`,
                {
                    message: getUserFacingErrorDetail(clearError),
                    storageKey: args.storageKey,
                }
            );
        }
        return undefined;
    }
}

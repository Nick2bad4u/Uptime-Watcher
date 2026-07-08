import type { CloudSettingsAdapter } from "../CloudService.types";
import type { SecretStore } from "../secrets/SecretStore";

import { ensureError } from "@shared/utils/errorHandling";

import { encodeBase64 } from "./cloudServicePrimitives";
import {
    SECRET_KEY_ENCRYPTION_DERIVED_KEY,
    SETTINGS_KEY_ENCRYPTION_MODE,
    SETTINGS_KEY_ENCRYPTION_SALT,
} from "./cloudServiceSettings";

/**
 * Persists local passphrase-encryption state after key derivation succeeds.
 *
 * @remarks
 * Settings writes are intentionally sequential because production settings are
 * transaction-backed.
 */
export async function persistLocalPassphraseEncryptionState(args: {
    readonly derivedKey: Buffer;
    readonly saltBase64: string;
    readonly secretStore: SecretStore;
    readonly settings: CloudSettingsAdapter;
}): Promise<void> {
    const previousMode =
        (await args.settings.get(SETTINGS_KEY_ENCRYPTION_MODE)) ?? "";
    const previousSalt =
        (await args.settings.get(SETTINGS_KEY_ENCRYPTION_SALT)) ?? "";
    const previousDerivedKey = await args.secretStore.getSecret(
        SECRET_KEY_ENCRYPTION_DERIVED_KEY
    );

    let isModeCommitted = false;
    let isSaltCommitted = false;
    let isSecretWriteAttempted = false;

    try {
        await args.settings.set(SETTINGS_KEY_ENCRYPTION_MODE, "passphrase");
        isModeCommitted = true;
        await args.settings.set(SETTINGS_KEY_ENCRYPTION_SALT, args.saltBase64);
        isSaltCommitted = true;
        isSecretWriteAttempted = true;
        await args.secretStore.setSecret(
            SECRET_KEY_ENCRYPTION_DERIVED_KEY,
            encodeBase64(args.derivedKey)
        );
    } catch (error: unknown) {
        const persistenceError = ensureError(error);
        const rollbackErrors: Error[] = [];

        if (isSecretWriteAttempted) {
            const restoreSecret =
                typeof previousDerivedKey === "string"
                    ? args.secretStore.setSecret(
                          SECRET_KEY_ENCRYPTION_DERIVED_KEY,
                          previousDerivedKey
                      )
                    : args.secretStore.deleteSecret(
                          SECRET_KEY_ENCRYPTION_DERIVED_KEY
                      );

            await restoreSecret.catch((rollbackError: unknown) => {
                rollbackErrors.push(ensureError(rollbackError));
            });
        }

        if (isSaltCommitted) {
            await args.settings
                .set(SETTINGS_KEY_ENCRYPTION_SALT, previousSalt)
                .catch((rollbackError: unknown) => {
                    rollbackErrors.push(ensureError(rollbackError));
                });
        }

        if (isModeCommitted) {
            await args.settings
                .set(SETTINGS_KEY_ENCRYPTION_MODE, previousMode)
                .catch((rollbackError: unknown) => {
                    rollbackErrors.push(ensureError(rollbackError));
                });
        }

        if (rollbackErrors.length > 0) {
            throw new AggregateError(
                [persistenceError, ...rollbackErrors],
                "Failed to persist local passphrase encryption state and restore the previous state",
                { cause: error }
            );
        }

        throw persistenceError;
    }
}

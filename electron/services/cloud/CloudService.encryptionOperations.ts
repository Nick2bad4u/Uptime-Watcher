import type { CloudStatusSummary } from "@shared/types/cloud";
import type { CloudSyncManifest } from "@shared/types/cloudSyncManifest";

import {
    CLOUD_ENCRYPTION_CONFIG_VERSION,
    type CloudEncryptionConfigPassphrase,
} from "@shared/types/cloudEncryption";
import { ensureError } from "@shared/utils/errorHandling";
import { hasAsciiControlCharacters } from "@shared/utils/stringSafety";

import type { CloudServiceOperationContext } from "./CloudService.operationContext";

import { ProviderCloudSyncTransport } from "../sync/ProviderCloudSyncTransport";
import {
    createKeyCheckBase64,
    derivePassphraseKey,
    generateEncryptionSalt,
    verifyKeyCheckBase64,
} from "./crypto/cloudCrypto";
import {
    decodeStrictBase64,
    encodeBase64,
    ENCRYPTION_SALT_BYTES,
} from "./internal/cloudServicePrimitives";
import {
    SECRET_KEY_ENCRYPTION_DERIVED_KEY,
    SETTINGS_KEY_ENCRYPTION_MODE,
    SETTINGS_KEY_ENCRYPTION_SALT,
} from "./internal/cloudServiceSettings";

/**
 * Enables or unlocks passphrase-based encryption.
 *
 * @remarks
 * - Does **not** upload the passphrase anywhere.
 * - Stores the derived key in SecretStore so the user is not prompted every run.
 */
export async function setEncryptionPassphrase(
    ctx: CloudServiceOperationContext,
    passphrase: string
): Promise<CloudStatusSummary> {
    return ctx.runCloudOperation("setEncryptionPassphrase", async () => {
        if (typeof passphrase !== "string") {
            throw new TypeError("Passphrase must be a string");
        }

        if (hasAsciiControlCharacters(passphrase)) {
            throw new Error("Passphrase must not contain control characters");
        }

        const trimmedPassphrase = passphrase.trim();
        if (trimmedPassphrase.length < 8) {
            throw new Error(
                "Passphrase must be at least 8 characters (after trimming)"
            );
        }

        const passphraseCandidates: readonly [string, string?] =
            passphrase === trimmedPassphrase
                ? [passphrase]
                : [passphrase, trimmedPassphrase];

        const provider = await ctx.resolveProviderOrThrow({
            requireEncryptionUnlocked: false,
        });

        const transport = ProviderCloudSyncTransport.create(provider);
        const manifest: CloudSyncManifest | null = await transport
            .readManifest()
            .catch((error: unknown) => {
                throw ensureError(error);
            });
        const remoteEncryption = manifest?.encryption;

        if (remoteEncryption?.mode === "passphrase") {
            const salt = decodeStrictBase64({
                expectedBytes: ENCRYPTION_SALT_BYTES,
                label: "encryption salt",
                value: remoteEncryption.saltBase64,
            });
            const tryDeriveKey = async (
                candidatePassphrase: string
            ): Promise<Buffer | null> => {
                const candidateKey = await derivePassphraseKey({
                    passphrase: candidatePassphrase,
                    salt,
                });

                const valid = verifyKeyCheckBase64({
                    key: candidateKey,
                    keyCheckBase64: remoteEncryption.keyCheckBase64,
                });

                if (valid) {
                    return candidateKey;
                }

                candidateKey.fill(0);
                return null;
            };

            // At most two candidates (raw + trimmed); avoid `no-await-in-loop`.
            const [primaryCandidate, secondaryCandidate] = passphraseCandidates;

            let derivedKey = await tryDeriveKey(primaryCandidate);
            if (!derivedKey && secondaryCandidate) {
                derivedKey = await tryDeriveKey(secondaryCandidate);
            }

            if (!derivedKey) {
                throw new Error("Incorrect encryption passphrase");
            }

            // NOTE: Do not run settings writes in parallel.
            await ctx.settings.set(SETTINGS_KEY_ENCRYPTION_MODE, "passphrase");
            await ctx.settings.set(
                SETTINGS_KEY_ENCRYPTION_SALT,
                remoteEncryption.saltBase64
            );
            await ctx.secretStore.setSecret(
                SECRET_KEY_ENCRYPTION_DERIVED_KEY,
                encodeBase64(derivedKey)
            );

            derivedKey.fill(0);

            return ctx.buildStatusSummary();
        }

        const salt = generateEncryptionSalt();
        const key = await derivePassphraseKey({
            passphrase: trimmedPassphrase,
            salt,
        });
        const encryptionConfig: CloudEncryptionConfigPassphrase = {
            configVersion: CLOUD_ENCRYPTION_CONFIG_VERSION,
            kdf: "scrypt",
            keyCheckBase64: createKeyCheckBase64(key),
            mode: "passphrase",
            saltBase64: encodeBase64(salt),
        };

        const nextManifest: CloudSyncManifest = {
            ...(manifest ?? ProviderCloudSyncTransport.createEmptyManifest()),
            encryption: encryptionConfig,
        };

        await transport.writeManifest(nextManifest);

        // NOTE: Do not run settings writes in parallel.
        await ctx.settings.set(SETTINGS_KEY_ENCRYPTION_MODE, "passphrase");
        await ctx.settings.set(SETTINGS_KEY_ENCRYPTION_SALT, encodeBase64(salt));
        await ctx.secretStore.setSecret(
            SECRET_KEY_ENCRYPTION_DERIVED_KEY,
            encodeBase64(key)
        );

        key.fill(0);

        return ctx.buildStatusSummary();
    });
}

/**
 * Clears the locally cached derived encryption key.
 *
 * @remarks
 * This does not disable encryption remotely. It simply forces the user to
 * re-enter the passphrase on this device.
 */
export async function clearEncryptionKey(
    ctx: CloudServiceOperationContext
): Promise<CloudStatusSummary> {
    return ctx.runCloudOperation("clearEncryptionKey", async () => {
        await ctx.secretStore.deleteSecret(SECRET_KEY_ENCRYPTION_DERIVED_KEY);
        return ctx.buildStatusSummary();
    });
}

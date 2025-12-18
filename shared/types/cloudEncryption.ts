/**
 * Cloud encryption configuration types.
 *
 * @remarks
 * These types describe _non-secret_ encryption configuration that may be stored
 * in remote manifests and shared across processes.
 *
 * Secrets (derived keys, passphrases) must never be stored here.
 */

import * as z from "zod";

export const CLOUD_ENCRYPTION_CONFIG_VERSION = 1 as const;

/** Supported cloud encryption modes. */
export type CloudEncryptionMode = "none" | "passphrase";

/** Base fields shared by all encryption configuration variants. */
export interface CloudEncryptionConfigBase {
    readonly configVersion: typeof CLOUD_ENCRYPTION_CONFIG_VERSION;
    readonly mode: CloudEncryptionMode;
}

/** Encryption configuration for plaintext storage. */
export interface CloudEncryptionConfigNone extends CloudEncryptionConfigBase {
    readonly mode: "none";
}

/**
 * Passphrase-derived key encryption configuration.
 *
 * @remarks
 * - `saltBase64` is used with a KDF to derive a device-local key.
 * - `keyCheckBase64` is an encrypted sentinel blob that allows a device to
 *   validate a passphrase without revealing secrets.
 */
export interface CloudEncryptionConfigPassphrase extends CloudEncryptionConfigBase {
    /**
     * Epoch timestamp (ms) when passphrase encryption was enabled for sync.
     *
     * @remarks
     * This value is non-secret and is used as a migration boundary: legacy
     * plaintext artifacts created before this time may still be readable, but
     * artifacts created at/after this time must be encrypted.
     */
    readonly enabledAt?: number | undefined;
    readonly kdf: "scrypt";
    readonly keyCheckBase64: string;
    readonly mode: "passphrase";
    readonly saltBase64: string;
}

/** Union of all supported cloud encryption configuration variants. */
export type CloudEncryptionConfig =
    | CloudEncryptionConfigNone
    | CloudEncryptionConfigPassphrase;

const cloudEncryptionConfigSchemaInternal = z.discriminatedUnion("mode", [
    z
        .object({
            configVersion: z.literal(CLOUD_ENCRYPTION_CONFIG_VERSION),
            mode: z.literal("none"),
        })
        .strict(),
    z
        .object({
            configVersion: z.literal(CLOUD_ENCRYPTION_CONFIG_VERSION),
            enabledAt: z.number().int().nonnegative().optional(),
            kdf: z.literal("scrypt"),
            keyCheckBase64: z.string().min(1),
            mode: z.literal("passphrase"),
            saltBase64: z.string().min(1),
        })
        .strict(),
]);

/** Zod schema for {@link CloudEncryptionConfig}. */
export const cloudEncryptionConfigSchema: z.ZodType<CloudEncryptionConfig> =
    cloudEncryptionConfigSchemaInternal;

/** Parses and validates a {@link CloudEncryptionConfig}. */
export function parseCloudEncryptionConfig(
    candidate: unknown
): CloudEncryptionConfig {
    return cloudEncryptionConfigSchemaInternal.parse(candidate);
}

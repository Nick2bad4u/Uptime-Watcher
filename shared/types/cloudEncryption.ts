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
    readonly kdf: "scrypt";
    readonly keyCheckBase64: string;
    readonly mode: "passphrase";
    readonly saltBase64: string;
}

/** Union of all supported cloud encryption configuration variants. */
export type CloudEncryptionConfig =
    | CloudEncryptionConfigNone
    | CloudEncryptionConfigPassphrase;

const cloudEncryptionConfigInternalSchema = z.discriminatedUnion("mode", [
    z
        .object({
            configVersion: z.literal(CLOUD_ENCRYPTION_CONFIG_VERSION),
            mode: z.literal("none"),
        })
        .strict(),
    z
        .object({
            configVersion: z.literal(CLOUD_ENCRYPTION_CONFIG_VERSION),
            kdf: z.literal("scrypt"),
            keyCheckBase64: z.string().min(1),
            mode: z.literal("passphrase"),
            saltBase64: z.string().min(1),
        })
        .strict(),
]);

/** Zod schema for {@link CloudEncryptionConfig}. */
export const cloudEncryptionConfigSchema: z.ZodType<CloudEncryptionConfig> =
    cloudEncryptionConfigInternalSchema;

/** Parses and validates a {@link CloudEncryptionConfig}. */
export function parseCloudEncryptionConfig(
    candidate: unknown
): CloudEncryptionConfig {
    return cloudEncryptionConfigInternalSchema.parse(candidate);
}

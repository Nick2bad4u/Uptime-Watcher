import { safeStorage } from "electron";

import { getUtfByteLength } from "@shared/utils/utfByteLength";
import { getUserFacingErrorDetail } from "@shared/utils/userFacingErrors";

import { logger } from "../../../utils/logger";
import { decodeCanonicalBase64 } from "../internal/cloudServicePrimitives";

const MAX_STORED_ENCRYPTED_SECRET_BYTES: number = 256 * 1024;

/**
 * Secret storage abstraction for cloud provider credentials.
 */
export interface SecretStore {
    /**
     * Deletes a secret.
     */
    deleteSecret: (key: string) => Promise<void>;

    /**
     * Retrieves a plaintext secret.
     */
    getSecret: (key: string) => Promise<string | undefined>;

    /**
     * Stores a plaintext secret.
     */
    setSecret: (key: string, value: string) => Promise<void>;
}

/**
 * Simple in-memory {@link SecretStore}.
 *
 * @remarks
 * This store is **not persisted** and is intended as a fallback for
 * environments where Electron {@link safeStorage} encryption is unavailable.
 */
export class EphemeralSecretStore implements SecretStore {
    private readonly values = new Map<string, string>();

    public async deleteSecret(key: string): Promise<void> {
        this.values.delete(key);
    }

    public async getSecret(key: string): Promise<string | undefined> {
        return this.values.get(key);
    }

    public async setSecret(key: string, value: string): Promise<void> {
        this.values.set(key, value);
    }
}

/**
 * {@link SecretStore} that falls back to a secondary store if the primary fails.
 */
export class FallbackSecretStore implements SecretStore {
    private readonly fallbackPreferredKeys = new Set<string>();

    private readonly fallback: SecretStore;

    private readonly primary: SecretStore;

    public constructor(args: { fallback: SecretStore; primary: SecretStore }) {
        this.primary = args.primary;
        this.fallback = args.fallback;
    }

    public async deleteSecret(key: string): Promise<void> {
        const results = await Promise.allSettled([
            this.primary.deleteSecret(key),
            this.fallback.deleteSecret(key),
        ]);
        const failures: unknown[] = [];
        for (const result of results) {
            if (result.status === "rejected") {
                failures.push(result.reason);
            }
        }

        if (failures.length > 0) {
            throw new AggregateError(
                failures,
                `Failed to delete secret '${key}' from one or more stores`,
                { cause: failures[0] }
            );
        }

        this.fallbackPreferredKeys.delete(key);
    }

    public async getSecret(key: string): Promise<string | undefined> {
        if (!this.fallbackPreferredKeys.has(key)) {
            try {
                const value = await this.primary.getSecret(key);
                if (typeof value === "string") {
                    return value;
                }
            } catch (error) {
                logger.warn(
                    "[FallbackSecretStore] Primary secret read failed; using fallback",
                    {
                        key,
                        message: getUserFacingErrorDetail(error),
                    }
                );
            }
        }

        return this.fallback.getSecret(key);
    }

    public async setSecret(key: string, value: string): Promise<void> {
        try {
            await this.primary.setSecret(key, value);
            this.fallbackPreferredKeys.delete(key);
            try {
                await this.fallback.deleteSecret(key);
            } catch (error) {
                logger.warn(
                    "[FallbackSecretStore] Failed to clear fallback secret after primary write; refreshing fallback copy",
                    {
                        key,
                        message: getUserFacingErrorDetail(error),
                    }
                );
                await this.fallback.setSecret(key, value);
            }
            return;
        } catch (error) {
            logger.warn(
                "[FallbackSecretStore] Primary secret write failed; using fallback",
                {
                    key,
                    message: getUserFacingErrorDetail(error),
                }
            );
            this.fallbackPreferredKeys.add(key);
            try {
                await this.primary.deleteSecret(key);
                this.fallbackPreferredKeys.delete(key);
            } catch (deleteError) {
                logger.warn(
                    "[FallbackSecretStore] Failed to clear stale primary secret after write failure",
                    {
                        key,
                        message: getUserFacingErrorDetail(deleteError),
                    }
                );
                // Keep preferring fallback for this key; primary may still
                // contain a stale readable value from an earlier write.
            }
        }

        await this.fallback.setSecret(key, value);
    }
}

/**
 * Simple {@link SecretStore} implementation that encrypts secrets using
 * Electron's {@link safeStorage} and persists them via the provided settings
 * adapter.
 *
 * @remarks
 * This avoids native keychain dependencies (e.g. keytar) while still ensuring
 * secrets are not stored in plaintext on disk.
 */
export class SafeStorageSecretStore implements SecretStore {
    private readonly settings: {
        get: (key: string) => Promise<string | undefined>;
        set: (key: string, value: string) => Promise<void>;
    };

    public constructor(args: {
        settings: {
            get: (key: string) => Promise<string | undefined>;
            set: (key: string, value: string) => Promise<void>;
        };
    }) {
        this.settings = args.settings;
    }

    public async deleteSecret(key: string): Promise<void> {
        await this.settings.set(key, "");
    }

    public async getSecret(key: string): Promise<string | undefined> {
        const stored = await this.settings.get(key);
        if (!stored) {
            return undefined;
        }

        if (getUtfByteLength(stored) > MAX_STORED_ENCRYPTED_SECRET_BYTES) {
            logger.warn(
                "[SafeStorageSecretStore] Stored secret exceeded encrypted size limit; clearing",
                {
                    key,
                    maxBytes: MAX_STORED_ENCRYPTED_SECRET_BYTES,
                }
            );
            try {
                await this.settings.set(key, "");
            } catch (clearError) {
                logger.warn(
                    "[SafeStorageSecretStore] Failed to clear oversized stored secret",
                    {
                        key,
                        message: getUserFacingErrorDetail(clearError),
                    }
                );
            }
            return undefined;
        }

        if (!safeStorage.isEncryptionAvailable()) {
            throw new Error(
                "Secure storage is not available on this system (Electron safeStorage)."
            );
        }

        try {
            const encrypted = decodeCanonicalBase64({
                label: "stored secret",
                value: stored,
            });
            return safeStorage.decryptString(encrypted);
        } catch (error) {
            logger.warn(
                "[SafeStorageSecretStore] Stored secret could not be decrypted; clearing",
                {
                    key,
                    message: getUserFacingErrorDetail(error),
                }
            );
            // If decryption fails (machine/user change, corruption), treat as missing.
            try {
                await this.settings.set(key, "");
            } catch (clearError) {
                logger.warn(
                    "[SafeStorageSecretStore] Failed to clear undecryptable stored secret",
                    {
                        key,
                        message: getUserFacingErrorDetail(clearError),
                    }
                );
            }
            return undefined;
        }
    }

    public async setSecret(key: string, value: string): Promise<void> {
        if (!safeStorage.isEncryptionAvailable()) {
            throw new Error(
                "Secure storage is not available on this system (Electron safeStorage)."
            );
        }

        const encrypted = safeStorage.encryptString(value);
        const stored = encrypted.toString("base64");
        if (getUtfByteLength(stored) > MAX_STORED_ENCRYPTED_SECRET_BYTES) {
            throw new Error(
                `Encrypted secret exceeds maximum size of ${MAX_STORED_ENCRYPTED_SECRET_BYTES} bytes.`
            );
        }

        await this.settings.set(key, stored);
    }
}

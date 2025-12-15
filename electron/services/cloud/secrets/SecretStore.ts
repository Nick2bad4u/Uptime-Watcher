import { safeStorage } from "electron";

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
        await Promise.resolve();
    }

    public async getSecret(key: string): Promise<string | undefined> {
        await Promise.resolve();
        return this.values.get(key);
    }

    public async setSecret(key: string, value: string): Promise<void> {
        this.values.set(key, value);
        await Promise.resolve();
    }
}

/**
 * {@link SecretStore} that falls back to a secondary store if the primary fails.
 */
export class FallbackSecretStore implements SecretStore {
    private readonly primary: SecretStore;

    private readonly fallback: SecretStore;

    public async deleteSecret(key: string): Promise<void> {
        await this.primary.deleteSecret(key).catch(() => {});
        await this.fallback.deleteSecret(key).catch(() => {});
    }

    public async getSecret(key: string): Promise<string | undefined> {
        try {
            const value = await this.primary.getSecret(key);
            if (typeof value === "string") {
                return value;
            }
        } catch {
            // Ignore
        }

        return this.fallback.getSecret(key);
    }

    public async setSecret(key: string, value: string): Promise<void> {
        try {
            await this.primary.setSecret(key, value);
            return;
        } catch {
            // Ignore
        }

        await this.fallback.setSecret(key, value);
    }

    public constructor(args: { fallback: SecretStore; primary: SecretStore }) {
        this.primary = args.primary;
        this.fallback = args.fallback;
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

    public async getSecret(key: string): Promise<string | undefined> {
        const stored = await this.settings.get(key);
        if (!stored) {
            return undefined;
        }

        if (!safeStorage.isEncryptionAvailable()) {
            throw new Error(
                "Secure storage is not available on this system (Electron safeStorage)."
            );
        }

        try {
            return safeStorage.decryptString(Buffer.from(stored, "base64"));
        } catch {
            // If decryption fails (machine/user change, corruption), treat as missing.
            await this.settings.set(key, "").catch(() => {});
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
        await this.settings.set(key, encrypted.toString("base64"));
    }

    public async deleteSecret(key: string): Promise<void> {
        await this.settings.set(key, "");
    }

    public constructor(args: {
        settings: {
            get: (key: string) => Promise<string | undefined>;
            set: (key: string, value: string) => Promise<void>;
        };
    }) {
        this.settings = args.settings;
    }
}

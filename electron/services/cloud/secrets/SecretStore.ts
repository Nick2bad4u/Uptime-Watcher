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
            throw new Error("Electron safeStorage encryption is not available");
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
            throw new Error("Electron safeStorage encryption is not available");
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

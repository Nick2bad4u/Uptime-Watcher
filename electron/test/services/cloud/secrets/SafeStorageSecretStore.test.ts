import {
    FallbackSecretStore,
    SafeStorageSecretStore,
    type SecretStore,
} from "@electron/services/cloud/secrets/SecretStore";
import { logger } from "@electron/utils/logger";
import { describe, expect, it, vi } from "vitest";

vi.mock("electron", () => ({
    safeStorage: {
        decryptString: (value: Buffer) => {
            const text = value.toString("utf8");
            if (!text.startsWith("enc:")) {
                throw new Error("Invalid ciphertext");
            }
            return text.slice("enc:".length);
        },
        encryptString: (value: string) => Buffer.from(`enc:${value}`, "utf8"),
        isEncryptionAvailable: () => true,
    },
}));

describe(SafeStorageSecretStore, () => {
    it("round-trips secrets using base64 storage", async () => {
        const settings = new Map<string, string>();

        const store = new SafeStorageSecretStore({
            settings: {
                get: async (key) => settings.get(key),
                set: async (key, value) => {
                    settings.set(key, value);
                },
            },
        });

        await store.setSecret("cloud.dropbox.tokens", "token-json");

        const rawStored = settings.get("cloud.dropbox.tokens");
        expect(rawStored).toBeTypeOf("string");
        expect(rawStored).not.toBe("token-json");

        const decrypted = await store.getSecret("cloud.dropbox.tokens");
        expect(decrypted).toBe("token-json");
    });

    it("clears corrupted secrets and returns undefined", async () => {
        const settings = new Map<string, string>();

        const store = new SafeStorageSecretStore({
            settings: {
                get: async (key) => settings.get(key),
                set: async (key, value) => {
                    settings.set(key, value);
                },
            },
        });

        settings.set(
            "cloud.dropbox.tokens",
            Buffer.from("not-encrypted", "utf8").toString("base64")
        );

        await expect(store.getSecret("cloud.dropbox.tokens")).resolves.toBe(
            undefined
        );
        expect(settings.get("cloud.dropbox.tokens")).toBe("");
    });

    it("clears non-canonical base64 secrets before decryption", async () => {
        const settings = new Map<string, string>();

        const store = new SafeStorageSecretStore({
            settings: {
                get: async (key) => settings.get(key),
                set: async (key, value) => {
                    settings.set(key, value);
                },
            },
        });

        settings.set("cloud.dropbox.tokens", "not-base64!");

        await expect(store.getSecret("cloud.dropbox.tokens")).resolves.toBe(
            undefined
        );
        expect(settings.get("cloud.dropbox.tokens")).toBe("");
    });

    it("clears oversized stored secrets before decoding", async () => {
        const loggerWarn = vi
            .spyOn(logger, "warn")
            .mockImplementation(() => {});
        const settings = new Map<string, string>();

        const store = new SafeStorageSecretStore({
            settings: {
                get: async (key) => settings.get(key),
                set: async (key, value) => {
                    settings.set(key, value);
                },
            },
        });

        settings.set("cloud.dropbox.tokens", "a".repeat(300 * 1024));

        await expect(store.getSecret("cloud.dropbox.tokens")).resolves.toBe(
            undefined
        );

        expect(settings.get("cloud.dropbox.tokens")).toBe("");
        expect(loggerWarn).toHaveBeenCalledWith(
            "[SafeStorageSecretStore] Stored secret exceeded encrypted size limit; clearing",
            {
                key: "cloud.dropbox.tokens",
                maxBytes: 256 * 1024,
            }
        );

        loggerWarn.mockRestore();
    });

    it("rejects secrets that exceed the encrypted storage size limit", async () => {
        const settings = new Map<string, string>();

        const store = new SafeStorageSecretStore({
            settings: {
                get: async (key) => settings.get(key),
                set: async (key, value) => {
                    settings.set(key, value);
                },
            },
        });

        await expect(
            store.setSecret("cloud.dropbox.tokens", "x".repeat(300 * 1024))
        ).rejects.toThrow("Encrypted secret exceeds maximum size");
        expect(settings.has("cloud.dropbox.tokens")).toBeFalsy();
    });

    it("logs when an undecryptable secret cannot be cleared", async () => {
        const loggerWarn = vi
            .spyOn(logger, "warn")
            .mockImplementation(() => {});
        const store = new SafeStorageSecretStore({
            settings: {
                get: async () =>
                    Buffer.from("not-encrypted", "utf8").toString("base64"),
                set: async () => {
                    throw new Error("settings write failed");
                },
            },
        });

        await expect(store.getSecret("cloud.dropbox.tokens")).resolves.toBe(
            undefined
        );

        expect(loggerWarn).toHaveBeenCalledWith(
            "[SafeStorageSecretStore] Stored secret could not be decrypted; clearing",
            {
                key: "cloud.dropbox.tokens",
                message: "Invalid ciphertext",
            }
        );
        expect(loggerWarn).toHaveBeenCalledWith(
            "[SafeStorageSecretStore] Failed to clear undecryptable stored secret",
            {
                key: "cloud.dropbox.tokens",
                message: "settings write failed",
            }
        );

        loggerWarn.mockRestore();
    });
});

class MutableSecretStore implements SecretStore {
    public readonly values = new Map<string, string>();

    public shouldFailGet = false;

    public shouldFailDelete = false;

    public shouldFailSet = false;

    public async deleteSecret(key: string): Promise<void> {
        if (this.shouldFailDelete) {
            throw new Error("delete failed");
        }

        this.values.delete(key);
    }

    public async getSecret(key: string): Promise<string | undefined> {
        if (this.shouldFailGet) {
            throw new Error("get failed");
        }

        return this.values.get(key);
    }

    public async setSecret(key: string, value: string): Promise<void> {
        if (this.shouldFailSet) {
            throw new Error("set failed");
        }

        this.values.set(key, value);
    }
}

describe(FallbackSecretStore, () => {
    it("deletes secrets from both stores", async () => {
        const primary = new MutableSecretStore();
        const fallback = new MutableSecretStore();
        const store = new FallbackSecretStore({ fallback, primary });

        await primary.setSecret("cloud.dropbox.tokens", "primary-token-json");
        await fallback.setSecret("cloud.dropbox.tokens", "fallback-token-json");

        await expect(
            store.deleteSecret("cloud.dropbox.tokens")
        ).resolves.toBeUndefined();

        expect(primary.values.has("cloud.dropbox.tokens")).toBeFalsy();
        expect(fallback.values.has("cloud.dropbox.tokens")).toBeFalsy();
    });

    it("reports partial delete failure after attempting both stores", async () => {
        const primary = new MutableSecretStore();
        const fallback = new MutableSecretStore();
        const store = new FallbackSecretStore({ fallback, primary });

        await primary.setSecret("cloud.dropbox.tokens", "primary-token-json");
        await fallback.setSecret("cloud.dropbox.tokens", "fallback-token-json");
        primary.shouldFailDelete = true;

        await expect(
            store.deleteSecret("cloud.dropbox.tokens")
        ).rejects.toMatchObject({
            errors: [expect.any(Error)],
            message:
                "Failed to delete secret 'cloud.dropbox.tokens' from one or more stores",
        });

        expect(primary.values.get("cloud.dropbox.tokens")).toBe(
            "primary-token-json"
        );
        expect(fallback.values.has("cloud.dropbox.tokens")).toBeFalsy();
    });

    it("clears stale fallback values after primary storage succeeds", async () => {
        const primary = new MutableSecretStore();
        const fallback = new MutableSecretStore();
        const store = new FallbackSecretStore({ fallback, primary });

        primary.shouldFailSet = true;
        await store.setSecret("cloud.dropbox.tokens", "old-token-json");
        expect(fallback.values.get("cloud.dropbox.tokens")).toBe(
            "old-token-json"
        );

        primary.shouldFailSet = false;
        await store.setSecret("cloud.dropbox.tokens", "new-token-json");
        expect(primary.values.get("cloud.dropbox.tokens")).toBe(
            "new-token-json"
        );
        expect(fallback.values.has("cloud.dropbox.tokens")).toBeFalsy();

        primary.shouldFailGet = true;
        await expect(
            store.getSecret("cloud.dropbox.tokens")
        ).resolves.toBeUndefined();
    });

    it("updates fallback value when stale fallback deletion fails after primary storage succeeds", async () => {
        const primary = new MutableSecretStore();
        const fallback = new MutableSecretStore();
        const store = new FallbackSecretStore({ fallback, primary });

        primary.shouldFailSet = true;
        await store.setSecret("cloud.dropbox.tokens", "old-token-json");
        expect(fallback.values.get("cloud.dropbox.tokens")).toBe(
            "old-token-json"
        );

        primary.shouldFailSet = false;
        fallback.shouldFailDelete = true;
        await store.setSecret("cloud.dropbox.tokens", "new-token-json");

        expect(primary.values.get("cloud.dropbox.tokens")).toBe(
            "new-token-json"
        );
        expect(fallback.values.get("cloud.dropbox.tokens")).toBe(
            "new-token-json"
        );

        primary.shouldFailGet = true;
        await expect(store.getSecret("cloud.dropbox.tokens")).resolves.toBe(
            "new-token-json"
        );
    });
});

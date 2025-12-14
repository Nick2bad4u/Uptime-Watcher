import { describe, expect, it, vi } from "vitest";

import { SafeStorageSecretStore } from "@electron/services/cloud/secrets/SecretStore";

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
});

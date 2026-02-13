import { describe, expect, it } from "vitest";

import type { SecretStore } from "@electron/services/cloud/secrets/SecretStore";

import { deleteProviderSecretsBestEffort } from "@electron/services/cloud/internal/providerSecretCleanup";

class ThrowingSecretStore implements SecretStore {
    private readonly keys = new Map<string, string>();

    private readonly keysThatFailDeletion: ReadonlySet<string>;

    public async deleteSecret(key: string): Promise<void> {
        if (this.keysThatFailDeletion.has(key)) {
            throw new Error(`delete failed for ${key}`);
        }

        this.keys.delete(key);
    }

    public async getSecret(key: string): Promise<string | undefined> {
        return this.keys.get(key);
    }

    public async setSecret(key: string, value: string): Promise<void> {
        this.keys.set(key, value);
    }

    public constructor(keysThatFailDeletion: readonly string[] = []) {
        this.keysThatFailDeletion = new Set(keysThatFailDeletion);
    }
}

describe(deleteProviderSecretsBestEffort, () => {
    it("deletes all provided secrets when deletion succeeds", async () => {
        const secretStore = new ThrowingSecretStore();

        await secretStore.setSecret("key-1", "value-1");
        await secretStore.setSecret("key-2", "value-2");

        await deleteProviderSecretsBestEffort({
            operationLabel: "test",
            secretKeys: ["key-1", "key-2"],
            secretStore,
        });

        await expect(secretStore.getSecret("key-1")).resolves.toBeUndefined();
        await expect(secretStore.getSecret("key-2")).resolves.toBeUndefined();
    });

    it("continues deleting remaining secrets when one deletion fails", async () => {
        const secretStore = new ThrowingSecretStore(["key-2"]);

        await secretStore.setSecret("key-1", "value-1");
        await secretStore.setSecret("key-2", "value-2");
        await secretStore.setSecret("key-3", "value-3");

        await expect(
            deleteProviderSecretsBestEffort({
                operationLabel: "test",
                secretKeys: [
                    "key-1",
                    "key-2",
                    "key-3",
                ],
                secretStore,
            })
        ).resolves.toBeUndefined();

        await expect(secretStore.getSecret("key-1")).resolves.toBeUndefined();
        await expect(secretStore.getSecret("key-2")).resolves.toBe("value-2");
        await expect(secretStore.getSecret("key-3")).resolves.toBeUndefined();
    });
});

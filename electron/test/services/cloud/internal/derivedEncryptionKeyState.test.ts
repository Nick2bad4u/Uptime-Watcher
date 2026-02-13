import { describe, expect, it } from "vitest";

import { InMemorySecretStore } from "../../../utils/InMemorySecretStore";

import { ENCRYPTION_KEY_BYTES } from "@electron/services/cloud/internal/cloudServicePrimitives";
import { resolveStoredDerivedEncryptionKey } from "@electron/services/cloud/internal/derivedEncryptionKeyState";
import { SECRET_KEY_ENCRYPTION_DERIVED_KEY } from "@electron/services/cloud/internal/cloudServiceSettings";

describe(resolveStoredDerivedEncryptionKey, () => {
    it("returns missing when no key is stored", async () => {
        const secretStore = new InMemorySecretStore();

        await expect(
            resolveStoredDerivedEncryptionKey({ secretStore })
        ).resolves.toStrictEqual({ kind: "missing" });
    });

    it("returns available when a valid key is stored", async () => {
        const secretStore = new InMemorySecretStore();
        const key = Buffer.alloc(ENCRYPTION_KEY_BYTES, 7);

        await secretStore.setSecret(
            SECRET_KEY_ENCRYPTION_DERIVED_KEY,
            key.toString("base64")
        );

        const result = await resolveStoredDerivedEncryptionKey({ secretStore });

        expect(result.kind).toBe("available");
        if (result.kind === "available") {
            expect(result.key.equals(key)).toBeTruthy();
        }
    });

    it("returns invalid and clears corrupted key values", async () => {
        const secretStore = new InMemorySecretStore();
        await secretStore.setSecret(
            SECRET_KEY_ENCRYPTION_DERIVED_KEY,
            "not-base64"
        );

        await expect(
            resolveStoredDerivedEncryptionKey({ secretStore })
        ).resolves.toStrictEqual({ kind: "invalid" });
        await expect(
            secretStore.getSecret(SECRET_KEY_ENCRYPTION_DERIVED_KEY)
        ).resolves.toBeUndefined();
    });
});

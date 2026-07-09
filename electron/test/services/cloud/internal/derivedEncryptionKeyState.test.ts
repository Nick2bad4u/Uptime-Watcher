import { ENCRYPTION_KEY_BYTES } from "@electron/services/cloud/internal/cloudServicePrimitives";
import { SECRET_KEY_ENCRYPTION_DERIVED_KEY } from "@electron/services/cloud/internal/cloudServiceSettings";
import { resolveStoredDerivedEncryptionKey } from "@electron/services/cloud/internal/derivedEncryptionKeyState";
import { logger } from "@electron/utils/logger";
import { describe, expect, it, vi } from "vitest";

import { InMemorySecretStore } from "../../../utils/InMemorySecretStore";

describe(resolveStoredDerivedEncryptionKey, () => {
    it("returns missing when no key is stored", async () => {
        const secretStore = new InMemorySecretStore();

        await expect(
            resolveStoredDerivedEncryptionKey({ secretStore })
        ).resolves.toStrictEqual({ kind: "missing" });
    });

    it("returns invalid and clears empty stored key values", async () => {
        const secretStore = new InMemorySecretStore();
        await secretStore.setSecret(SECRET_KEY_ENCRYPTION_DERIVED_KEY, "");

        await expect(
            resolveStoredDerivedEncryptionKey({ secretStore })
        ).resolves.toStrictEqual({ kind: "invalid" });
        await expect(
            secretStore.getSecret(SECRET_KEY_ENCRYPTION_DERIVED_KEY)
        ).resolves.toBeUndefined();
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

    it("logs when clearing a corrupted key value fails", async () => {
        const loggerWarn = vi
            .spyOn(logger, "warn")
            .mockImplementation(() => {});
        const secretStore = {
            deleteSecret: vi.fn(async () => {
                throw new Error("delete failed");
            }),
            getSecret: vi.fn(async () => "not-base64"),
            setSecret: vi.fn(async () => {}),
        };

        await expect(
            resolveStoredDerivedEncryptionKey({ secretStore })
        ).resolves.toStrictEqual({ kind: "invalid" });

        expect(loggerWarn).toHaveBeenCalledWith(
            "[CloudService] Stored derived encryption key was invalid; clearing",
            {
                message: expect.any(String),
                storageKey: SECRET_KEY_ENCRYPTION_DERIVED_KEY,
            }
        );
        expect(loggerWarn).toHaveBeenCalledWith(
            "[CloudService] Failed to clear invalid derived encryption key",
            {
                message: "delete failed",
                storageKey: SECRET_KEY_ENCRYPTION_DERIVED_KEY,
            }
        );
        expect(secretStore.deleteSecret).toHaveBeenCalledWith(
            SECRET_KEY_ENCRYPTION_DERIVED_KEY
        );

        loggerWarn.mockRestore();
    });
});

import {
    SECRET_KEY_ENCRYPTION_DERIVED_KEY,
    SETTINGS_KEY_ENCRYPTION_MODE,
    SETTINGS_KEY_ENCRYPTION_SALT,
} from "@electron/services/cloud/internal/cloudServiceSettings";
import { persistLocalPassphraseEncryptionState } from "@electron/services/cloud/internal/localPassphraseEncryptionState";
import { describe, expect, it } from "vitest";

import type { CloudSettingsAdapter } from "@electron/services/cloud/CloudService.types";
import type { SecretStore } from "@electron/services/cloud/secrets/SecretStore";

import { InMemorySecretStore } from "../../../utils/InMemorySecretStore";
import { createInMemoryCloudSettingsAdapter } from "./createInMemoryCloudSettingsAdapter";

describe(persistLocalPassphraseEncryptionState, () => {
    it("stores passphrase mode, salt, and encoded derived key", async () => {
        const settings = createInMemoryCloudSettingsAdapter();
        const secretStore = new InMemorySecretStore();
        const key = Buffer.from("0123456789abcdef0123456789abcdef", "utf8");

        await persistLocalPassphraseEncryptionState({
            derivedKey: key,
            saltBase64: "c2FsdA==",
            secretStore,
            settings,
        });

        await expect(settings.get(SETTINGS_KEY_ENCRYPTION_MODE)).resolves.toBe(
            "passphrase"
        );
        await expect(settings.get(SETTINGS_KEY_ENCRYPTION_SALT)).resolves.toBe(
            "c2FsdA=="
        );
        await expect(
            secretStore.getSecret(SECRET_KEY_ENCRYPTION_DERIVED_KEY)
        ).resolves.toBe(key.toString("base64"));
    });

    it("rolls back passphrase mode when salt persistence fails", async () => {
        const baseSettings = createInMemoryCloudSettingsAdapter({
            [SETTINGS_KEY_ENCRYPTION_MODE]: "none",
            [SETTINGS_KEY_ENCRYPTION_SALT]: "old-salt",
        });
        const settings: CloudSettingsAdapter = {
            ...baseSettings,
            set: async (key, value) => {
                if (
                    key === SETTINGS_KEY_ENCRYPTION_SALT &&
                    value === "new-salt"
                ) {
                    throw new Error("salt persistence failed");
                }

                await baseSettings.set(key, value);
            },
        };
        const secretStore = new InMemorySecretStore();
        const key = Buffer.from("0123456789abcdef0123456789abcdef", "utf8");

        await expect(
            persistLocalPassphraseEncryptionState({
                derivedKey: key,
                saltBase64: "new-salt",
                secretStore,
                settings,
            })
        ).rejects.toThrow("salt persistence failed");

        await expect(settings.get(SETTINGS_KEY_ENCRYPTION_MODE)).resolves.toBe(
            "none"
        );
        await expect(settings.get(SETTINGS_KEY_ENCRYPTION_SALT)).resolves.toBe(
            "old-salt"
        );
        await expect(
            secretStore.getSecret(SECRET_KEY_ENCRYPTION_DERIVED_KEY)
        ).resolves.toBeUndefined();
    });

    it("rolls back settings and restores the previous key when secret persistence fails", async () => {
        const baseSettings = createInMemoryCloudSettingsAdapter({
            [SETTINGS_KEY_ENCRYPTION_MODE]: "none",
            [SETTINGS_KEY_ENCRYPTION_SALT]: "old-salt",
        });
        const previousKey = "previous-key";
        let restoredKey: string | undefined;
        const secretStore: SecretStore = {
            deleteSecret: async (_key) => undefined,
            getSecret: async (_key) => previousKey,
            setSecret: async (_key, value) => {
                if (value !== previousKey) {
                    throw new Error("secret persistence failed");
                }

                restoredKey = value;
            },
        };
        const key = Buffer.from("0123456789abcdef0123456789abcdef", "utf8");

        await expect(
            persistLocalPassphraseEncryptionState({
                derivedKey: key,
                saltBase64: "new-salt",
                secretStore,
                settings: baseSettings,
            })
        ).rejects.toThrow("secret persistence failed");

        await expect(
            baseSettings.get(SETTINGS_KEY_ENCRYPTION_MODE)
        ).resolves.toBe("none");
        await expect(
            baseSettings.get(SETTINGS_KEY_ENCRYPTION_SALT)
        ).resolves.toBe("old-salt");
        expect(restoredKey).toBe(previousKey);
    });
});

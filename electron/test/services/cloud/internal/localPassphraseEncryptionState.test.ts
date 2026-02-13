import { describe, expect, it } from "vitest";

import { InMemorySecretStore } from "../../../utils/InMemorySecretStore";

import {
    SECRET_KEY_ENCRYPTION_DERIVED_KEY,
    SETTINGS_KEY_ENCRYPTION_MODE,
    SETTINGS_KEY_ENCRYPTION_SALT,
} from "@electron/services/cloud/internal/cloudServiceSettings";
import { persistLocalPassphraseEncryptionState } from "@electron/services/cloud/internal/localPassphraseEncryptionState";

function createSettingsAdapter(seed?: Record<string, string>): {
    get: (key: string) => Promise<string | undefined>;
    set: (key: string, value: string) => Promise<void>;
} {
    const data = new Map<string, string>(Object.entries(seed ?? {}));

    return {
        get: async (key) => data.get(key),
        set: async (key, value) => {
            data.set(key, value);
        },
    };
}

describe(persistLocalPassphraseEncryptionState, () => {
    it("stores passphrase mode, salt, and encoded derived key", async () => {
        const settings = createSettingsAdapter();
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
});

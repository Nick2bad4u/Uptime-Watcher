import type { UnknownRecord } from "type-fest";

import { describe, expect, it, vi } from "vitest";

import { EphemeralSecretStore } from "../../../../services/cloud/secrets/SecretStore";
import {
    MAX_STORED_OAUTH_TOKEN_JSON_BYTES,
    readStoredJsonSecret,
} from "../../../../services/cloud/providers/oauthStoredTokens";

describe(readStoredJsonSecret, () => {
    it("clears oversized token JSON before parsing", async () => {
        const secretStore = new EphemeralSecretStore();
        const storageKey = "cloud.provider.tokens";
        const clear = vi.fn(async () => {
            await secretStore.deleteSecret(storageKey);
        });
        const logger = {
            warn: vi.fn(),
        };
        const parse = vi.fn((record: UnknownRecord) => record);

        await secretStore.setSecret(
            storageKey,
            `{"accessToken":"${"x".repeat(MAX_STORED_OAUTH_TOKEN_JSON_BYTES)}"}`
        );

        await expect(
            readStoredJsonSecret({
                clear,
                logger,
                logPrefix: "[TestTokenManager]",
                parse,
                secretStore,
                storageKey,
            })
        ).resolves.toBeUndefined();

        expect(parse).not.toHaveBeenCalled();
        expect(clear).toHaveBeenCalledTimes(1);
        await expect(
            secretStore.getSecret(storageKey)
        ).resolves.toBeUndefined();
        expect(logger.warn).toHaveBeenCalledWith(
            "[TestTokenManager] Stored tokens exceeded maximum size; clearing",
            {
                maxBytes: MAX_STORED_OAUTH_TOKEN_JSON_BYTES,
                storageKey,
            }
        );
    });
});

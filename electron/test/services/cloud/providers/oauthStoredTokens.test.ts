import type { UnknownRecord } from "type-fest";

import { describe, expect, it, vi } from "vitest";

import { readStoredJsonSecret } from "../../../../services/cloud/providers/oauthStoredTokens";
import type { SecretStore } from "../../../../services/cloud/secrets/SecretStore";
import { EphemeralSecretStore } from "../../../../services/cloud/secrets/SecretStore";

const MAX_STORED_OAUTH_TOKEN_JSON_BYTES = 64 * 1024;

function createReadArgs(args?: {
    clear?: () => Promise<void>;
    logger?: { warn: ReturnType<typeof vi.fn> };
    parse?: (record: UnknownRecord) => UnknownRecord;
    secretStore?: SecretStore;
    storageKey?: string;
}): Parameters<typeof readStoredJsonSecret<UnknownRecord>>[0] {
    const secretStore = args?.secretStore ?? new EphemeralSecretStore();
    const storageKey = args?.storageKey ?? "cloud.provider.tokens";

    return {
        clear:
            args?.clear ??
            (async () => {
                await secretStore.deleteSecret(storageKey);
            }),
        logger: args?.logger ?? { warn: vi.fn() },
        logPrefix: "[TestTokenManager]",
        parse: args?.parse ?? ((record): UnknownRecord => record),
        secretStore,
        storageKey,
    };
}

describe(readStoredJsonSecret, () => {
    it("returns undefined without clearing when no token secret exists", async () => {
        const clear = vi.fn(async () => undefined);
        const parse = vi.fn((record: UnknownRecord) => record);
        const args = createReadArgs({ clear, parse });

        await expect(readStoredJsonSecret(args)).resolves.toBeUndefined();

        expect(parse).not.toHaveBeenCalled();
        expect(clear).not.toHaveBeenCalled();
        expect(args.logger.warn).not.toHaveBeenCalled();
    });

    it("clears empty token secrets as invalid JSON", async () => {
        const secretStore = new EphemeralSecretStore();
        const storageKey = "cloud.provider.tokens";
        const clear = vi.fn(async () => {
            await secretStore.deleteSecret(storageKey);
        });
        const parse = vi.fn((record: UnknownRecord) => record);
        const args = createReadArgs({ clear, parse, secretStore, storageKey });

        await secretStore.setSecret(storageKey, "");

        await expect(readStoredJsonSecret(args)).resolves.toBeUndefined();

        expect(parse).not.toHaveBeenCalled();
        expect(clear).toHaveBeenCalledTimes(1);
        await expect(
            secretStore.getSecret(storageKey)
        ).resolves.toBeUndefined();
        expect(args.logger.warn).toHaveBeenCalledWith(
            "[TestTokenManager] Stored tokens were not valid JSON; clearing",
            {
                storageKey,
            }
        );
    });

    it("clears oversized token JSON before parsing", async () => {
        const secretStore = new EphemeralSecretStore();
        const storageKey = "cloud.provider.tokens";
        const clear = vi.fn(async () => {
            await secretStore.deleteSecret(storageKey);
        });
        const parse = vi.fn((record: UnknownRecord) => record);
        const args = createReadArgs({ clear, parse, secretStore, storageKey });

        await secretStore.setSecret(
            storageKey,
            `{"accessToken":"${"x".repeat(MAX_STORED_OAUTH_TOKEN_JSON_BYTES)}"}`
        );

        await expect(readStoredJsonSecret(args)).resolves.toBeUndefined();

        expect(parse).not.toHaveBeenCalled();
        expect(clear).toHaveBeenCalledTimes(1);
        await expect(
            secretStore.getSecret(storageKey)
        ).resolves.toBeUndefined();
        expect(args.logger.warn).toHaveBeenCalledWith(
            "[TestTokenManager] Stored tokens exceeded maximum size; clearing",
            {
                maxBytes: MAX_STORED_OAUTH_TOKEN_JSON_BYTES,
                storageKey,
            }
        );
    });

    it("clears schema-invalid token JSON", async () => {
        const secretStore = new EphemeralSecretStore();
        const storageKey = "cloud.provider.tokens";
        const clear = vi.fn(async () => {
            await secretStore.deleteSecret(storageKey);
        });
        const parse = vi.fn(() => {
            throw new TypeError("tokens failed validation");
        });
        const args = createReadArgs({ clear, parse, secretStore, storageKey });

        await secretStore.setSecret(storageKey, "{\"accessToken\":\"secret\"}");

        await expect(readStoredJsonSecret(args)).resolves.toBeUndefined();

        expect(parse).toHaveBeenCalledTimes(1);
        expect(clear).toHaveBeenCalledTimes(1);
        await expect(
            secretStore.getSecret(storageKey)
        ).resolves.toBeUndefined();
        expect(args.logger.warn).toHaveBeenCalledWith(
            "[TestTokenManager] Stored tokens failed schema validation; clearing",
            {
                message: "tokens failed validation",
                storageKey,
            }
        );
    });

    it("logs failed invalid-token cleanup without throwing", async () => {
        const secretStore = new EphemeralSecretStore();
        const storageKey = "cloud.provider.tokens";
        const clear = vi.fn(async () => {
            throw new Error("cleanup failed");
        });
        const args = createReadArgs({ clear, secretStore, storageKey });

        await secretStore.setSecret(storageKey, "not-json");

        await expect(readStoredJsonSecret(args)).resolves.toBeUndefined();

        expect(clear).toHaveBeenCalledTimes(1);
        await expect(secretStore.getSecret(storageKey)).resolves.toBe(
            "not-json"
        );
        expect(args.logger.warn).toHaveBeenCalledWith(
            "[TestTokenManager] Failed to clear invalid stored tokens",
            {
                message: "cleanup failed",
                storageKey,
            }
        );
    });
});

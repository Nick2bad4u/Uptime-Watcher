import { resolveCloudProviderOrNull } from "@electron/services/cloud/internal/resolveCloudProviderOrNull";
import { InMemorySecretStore } from "@electron/test/utils/InMemorySecretStore";
import { describe, expect, it, vi } from "vitest";

import type { CloudSettingsAdapter } from "../../../../services/cloud/CloudService.types";
import type { SecretStore } from "../../../../services/cloud/secrets/SecretStore";

const keys = {
    dropboxTokens: "cloud.dropbox.tokens",
    filesystemBaseDirectory: "cloud.filesystem.baseDirectory",
    googleDriveTokens: "cloud.googleDrive.tokens",
    provider: "cloud.provider",
} as const;

function createSettings(
    values: Readonly<Record<string, string | undefined>>
): CloudSettingsAdapter {
    return {
        get: vi.fn(async (key: string) => values[key]),
        set: vi.fn(),
    };
}

function createFailingSecretStore(error: Error): SecretStore {
    return {
        deleteSecret: vi.fn(async () => undefined),
        getSecret: vi.fn(async () => {
            throw error;
        }),
        setSecret: vi.fn(async () => undefined),
    };
}

describe(resolveCloudProviderOrNull, () => {
    it("returns null for configured Dropbox without stored tokens", async () => {
        await expect(
            resolveCloudProviderOrNull({
                getDropboxAppKey: () => "dropbox-app-key",
                keys,
                secretStore: new InMemorySecretStore(),
                settings: createSettings({
                    [keys.provider]: "dropbox",
                }),
            })
        ).resolves.toBeNull();
    });

    it("surfaces Dropbox token storage read failures", async () => {
        const readError = new Error("secure storage unavailable");

        await expect(
            resolveCloudProviderOrNull({
                getDropboxAppKey: () => "dropbox-app-key",
                keys,
                secretStore: createFailingSecretStore(readError),
                settings: createSettings({
                    [keys.provider]: "dropbox",
                }),
            })
        ).rejects.toThrow(readError);
    });

    it("returns null for configured Google Drive without stored tokens", async () => {
        await expect(
            resolveCloudProviderOrNull({
                getDropboxAppKey: () => "dropbox-app-key",
                keys,
                secretStore: new InMemorySecretStore(),
                settings: createSettings({
                    [keys.provider]: "google-drive",
                }),
            })
        ).resolves.toBeNull();
    });

    it("surfaces Google Drive token storage read failures", async () => {
        const readError = new Error("secure storage unavailable");

        await expect(
            resolveCloudProviderOrNull({
                getDropboxAppKey: () => "dropbox-app-key",
                keys,
                secretStore: createFailingSecretStore(readError),
                settings: createSettings({
                    [keys.provider]: "google-drive",
                }),
            })
        ).rejects.toThrow(readError);
    });
});

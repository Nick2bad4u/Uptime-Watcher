import { describe, expect, it } from "vitest";

import { InMemorySecretStore } from "../../../utils/InMemorySecretStore";
import { createInMemoryCloudSettingsAdapter } from "./createInMemoryCloudSettingsAdapter";

import {
    SETTINGS_KEY_FILESYSTEM_BASE_DIRECTORY,
    SETTINGS_KEY_GOOGLE_DRIVE_ACCOUNT_LABEL,
    SETTINGS_KEY_GOOGLE_DRIVE_TOKENS,
    SETTINGS_KEY_PROVIDER,
} from "../../../../services/cloud/internal/cloudServiceSettings";
import {
    captureProviderConnectionState,
    restoreProviderConnectionState,
} from "../../../../services/cloud/internal/providerConnectionState";

describe("providerConnectionState", () => {
    it("captures provider settings, token snapshot, and optional account label", async () => {
        const settings = createInMemoryCloudSettingsAdapter({
            [SETTINGS_KEY_FILESYSTEM_BASE_DIRECTORY]: "/tmp/original",
            [SETTINGS_KEY_GOOGLE_DRIVE_ACCOUNT_LABEL]: "existing-label",
            [SETTINGS_KEY_PROVIDER]: "filesystem",
        });
        const secretStore = new InMemorySecretStore();

        await secretStore.setSecret(
            SETTINGS_KEY_GOOGLE_DRIVE_TOKENS,
            "existing-google-secret"
        );

        const snapshot = await captureProviderConnectionState({
            ctx: { secretStore, settings },
            includeGoogleDriveAccountLabel: true,
            tokenStorageKey: SETTINGS_KEY_GOOGLE_DRIVE_TOKENS,
        });

        expect(snapshot.previousProvider).toBe("filesystem");
        expect(snapshot.previousFilesystemBaseDirectory).toBe("/tmp/original");
        expect(snapshot.previousStoredTokens).toBe("existing-google-secret");
        expect(snapshot.previousGoogleDriveAccountLabel).toBe("existing-label");
    });

    it("restores token + settings snapshot after a failed provider mutation", async () => {
        const settings = createInMemoryCloudSettingsAdapter({
            [SETTINGS_KEY_FILESYSTEM_BASE_DIRECTORY]: "/tmp/original",
            [SETTINGS_KEY_GOOGLE_DRIVE_ACCOUNT_LABEL]: "existing-label",
            [SETTINGS_KEY_PROVIDER]: "filesystem",
        });
        const secretStore = new InMemorySecretStore();

        await secretStore.setSecret(
            SETTINGS_KEY_GOOGLE_DRIVE_TOKENS,
            "existing-google-secret"
        );

        const snapshot = await captureProviderConnectionState({
            ctx: { secretStore, settings },
            includeGoogleDriveAccountLabel: true,
            tokenStorageKey: SETTINGS_KEY_GOOGLE_DRIVE_TOKENS,
        });

        await secretStore.setSecret(
            SETTINGS_KEY_GOOGLE_DRIVE_TOKENS,
            "new-google-secret"
        );
        await settings.set(SETTINGS_KEY_PROVIDER, "google-drive");
        await settings.set(SETTINGS_KEY_FILESYSTEM_BASE_DIRECTORY, "");
        await settings.set(
            SETTINGS_KEY_GOOGLE_DRIVE_ACCOUNT_LABEL,
            "new-label"
        );

        await restoreProviderConnectionState({
            ctx: { secretStore, settings },
            restoreGoogleDriveAccountLabel: true,
            snapshot,
            tokenStorageKey: SETTINGS_KEY_GOOGLE_DRIVE_TOKENS,
        });

        await expect(settings.get(SETTINGS_KEY_PROVIDER)).resolves.toBe(
            "filesystem"
        );
        await expect(
            settings.get(SETTINGS_KEY_FILESYSTEM_BASE_DIRECTORY)
        ).resolves.toBe("/tmp/original");
        await expect(
            settings.get(SETTINGS_KEY_GOOGLE_DRIVE_ACCOUNT_LABEL)
        ).resolves.toBe("existing-label");
        await expect(
            secretStore.getSecret(SETTINGS_KEY_GOOGLE_DRIVE_TOKENS)
        ).resolves.toBe("existing-google-secret");
    });
});

import { SETTINGS_KEY_SYNC_ENABLED } from "@electron/services/cloud/internal/cloudServiceSettings";
import { assertCloudSyncEnabled } from "@electron/services/cloud/internal/cloudSyncOperationGuard";
import { describe, expect, it } from "vitest";

import { createInMemoryCloudSettingsAdapter } from "./createInMemoryCloudSettingsAdapter";

describe(assertCloudSyncEnabled, () => {
    it("throws the configured message when sync is disabled", async () => {
        const settings = createInMemoryCloudSettingsAdapter({
            [SETTINGS_KEY_SYNC_ENABLED]: "false",
        });

        await expect(
            assertCloudSyncEnabled({
                disabledMessage: "Cloud sync is disabled",
                settings,
            })
        ).rejects.toThrow("Cloud sync is disabled");
    });

    it("resolves when sync is enabled", async () => {
        const settings = createInMemoryCloudSettingsAdapter({
            [SETTINGS_KEY_SYNC_ENABLED]: "true",
        });

        await expect(
            assertCloudSyncEnabled({
                disabledMessage: "Cloud sync is disabled",
                settings,
            })
        ).resolves.toBeUndefined();
    });
});

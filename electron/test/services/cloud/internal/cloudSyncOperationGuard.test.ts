import { describe, expect, it } from "vitest";

import { assertCloudSyncEnabled } from "@electron/services/cloud/internal/cloudSyncOperationGuard";
import { SETTINGS_KEY_SYNC_ENABLED } from "@electron/services/cloud/internal/cloudServiceSettings";

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

describe(assertCloudSyncEnabled, () => {
    it("throws the configured message when sync is disabled", async () => {
        const settings = createSettingsAdapter({
            [SETTINGS_KEY_SYNC_ENABLED]: "false",
        });

        await expect(
            assertCloudSyncEnabled({
                disabledMessage: "Cloud sync is disabled",
                settings,
            })
        ).rejects.toThrowError("Cloud sync is disabled");
    });

    it("resolves when sync is enabled", async () => {
        const settings = createSettingsAdapter({
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

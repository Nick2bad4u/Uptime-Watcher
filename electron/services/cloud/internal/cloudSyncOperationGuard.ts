import type { CloudSettingsAdapter } from "../CloudService.types";

import {
    parseBooleanSetting,
    SETTINGS_KEY_SYNC_ENABLED,
} from "./cloudServiceSettings";

/**
 * Ensures cloud sync is enabled before running a sync-only operation.
 */
export async function assertCloudSyncEnabled(args: {
    readonly disabledMessage: string;
    readonly settings: CloudSettingsAdapter;
}): Promise<void> {
    const syncEnabled = parseBooleanSetting(
        await args.settings.get(SETTINGS_KEY_SYNC_ENABLED)
    );

    if (!syncEnabled) {
        throw new Error(args.disabledMessage);
    }
}

import { afterEach, describe, expect, it, vi } from "vitest";

import type { SettingsStore } from "../../../stores/settings/types";

import { syncSettingsAfterRehydration } from "../../../stores/settings/hydration";
import { defaultSettings } from "../../../stores/settings/state";

function createSettingsState(
    updateSettings: SettingsStore["updateSettings"],
    syncFromBackend: SettingsStore["syncFromBackend"] = vi
        .fn()
        .mockResolvedValue({
            message: "Settings synchronized from backend",
            success: true,
        })
): SettingsStore {
    return {
        disposeSettingsSubscriptions: vi.fn(),
        initializeSettings: vi.fn(),
        persistHistoryLimit: vi.fn(),
        resetSettings: vi.fn(),
        settings: { ...defaultSettings, historyLimit: 123 },
        syncFromBackend,
        updateSettings,
    };
}

describe(syncSettingsAfterRehydration, () => {
    afterEach(() => {
        syncSettingsAfterRehydration(undefined);
        vi.useRealTimers();
        vi.clearAllMocks();
    });

    it("ignores an older sync failure after a newer hydration", async () => {
        vi.useFakeTimers();
        let rejectOlder: (error: Error) => void = () => undefined;
        const olderResult = new Promise<{
            message: string;
            success: boolean;
        }>((_resolve, reject) => {
            rejectOlder = reject;
        });
        const updateOlder = vi.fn<SettingsStore["updateSettings"]>();
        const updateNewer = vi.fn<SettingsStore["updateSettings"]>();
        const syncOlder = vi
            .fn<SettingsStore["syncFromBackend"]>()
            .mockReturnValue(olderResult);
        const syncNewer = vi
            .fn<SettingsStore["syncFromBackend"]>()
            .mockResolvedValue({
                message: "Settings synchronized from backend",
                success: true,
            });

        syncSettingsAfterRehydration(
            createSettingsState(updateOlder, syncOlder)
        );
        await vi.runOnlyPendingTimersAsync();
        expect(syncOlder).toHaveBeenCalledTimes(1);

        syncSettingsAfterRehydration(
            createSettingsState(updateNewer, syncNewer)
        );
        await vi.runOnlyPendingTimersAsync();
        await Promise.resolve();

        expect(syncNewer).toHaveBeenCalledTimes(1);
        expect(updateNewer).not.toHaveBeenCalled();

        rejectOlder(new Error("older sync failed"));
        await Promise.resolve();
        await Promise.resolve();

        expect(updateOlder).not.toHaveBeenCalled();
    });
});

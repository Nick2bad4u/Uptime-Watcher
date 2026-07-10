import { afterEach, describe, expect, it, vi } from "vitest";

import type { SettingsStore } from "../../../stores/settings/types";

import { syncSettingsAfterRehydration } from "../../../stores/settings/hydration";
import { defaultSettings } from "../../../stores/settings/state";

const getHistoryLimit = vi.hoisted(() => vi.fn());

vi.mock("../../../services/SettingsService", () => ({
    SettingsService: { getHistoryLimit },
}));

function createSettingsState(
    updateSettings: SettingsStore["updateSettings"]
): SettingsStore {
    return {
        disposeSettingsSubscriptions: vi.fn(),
        initializeSettings: vi.fn(),
        persistHistoryLimit: vi.fn(),
        resetSettings: vi.fn(),
        settings: { ...defaultSettings, historyLimit: 123 },
        syncFromBackend: vi.fn(),
        updateSettings,
    };
}

describe(syncSettingsAfterRehydration, () => {
    afterEach(() => {
        syncSettingsAfterRehydration(undefined);
        vi.useRealTimers();
        vi.clearAllMocks();
    });

    it("ignores an older backend response that resolves after a newer hydration", async () => {
        vi.useFakeTimers();
        let resolveOlder: (value: number) => void = () => undefined;
        const olderResult = new Promise<number>((resolve) => {
            resolveOlder = resolve;
        });
        getHistoryLimit
            .mockReturnValueOnce(olderResult)
            .mockResolvedValueOnce(2000);
        const updateOlder = vi.fn<SettingsStore["updateSettings"]>();
        const updateNewer = vi.fn<SettingsStore["updateSettings"]>();

        syncSettingsAfterRehydration(createSettingsState(updateOlder));
        await vi.runOnlyPendingTimersAsync();
        expect(getHistoryLimit).toHaveBeenCalledTimes(1);

        syncSettingsAfterRehydration(createSettingsState(updateNewer));
        await vi.runOnlyPendingTimersAsync();
        await Promise.resolve();

        expect(updateNewer).toHaveBeenCalledWith({ historyLimit: 2000 });

        resolveOlder(1000);
        await Promise.resolve();
        await Promise.resolve();

        expect(updateOlder).not.toHaveBeenCalled();
    });
});

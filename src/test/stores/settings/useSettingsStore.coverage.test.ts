import { beforeEach, describe, expect, it, vi } from "vitest";

describe("useSettingsStore (module coverage)", () => {
    beforeEach(() => {
        localStorage.clear();
        vi.resetModules();
    });

    it("should load and expose a zustand store", async () => {
        vi.doMock("../../../services/SettingsService", () => ({
            SettingsService: {
                getHistoryLimit: vi.fn(async () => 50),
                setHistoryLimit: vi.fn(async () => ({
                    data: null,
                    success: true,
                })),
            },
        }));

        const { resetSettingsHydrationTimerForTesting } = await import(
            // Webpack chunk name magic comment (kept separate to satisfy lint).
            /* webpackChunkName: "settings-hydration" */ "../../../stores/settings/hydration"
        );
        resetSettingsHydrationTimerForTesting();

        const { useSettingsStore } = await import(
            // Webpack chunk name magic comment (kept separate to satisfy lint).
            /* webpackChunkName: "use-settings-store" */ "../../../stores/settings/useSettingsStore"
        );

        const state = useSettingsStore.getState();

        expect(state).toHaveProperty("settings");
        expect(typeof state.updateSettings).toBe("function");
        expect(typeof state.resetSettings).toBe("function");

        // Sanity-check a couple of defaults exist.
        expect(typeof state.settings.historyLimit).toBe("number");
        expect(typeof state.settings.theme).toBe("string");
    });
});

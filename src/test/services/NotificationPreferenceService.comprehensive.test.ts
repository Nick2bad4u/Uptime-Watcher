/**
 * Comprehensive coverage for NotificationPreferenceService.
 */

import type { NotificationPreferenceUpdate } from "@shared/types/notifications";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { NotificationPreferenceService } from "../../services/NotificationPreferenceService";

// Hoisted mocks must be declared before the module under test is imported.
const ensureInitializedMock = vi.hoisted(() => vi.fn(async () => {}));

const wrapMock = vi.hoisted(() =>
    vi.fn(
        (
            _methodName: string,
            handler: (
                api: typeof window.electronAPI,
                preferences: NotificationPreferenceUpdate
            ) => Promise<void>
        ) =>
            vi.fn(async (preferences: NotificationPreferenceUpdate) => {
                await ensureInitializedMock();
                return handler(
                    Reflect.get(
                        globalThis,
                        "electronAPI"
                    ) as typeof window.electronAPI,
                    preferences
                );
            })
    )
);

const getHelpersMock = vi.hoisted(() =>
    vi.fn(() => ({
        ensureInitialized: ensureInitializedMock,
        wrap: wrapMock,
    }))
);

vi.mock("../../services/utils/createIpcServiceHelpers", () => ({
    getIpcServiceHelpers: getHelpersMock,
}));

const createElectronApi = () => ({
    notifications: {
        updatePreferences: vi.fn(
            async (_preferences: NotificationPreferenceUpdate) => {}
        ),
    },
});

type MockElectronAPI = ReturnType<typeof createElectronApi>;

interface MockWindow {
    electronAPI?: MockElectronAPI;
}

const getMockGlobal = (): typeof globalThis & {
    electronAPI?: MockElectronAPI;
} => globalThis as typeof globalThis & { electronAPI?: MockElectronAPI };

const getMockWindow = (): MockWindow | undefined => {
    const windowRef = Reflect.get(globalThis, "window");
    return windowRef !== undefined && typeof windowRef === "object"
        ? (windowRef as unknown as MockWindow)
        : undefined;
};

const getRequiredMockElectronAPI = (): MockElectronAPI => {
    const bridge = getMockWindow()?.electronAPI ?? getMockGlobal().electronAPI;
    if (!bridge) {
        throw new Error("Mock Electron API is not installed");
    }
    return bridge;
};

describe("NotificationPreferenceService", () => {
    let originalElectronAPI: MockElectronAPI | undefined;

    beforeEach(() => {
        ensureInitializedMock.mockClear();
        vi.mocked(NotificationPreferenceService.updatePreferences).mockClear();
        vi.mocked(NotificationPreferenceService.initialize).mockClear();

        const electronAPI = createElectronApi();
        const globalWithElectronAPI = getMockGlobal();
        originalElectronAPI = globalWithElectronAPI.electronAPI;

        Object.defineProperty(globalThis, "window", {
            configurable: true,
            value: {
                electronAPI,
            } satisfies MockWindow,
            writable: true,
        });
        Object.defineProperty(globalWithElectronAPI, "electronAPI", {
            configurable: true,
            value: electronAPI,
            writable: true,
        });
    });

    afterEach(() => {
        Reflect.deleteProperty(globalThis, "window");
        Object.defineProperty(getMockGlobal(), "electronAPI", {
            configurable: true,
            value: originalElectronAPI,
            writable: true,
        });
        originalElectronAPI = undefined;
    });

    it("configures IPC helpers with the notifications bridge contract", () => {
        expect(getHelpersMock).toHaveBeenCalledTimes(1);
        expect(getHelpersMock).toHaveBeenCalledWith(
            "NotificationPreferenceService",
            {
                bridgeContracts: [
                    {
                        domain: "notifications",
                        methods: ["updatePreferences"],
                    },
                ],
            }
        );
    });

    it("delegates initialize to the helper", async () => {
        await expect(
            NotificationPreferenceService.initialize()
        ).resolves.toBeUndefined();
        expect(ensureInitializedMock).toHaveBeenCalledTimes(1);
    });

    it("wraps updatePreferences and forwards to the preload bridge", async () => {
        const preferences: NotificationPreferenceUpdate = {
            systemNotificationsEnabled: true,
            systemNotificationsSoundEnabled: false,
        };

        const bridge = getRequiredMockElectronAPI().notifications;

        await expect(
            NotificationPreferenceService.updatePreferences(preferences)
        ).resolves.toBeUndefined();

        expect(ensureInitializedMock).toHaveBeenCalledTimes(1);
        expect(bridge.updatePreferences).toHaveBeenCalledTimes(1);
        expect(bridge.updatePreferences).toHaveBeenCalledWith(preferences);

        expect(wrapMock).toHaveBeenCalledWith(
            "updatePreferences",
            expect.any(Function)
        );
    });

    it("throws a descriptive error when the electronAPI bridge is unavailable", async () => {
        Object.defineProperty(getMockGlobal(), "electronAPI", {
            configurable: true,
            value: undefined,
            writable: true,
        });

        await expect(
            NotificationPreferenceService.updatePreferences({
                systemNotificationsEnabled: false,
                systemNotificationsSoundEnabled: false,
            })
        ).rejects.toThrow();
        expect(ensureInitializedMock).toHaveBeenCalledTimes(1);
    });

    it("throws when the notifications bridge lacks an updatePreferences method", async () => {
        Object.defineProperty(getMockGlobal(), "electronAPI", {
            configurable: true,
            value: {
                notifications: {},
            },
            writable: true,
        });

        await expect(
            NotificationPreferenceService.updatePreferences({
                systemNotificationsEnabled: true,
                systemNotificationsSoundEnabled: true,
            })
        ).rejects.toThrow();
        expect(ensureInitializedMock).toHaveBeenCalledTimes(1);
    });

    it("rejects invalid preference payloads with a descriptive error", async () => {
        const invalidPreferences = {
            systemNotificationsEnabled: "yes",
            systemNotificationsSoundEnabled: false,
        } as unknown as NotificationPreferenceUpdate;

        await expect(
            NotificationPreferenceService.updatePreferences(invalidPreferences)
        ).rejects.toThrow(/Invalid notification preferences:/v);

        expect(ensureInitializedMock).toHaveBeenCalledTimes(1);
    });
});

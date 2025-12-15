/**
 * Comprehensive coverage for NotificationPreferenceService.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { NotificationPreferenceUpdate } from "@shared/types/notifications";

// Hoisted mocks must be declared before the module under test is imported.
const ensureInitializedMock = vi.hoisted(() => vi.fn(async () => {}));

const wrapMock = vi.hoisted(() =>
    vi.fn((
        _methodName: string,
        handler: (
            api: typeof window.electronAPI,
            preferences: NotificationPreferenceUpdate
        ) => Promise<void>
    ) =>
        vi.fn(async (preferences: NotificationPreferenceUpdate) => {
            await ensureInitializedMock();
            return handler(window.electronAPI!, preferences);
        })));

const getHelpersMock = vi.hoisted(() =>
    vi.fn(() => ({
        ensureInitialized: ensureInitializedMock,
        wrap: wrapMock,
    })));

vi.mock("../../services/utils/createIpcServiceHelpers", () => ({
    getIpcServiceHelpers: getHelpersMock,
}));

import { NotificationPreferenceService } from "../../services/NotificationPreferenceService";

const createElectronApi = () => ({
    notifications: {
        updatePreferences: vi.fn(async (
            _preferences: NotificationPreferenceUpdate
        ) => {}),
    },
});

describe("NotificationPreferenceService", () => {
    beforeEach(() => {
        ensureInitializedMock.mockClear();
        vi.mocked(NotificationPreferenceService.updatePreferences).mockClear();
        vi.mocked(NotificationPreferenceService.initialize).mockClear();
        (globalThis as any).window = {
            electronAPI: createElectronApi(),
        };
    });

    afterEach(() => {
        delete (globalThis as any).window;
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

        const bridge = (
            window.electronAPI as unknown as ReturnType<
                typeof createElectronApi
            >
        ).notifications;

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
        (window as any).electronAPI = undefined;

        await expect(
            NotificationPreferenceService.updatePreferences({
                systemNotificationsEnabled: false,
                systemNotificationsSoundEnabled: false,
            })
        ).rejects.toThrowError();
        expect(ensureInitializedMock).toHaveBeenCalledTimes(1);
    });

    it("throws when the notifications bridge lacks an updatePreferences method", async () => {
        (window as any).electronAPI = {
            notifications: {},
        };

        await expect(
            NotificationPreferenceService.updatePreferences({
                systemNotificationsEnabled: true,
                systemNotificationsSoundEnabled: true,
            })
        ).rejects.toThrowError();
        expect(ensureInitializedMock).toHaveBeenCalledTimes(1);
    });

    it("rejects invalid preference payloads with a descriptive error", async () => {
        const invalidPreferences = {
            systemNotificationsEnabled: "yes",
            systemNotificationsSoundEnabled: false,
        } as unknown as NotificationPreferenceUpdate;

        await expect(
            NotificationPreferenceService.updatePreferences(invalidPreferences)
        ).rejects.toThrowError(/Invalid notification preferences:/v);

        expect(ensureInitializedMock).toHaveBeenCalledTimes(1);
    });
});

/**
 * @file Strict coverage tests for the renderer notification preference service
 *   wrapper.
 */

import {
    afterAll,
    beforeAll,
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from "vitest";

import type { NotificationPreferenceUpdate } from "@shared/types/notifications";

type EnsureInitialized = () => Promise<void>;
type WrapHandler = (
    api: unknown,
    payload: NotificationPreferenceUpdate
) => Promise<void>;
type WrappedUpdate = ReturnType<typeof vi.fn>;
type WrapFactory = (methodName: string, handler: WrapHandler) => WrappedUpdate;

const ensureInitializedMock = vi.fn<EnsureInitialized>();
const wrapFactoryMock = vi.fn<WrapFactory>();
const getIpcServiceHelpersMock = vi.fn(() => ({
    ensureInitialized: ensureInitializedMock,
    wrap: wrapFactoryMock,
}));

vi.mock("@app/services/utils/createIpcServiceHelpers", () => ({
    getIpcServiceHelpers: getIpcServiceHelpersMock,
}));

const originalWindow: Window | undefined =
    typeof window === "undefined" ? undefined : window;
const originalElectronApi = originalWindow?.electronAPI;

let capturedWrapper: WrappedUpdate | undefined;
let updateBridgeSpy: WrappedUpdate;

beforeAll(() => {
    if (typeof window === "undefined") {
        vi.stubGlobal("window", {} as Window & typeof globalThis);
    }
});

afterAll(() => {
    if (typeof window !== "undefined") {
        Object.defineProperty(window, "electronAPI", {
            configurable: true,
            value: originalElectronApi,
        });
    }
    vi.unstubAllGlobals();
});

describe("NotificationPreferenceService (strict coverage)", () => {
    beforeEach(() => {
        vi.resetModules();
        capturedWrapper = undefined;
        ensureInitializedMock.mockReset().mockResolvedValue(undefined);
        wrapFactoryMock
            .mockReset()
            .mockImplementation((_: string, handler: WrapHandler) => {
                const wrapper = vi.fn(
                    async (payload: NotificationPreferenceUpdate) =>
                        handler(window.electronAPI as unknown, payload)
                );
                capturedWrapper = wrapper;
                return wrapper;
            });
        getIpcServiceHelpersMock.mockClear();

        updateBridgeSpy = vi.fn(async () => undefined);
        if (typeof window !== "undefined") {
            Object.defineProperty(window, "electronAPI", {
                configurable: true,
                value: {
                    notifications: {
                        updatePreferences: updateBridgeSpy,
                    },
                },
            });
        }
    });

    it("delegates initialization to the preload helper", async () => {
        const { NotificationPreferenceService } =
            await import("@app/services/NotificationPreferenceService");

        await NotificationPreferenceService.initialize();

        expect(ensureInitializedMock).toHaveBeenCalledTimes(1);
        expect(wrapFactoryMock).toHaveBeenCalledWith(
            "updatePreferences",
            expect.any(Function)
        );
        expect(capturedWrapper).toBeDefined();
    });

    it("bridges preference updates to the preload notification API", async () => {
        const preferences: NotificationPreferenceUpdate = {
            systemNotificationsEnabled: true,
            systemNotificationsSoundEnabled: false,
        };

        const { NotificationPreferenceService } =
            await import("@app/services/NotificationPreferenceService");

        await NotificationPreferenceService.updatePreferences(preferences);

        expect(updateBridgeSpy).toHaveBeenCalledTimes(1);
        expect(updateBridgeSpy).toHaveBeenCalledWith(preferences);

        const wrapper = capturedWrapper;
        if (!wrapper) {
            throw new Error(
                "Expected preload wrapper to be captured for verification"
            );
        }
        expect(wrapper).toHaveBeenCalledWith(preferences);
    });

    it("surfaces descriptive errors when the preload bridge is unavailable", async () => {
        const preferences: NotificationPreferenceUpdate = {
            systemNotificationsEnabled: false,
            systemNotificationsSoundEnabled: true,
        };

        const { NotificationPreferenceService } =
            await import("@app/services/NotificationPreferenceService");

        Object.defineProperty(window, "electronAPI", {
            configurable: true,
            value: {},
        });

        await expect(
            NotificationPreferenceService.updatePreferences(preferences)
        ).rejects.toThrowError();
        expect(updateBridgeSpy).not.toHaveBeenCalled();
    });
});

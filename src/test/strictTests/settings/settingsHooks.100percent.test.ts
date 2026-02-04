import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { AppSettings } from "../../../stores/types";

import { useInAppAlertTonePreview } from "../../../components/Settings/useInAppAlertTonePreview";
import { useSettingsChangeHandlers } from "../../../components/Settings/useSettingsChangeHandlers";

const mockedLogger = vi.hoisted(() => ({
    user: {
        settingsChange: vi.fn(),
    },
    warn: vi.fn(),
}));

vi.mock("../../../services/logger", () => ({
    logger: mockedLogger,
}));

const createBaseSettings = (): AppSettings => ({
    autoStart: false,
    historyLimit: 1000,
    inAppAlertVolume: 0.5,
    inAppAlertsEnabled: true,
    inAppAlertsSoundEnabled: true,
    minimizeToTray: false,
    mutedSiteNotificationIdentifiers: [],
    systemNotificationsEnabled: false,
    systemNotificationsSoundEnabled: true,
    theme: "dark",
});

describe(useInAppAlertTonePreview, () => {
    it("schedules a preview when enabled and volume changes significantly", () => {
        vi.useFakeTimers();

        const playInAppAlertTone = vi.fn();

        const { result } = renderHook(() =>
            useInAppAlertTonePreview({
                inAppAlertVolume: 0.5,
                inAppAlertsSoundEnabled: true,
                playInAppAlertTone,
                prefersReducedMotion: false,
            })
        );

        act(() => {
            result.current.scheduleVolumePreview(0.55);
        });

        expect(playInAppAlertTone).not.toHaveBeenCalled();

        act(() => {
            vi.advanceTimersByTime(179);
        });
        expect(playInAppAlertTone).not.toHaveBeenCalled();

        act(() => {
            vi.advanceTimersByTime(1);
        });
        expect(playInAppAlertTone).toHaveBeenCalledTimes(1);

        vi.useRealTimers();
    });

    it("does nothing when reduced motion is enabled", () => {
        vi.useFakeTimers();

        const playInAppAlertTone = vi.fn();

        const { result } = renderHook(() =>
            useInAppAlertTonePreview({
                inAppAlertVolume: 0.5,
                inAppAlertsSoundEnabled: true,
                playInAppAlertTone,
                prefersReducedMotion: true,
            })
        );

        act(() => {
            result.current.scheduleVolumePreview(0.9);
        });

        act(() => {
            vi.runAllTimers();
        });

        expect(playInAppAlertTone).not.toHaveBeenCalled();

        vi.useRealTimers();
    });

    it("does nothing when in-app alert sounds are disabled", () => {
        vi.useFakeTimers();

        const playInAppAlertTone = vi.fn();

        const { result } = renderHook(() =>
            useInAppAlertTonePreview({
                inAppAlertVolume: 0.5,
                inAppAlertsSoundEnabled: false,
                playInAppAlertTone,
                prefersReducedMotion: false,
            })
        );

        act(() => {
            result.current.scheduleVolumePreview(0.9);
        });

        act(() => {
            vi.runAllTimers();
        });

        expect(playInAppAlertTone).not.toHaveBeenCalled();

        vi.useRealTimers();
    });

    it("ignores tiny volume changes and honors setPendingVolume", () => {
        vi.useFakeTimers();

        const playInAppAlertTone = vi.fn();

        const { result } = renderHook(() =>
            useInAppAlertTonePreview({
                inAppAlertVolume: 0.5,
                inAppAlertsSoundEnabled: true,
                playInAppAlertTone,
                prefersReducedMotion: false,
            })
        );

        act(() => {
            result.current.setPendingVolume(0.7);
            result.current.scheduleVolumePreview(0.701);
        });

        act(() => {
            vi.runAllTimers();
        });

        expect(playInAppAlertTone).not.toHaveBeenCalled();

        vi.useRealTimers();
    });

    it("clears a pending preview timeout", () => {
        vi.useFakeTimers();

        const playInAppAlertTone = vi.fn();

        const { result } = renderHook(() =>
            useInAppAlertTonePreview({
                inAppAlertVolume: 0.5,
                inAppAlertsSoundEnabled: true,
                playInAppAlertTone,
                prefersReducedMotion: false,
            })
        );

        act(() => {
            result.current.scheduleVolumePreview(0.9);
        });

        act(() => {
            result.current.clearVolumePreviewTimeout();
            vi.runAllTimers();
        });

        expect(playInAppAlertTone).not.toHaveBeenCalled();

        vi.useRealTimers();
    });

    it("plays a preview immediately via playPreviewAtVolume", () => {
        const playInAppAlertTone = vi.fn();

        const { result } = renderHook(() =>
            useInAppAlertTonePreview({
                inAppAlertVolume: 0.5,
                inAppAlertsSoundEnabled: true,
                playInAppAlertTone,
                prefersReducedMotion: false,
            })
        );

        act(() => {
            result.current.playPreviewAtVolume(0.8);
        });

        expect(playInAppAlertTone).toHaveBeenCalledTimes(1);
    });

    it("does not schedule previews for non-positive volume", () => {
        vi.useFakeTimers();

        const playInAppAlertTone = vi.fn();

        const { result } = renderHook(() =>
            useInAppAlertTonePreview({
                inAppAlertVolume: 0.5,
                inAppAlertsSoundEnabled: true,
                playInAppAlertTone,
                prefersReducedMotion: false,
            })
        );

        act(() => {
            result.current.scheduleVolumePreview(-1);
            vi.runAllTimers();
        });

        expect(playInAppAlertTone).not.toHaveBeenCalled();

        vi.useRealTimers();
    });
});

describe(useSettingsChangeHandlers, () => {
    it("applies setting changes, honors forceKeys, and warns on invalid keys", async () => {
        const settings = createBaseSettings();

        const updateSettings = vi
            .fn<(changes: Partial<AppSettings>) => Promise<void>>()
            .mockResolvedValue(undefined);

        const { result } = renderHook(() =>
            useSettingsChangeHandlers({
                settings,
                updateSettings,
            })
        );

        const changes = {
            historyLimit: 2500,
            theme: "light",
            notARealSetting: true,
        } as unknown as Partial<AppSettings>;

        await act(async () => {
            await result.current.applySettingChanges(changes, {
                forceKeys: ["theme"] as const,
            });
        });

        expect(updateSettings).toHaveBeenCalledTimes(1);
        expect(updateSettings).toHaveBeenCalledWith(
            expect.objectContaining({ historyLimit: 2500, theme: "light" })
        );
        expect(mockedLogger.warn).toHaveBeenCalledTimes(1);
        expect(mockedLogger.user.settingsChange).toHaveBeenCalled();
    });

    it("does not call updateSettings when there are no effective changes", async () => {
        const settings = createBaseSettings();

        const updateSettings = vi
            .fn<(changes: Partial<AppSettings>) => Promise<void>>()
            .mockResolvedValue(undefined);

        const { result } = renderHook(() =>
            useSettingsChangeHandlers({
                settings,
                updateSettings,
            })
        );

        await act(async () => {
            await result.current.applySettingChanges({ theme: "dark" });
        });

        expect(updateSettings).not.toHaveBeenCalled();
    });
});

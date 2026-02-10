/**
 * In-app alert tone preview helpers for {@link src/components/Settings/Settings#Settings}.
 *
 * @remarks
 * Extracted from `Settings.tsx` to keep the component lean. This hook owns the
 * preview timers and pending-volume state.
 */

import { useCallback, useEffect, useRef } from "react";

import { clampNormalizedVolume } from "./utils/volumeNormalization";

/**
 * Provides helpers for scheduling and playing the in-app alert sound preview.
 */
export function useInAppAlertTonePreview(args: {
    readonly inAppAlertsSoundEnabled: boolean;
    readonly inAppAlertVolume: number;
    readonly playInAppAlertTone: () => Promise<void>;
    readonly prefersReducedMotion: boolean;
}): {
    readonly clearVolumePreviewTimeout: () => void;
    readonly playPreviewAtVolume: (normalizedVolume: number) => void;
    readonly scheduleVolumePreview: (normalizedVolume: number) => void;
    readonly setPendingVolume: (normalizedVolume: number) => void;
} {
    const {
        inAppAlertsSoundEnabled,
        inAppAlertVolume,
        playInAppAlertTone,
        prefersReducedMotion,
    } = args;

    const pendingVolumeRef = useRef(clampNormalizedVolume(inAppAlertVolume));
    const volumePreviewTimeoutRef = useRef<null | number>(null);

    const clearVolumePreviewTimeout = useCallback(() => {
        if (volumePreviewTimeoutRef.current === null) {
            return;
        }

        window.clearTimeout(volumePreviewTimeoutRef.current);
        volumePreviewTimeoutRef.current = null;
    }, []);

    const setPendingVolume = useCallback((normalizedVolume: number) => {
        pendingVolumeRef.current = clampNormalizedVolume(normalizedVolume);
    }, []);

    const playPreviewAtVolume = useCallback(
        (normalizedVolume: number) => {
            setPendingVolume(normalizedVolume);
            void playInAppAlertTone();
        },
        [playInAppAlertTone, setPendingVolume]
    );

    const scheduleVolumePreview = useCallback(
        (normalizedVolume: number) => {
            if (!inAppAlertsSoundEnabled) {
                return;
            }

            const nextVolume = clampNormalizedVolume(normalizedVolume);

            if (prefersReducedMotion) {
                setPendingVolume(nextVolume);
                clearVolumePreviewTimeout();
                return;
            }

            const previousVolume = pendingVolumeRef.current;
            const delta = Math.abs(nextVolume - previousVolume);

            if (delta < 0.005) {
                return;
            }

            setPendingVolume(nextVolume);
            clearVolumePreviewTimeout();

            if (nextVolume <= 0) {
                return;
            }

            volumePreviewTimeoutRef.current = window.setTimeout(() => {
                volumePreviewTimeoutRef.current = null;
                void playInAppAlertTone();
            }, 180);
        },
        [
            clearVolumePreviewTimeout,
            inAppAlertsSoundEnabled,
            playInAppAlertTone,
            prefersReducedMotion,
            setPendingVolume,
        ]
    );

    // Keep pending volume in sync with persisted volume.
    useEffect(
        function syncPendingVolumeWithState(): void {
            setPendingVolume(inAppAlertVolume);
        },
        [inAppAlertVolume, setPendingVolume]
    );

    // Stop preview when sound is disabled.
    useEffect(
        function stopPreviewWhenSoundDisabled(): void {
            if (!inAppAlertsSoundEnabled) {
                clearVolumePreviewTimeout();
                setPendingVolume(inAppAlertVolume);
            }
        },
        [
            clearVolumePreviewTimeout,
            inAppAlertsSoundEnabled,
            inAppAlertVolume,
            setPendingVolume,
        ]
    );

    // Cleanup on unmount.
    useEffect(
        function cleanupVolumePreviewOnUnmount(): () => void {
            return () => {
                clearVolumePreviewTimeout();
            };
        },
        [clearVolumePreviewTimeout]
    );

    return {
        clearVolumePreviewTimeout,
        playPreviewAtVolume,
        scheduleVolumePreview,
        setPendingVolume,
    };
}

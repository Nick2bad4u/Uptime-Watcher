/**
 * Shared type definition for the preload events bridge.
 *
 * @remarks
 * Ensures the Electron preload layer and renderer agree on the shape of the
 * event subscription API exposed through `window.electronAPI.events`.
 */

import type {
    CacheInvalidatedEventData,
    MonitorDownEventData,
    MonitoringControlEventData,
    MonitorStatusChangedEventData,
    MonitorUpEventData,
    TestEventData,
    UpdateStatusEventData,
} from "@shared/types/events";

/**
 * Contract for the preload events bridge exposed to the renderer.
 *
 * @public
 */
export interface EventsDomainBridge {
    readonly onCacheInvalidated: (
        callback: (data: CacheInvalidatedEventData) => void
    ) => () => void;
    readonly onMonitorDown: (
        callback: (data: MonitorDownEventData) => void
    ) => () => void;
    readonly onMonitoringStarted: (
        callback: (data: MonitoringControlEventData) => void
    ) => () => void;
    readonly onMonitoringStopped: (
        callback: (data: MonitoringControlEventData) => void
    ) => () => void;
    readonly onMonitorStatusChanged: (
        callback: (data: MonitorStatusChangedEventData) => void
    ) => () => void;
    readonly onMonitorUp: (
        callback: (data: MonitorUpEventData) => void
    ) => () => void;
    readonly onTestEvent: (
        callback: (data: TestEventData) => void
    ) => () => void;
    readonly onUpdateStatus: (
        callback: (data: UpdateStatusEventData) => void
    ) => () => void;
    readonly removeAllListeners: () => void;
}

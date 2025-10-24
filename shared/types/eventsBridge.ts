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

import { RENDERER_EVENT_CHANNELS } from "@shared/ipc/rendererEvents";
import type { RendererEventPayload } from "@shared/ipc/rendererEvents";

type SiteAddedRendererEventData = RendererEventPayload<
    typeof RENDERER_EVENT_CHANNELS.SITE_ADDED
>;
type SiteRemovedRendererEventData = RendererEventPayload<
    typeof RENDERER_EVENT_CHANNELS.SITE_REMOVED
>;
type SiteUpdatedRendererEventData = RendererEventPayload<
    typeof RENDERER_EVENT_CHANNELS.SITE_UPDATED
>;

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
    readonly onSiteAdded: (
        callback: (data: SiteAddedRendererEventData) => void
    ) => () => void;
    readonly onSiteRemoved: (
        callback: (data: SiteRemovedRendererEventData) => void
    ) => () => void;
    readonly onSiteUpdated: (
        callback: (data: SiteUpdatedRendererEventData) => void
    ) => () => void;
    readonly onTestEvent: (
        callback: (data: TestEventData) => void
    ) => () => void;
    readonly onUpdateStatus: (
        callback: (data: UpdateStatusEventData) => void
    ) => () => void;
    readonly removeAllListeners: () => void;
}

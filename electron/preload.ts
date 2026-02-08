/**
 * Modular Preload Entry Point - Type-safe domain-based Electron APIs
 *
 * @remarks
 * This is the main preload script that exposes all domain-specific APIs to the
 * renderer process. It replaces the monolithic preload approach with a clean,
 * modular architecture where each domain (sites, monitoring, data, etc.) has
 * its own dedicated API surface.
 *
 * @packageDocumentation
 */

import type { ElectronBridgeApi } from "@shared/types/preload";

import { contextBridge } from "electron";

import type { EventsApi } from "./preload/domains/eventsApi";
import type { SystemApi } from "./preload/domains/systemApi";

import { cloudApi } from "./preload/domains/cloudApi";
import { dataApi } from "./preload/domains/dataApi";
import { createEventsApi } from "./preload/domains/eventsApi";
import { monitoringApi } from "./preload/domains/monitoringApi";
import { monitorTypesApi } from "./preload/domains/monitorTypesApi";
import { notificationsApi } from "./preload/domains/notificationsApi";
import { settingsApi } from "./preload/domains/settingsApi";
import { sitesApi } from "./preload/domains/sitesApi";
import { stateSyncApi } from "./preload/domains/stateSyncApi";
import { systemApi } from "./preload/domains/systemApi";
import {
    deepFreezeInPlace,
    detectPlaywrightAutomation,
} from "./preload/utils/preloadSecurity";

const automationFlag = detectPlaywrightAutomation(
    Reflect.get(globalThis, "process")
);

if (automationFlag) {
    Reflect.set(globalThis, "playwrightAutomation", true);

    contextBridge.exposeInMainWorld("playwrightAutomation", true);
}

/**
 * Complete electron API interface with all domain APIs
 */
type ElectronAPI = ElectronBridgeApi<EventsApi, SystemApi>;

/**
 * The complete domain-based electron API exposed to the renderer process
 */
const electronAPI: ElectronAPI = {
    cloud: cloudApi,
    data: dataApi,
    events: createEventsApi(),
    monitoring: monitoringApi,
    monitorTypes: monitorTypesApi,
    notifications: notificationsApi,
    settings: settingsApi,
    sites: sitesApi,
    stateSync: stateSyncApi,
    system: systemApi,
};

// Expose the modular API to the renderer process
deepFreezeInPlace(electronAPI);
contextBridge.exposeInMainWorld("electronAPI", electronAPI);

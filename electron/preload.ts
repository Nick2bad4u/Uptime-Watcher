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

import { contextBridge } from "electron";

import { dataApi } from "./preload/domains/dataApi";
import { createEventsApi } from "./preload/domains/eventsApi";
import { monitoringApi } from "./preload/domains/monitoringApi";
import { monitorTypesApi } from "./preload/domains/monitorTypesApi";
import { sitesApi } from "./preload/domains/sitesApi";
import { stateSyncApi } from "./preload/domains/stateSyncApi";
import { systemApi } from "./preload/domains/systemApi";

/**
 * Complete electron API interface with all domain APIs
 */
interface ElectronAPI {
    /** Data management operations (import/export, settings, backup) */
    data: typeof dataApi;
    /** Event listener registration for various system events */
    events: ReturnType<typeof createEventsApi>;
    /** Monitoring control operations (start/stop, validation, formatting) */
    monitoring: typeof monitoringApi;
    /** Monitor type registry operations */
    monitorTypes: typeof monitorTypesApi;
    /** Site management operations (CRUD, monitoring control) */
    sites: typeof sitesApi;
    /** State synchronization operations */
    stateSync: typeof stateSyncApi;
    /** System-level operations (external links, etc.) */
    system: typeof systemApi;
}

/**
 * The complete domain-based electron API exposed to the renderer process
 */
const electronAPI: ElectronAPI = {
    data: dataApi,
    events: createEventsApi(),
    monitoring: monitoringApi,
    monitorTypes: monitorTypesApi,
    sites: sitesApi,
    stateSync: stateSyncApi,
    system: systemApi,
};

// Expose the modular API to the renderer process
contextBridge.exposeInMainWorld("electronAPI", electronAPI);

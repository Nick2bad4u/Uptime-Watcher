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

interface AutomationProcess {
    readonly env?: Record<string, string | undefined>;
}

const isObjectLike = (value: unknown): value is object =>
    (typeof value === "object" && value !== null) ||
    typeof value === "function";

function isPlaywrightAutomationFlagSet(
    processContext?: AutomationProcess
): boolean {
    if (!processContext?.env) {
        return false;
    }

    const automationFlagValue = processContext.env["PLAYWRIGHT_TEST"];
    return (
        typeof automationFlagValue === "string" &&
        automationFlagValue.toLowerCase() === "true"
    );
}

/**
 * Deep-freeze an API object graph before exposing it to the renderer.
 *
 * @remarks
 * `contextBridge.exposeInMainWorld` already prevents direct prototype access
 * from the renderer, but freezing the object graph provides an additional
 * guardrail against accidental mutation (and makes tampering easier to detect
 * in tests).
 */
function deepFreezeInPlace(root: unknown): void {
    if (!isObjectLike(root)) {
        return;
    }

    const seen = new WeakSet<object>();
    const stack: object[] = [root];

    while (stack.length > 0) {
        const current = stack.pop();

        if (current && !seen.has(current)) {
            seen.add(current);

            for (const key of Reflect.ownKeys(current)) {
                const descriptor = Object.getOwnPropertyDescriptor(
                    current,
                    key
                );
                const value: unknown = descriptor?.value;

                if (isObjectLike(value)) {
                    stack.push(value);
                }
            }

            Object.freeze(current);
        }
    }
}

function toAutomationProcess(value: unknown): AutomationProcess | undefined {
    if (!isObjectLike(value)) {
        return undefined;
    }

    const envCandidate: unknown = Reflect.get(value, "env");
    if (!isObjectLike(envCandidate)) {
        return {};
    }

    const env: Record<string, string | undefined> = {};
    for (const key of Object.keys(envCandidate)) {
        const entry: unknown = Reflect.get(envCandidate, key);
        if (typeof entry === "string") {
            env[key] = entry;
        } else if (entry === undefined) {
            env[key] = undefined;
        }
    }

    return { env };
}

const automationFlag = isPlaywrightAutomationFlagSet(
    toAutomationProcess(Reflect.get(globalThis, "process"))
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

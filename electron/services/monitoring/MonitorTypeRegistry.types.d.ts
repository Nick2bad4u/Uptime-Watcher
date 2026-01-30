/**
 * Shared type contracts for the monitor type registry.
 *
 * @remarks
 * This file exists to break static import cycles detected by tooling (Madge).
 * The registry implementation (`MonitorTypeRegistry.ts`) needs to import the
 * registration modules, and those modules need some of the registry's types.
 *
 * By extracting the types into a separate module, registration modules can
 * depend on these types without depending on the registry implementation.
 *
 * This module contains **types only** (no runtime code).
 *
 * @public
 */

import type { MonitorFieldDefinition } from "@shared/types";
import type { MonitorTypeConfig } from "@shared/types/monitorTypes";
import type * as z from "zod";

import type { MonitorUIConfig } from "./monitorUiConfig";
import type { IMonitorService } from "./types";
import type { HttpMonitorUiOverrides } from "./utils/httpMonitorUiConfig";

/**
 * Configuration contract required to register a monitor type in the system.
 *
 * @remarks
 * Mirrors {@link MonitorTypeConfig} but narrows the UI configuration to the
 * richer {@link MonitorUIConfig} type used by the Electron renderer.
 */
export interface BaseMonitorConfig extends Omit<MonitorTypeConfig, "uiConfig"> {
    /** Field definitions for dynamic form generation */
    readonly fields: MonitorFieldDefinition[];
    /** Factory function to create monitor service instances */
    readonly serviceFactory: () => IMonitorService;
    /** UI display configuration */
    readonly uiConfig?: MonitorUIConfig;
    /** Zod validation schema for this monitor type */
    readonly validationSchema: z.ZodType;
}

/**
 * Registration contract for HTTP-based monitor definitions.
 */
export interface HttpMonitorRegistration extends Omit<
    BaseMonitorConfig,
    "uiConfig"
> {
    /**
     * Optional UI overrides used to derive the final {@link MonitorUIConfig} for
     * HTTP-like monitors.
     */
    readonly uiOverrides?: HttpMonitorUiOverrides;
}

/**
 * Root barrel export for Uptime Watcher application.
 * Provides centralized access to all major application modules.
 *
 * Import patterns:
 * - Types: import { Site, Monitor } from "@/types"
 * - Components: import { SiteDetails, Dashboard } from "@/components"
 * - Stores: import { useSitesStore, useErrorStore } from "@/stores"
 * - Hooks: import { useSiteDetails, useThemeStyles } from "@/hooks"
 * - Utils: import { formatTime, getStatusIcon } from "@/utils"
 * - Theme: import { useTheme, ThemedButton } from "@/theme"
 * - Services: import { logger, ChartConfigService } from "@/services"
 */

// Application types (export these explicitly to avoid conflicts)
export type { UpdateStatus, MonitorType, Monitor, Site, StatusHistory, StatusUpdate } from "./types";

// Core constants
export * from "./constants";

// Components
export * from "./components";

// Custom hooks
export * from "./hooks";

// State management stores (stores re-export types, so we avoid conflict by being explicit above)
export * from "./stores";

// Utility functions
export * from "./utils";

// Theme system
export * from "./theme";

// Services
export * from "./services";

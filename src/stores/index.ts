/**
 * Centralized exports for all store modules.
 * Provides a single entry point for importing stores across the application.
 */

// Error handling
export { ErrorBoundary } from "./error/ErrorBoundary";
export { useErrorStore } from "./error/useErrorStore";
export type { ErrorStore } from "./error/types";

// Sites management
export { useSitesStore } from "./sites/useSitesStore";
export type { SitesStore } from "./sites/types";

// Application settings
export { useSettingsStore } from "./settings/useSettingsStore";
export type { SettingsStore } from "./settings/types";

// UI state management
export { useUIStore } from "./ui/useUiStore";
export type { UIStore } from "./ui/types";

// Application updates
export { useUpdatesStore } from "./updates/useUpdatesStore";
export type { UpdatesStore } from "./updates/types";

// Statistics
export { useStatsStore } from "./stats/useStatsStore";
export type { StatsStore } from "./stats/types";

// Shared types and utilities
export type { AppSettings, ChartTimeRange, UpdateStatus } from "./types";
export { ERROR_MESSAGES } from "./types";
export { logStoreAction, withErrorHandling } from "./utils";

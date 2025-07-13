/**
 * Centralized exports for all store modules in the application.
 *
 * @remarks
 * Barrel file providing organized entry point for stores, types, and utilities.
 * Exports are grouped by functional domain for easy navigation.
 *
 * @packageDocumentation
 * @public
 */

// =============================================================================
// Error Handling
// =============================================================================
// Error boundary component and store for centralized error management

export { ErrorBoundary } from "./error/ErrorBoundary";
export { useErrorStore } from "./error/useErrorStore";
export type { ErrorStore } from "./error/types";

// =============================================================================
// Sites Management
// =============================================================================
// Core site management store and related functionality

export { useSitesStore } from "./sites/useSitesStore";
export type { SitesStore } from "./sites/types";

// Site monitoring actions and types
export type { SiteMonitoringActions, SiteMonitoringDependencies } from "./sites/useSiteMonitoring";
export { createSiteMonitoringActions } from "./sites/useSiteMonitoring";

// Site operations actions and types
export type { SiteOperationsActions, SiteOperationsDependencies } from "./sites/useSiteOperations";
export { createSiteOperationsActions } from "./sites/useSiteOperations";

// Sites state management
export type { SitesState, SitesStateActions, SitesStateStore } from "./sites/useSitesState";
export { createSitesStateActions, initialSitesState } from "./sites/useSitesState";

// Site sync actions and types
export type { SiteSyncActions, SiteSyncDependencies } from "./sites/useSiteSync";
export { createSiteSyncActions } from "./sites/useSiteSync";

// Site services and utilities
export * from "./sites/services";
export * from "./sites/utils";

// =============================================================================
// Application Settings & Configuration
// =============================================================================
// User preferences and application settings management

export { useSettingsStore } from "./settings/useSettingsStore";
export type { SettingsStore } from "./settings/types";

// =============================================================================
// User Interface State
// =============================================================================
// UI state, navigation, and interaction management

export { useUIStore } from "./ui/useUiStore";
export type { UIStore } from "./ui/types";

// =============================================================================
// Application Updates
// =============================================================================
// Update checking, downloading, and installation management

export { useUpdatesStore } from "./updates/useUpdatesStore";
export type { UpdatesStore } from "./updates/types";

// =============================================================================
// Statistics & Analytics
// =============================================================================
// Site performance statistics and analytics data

export { useStatsStore } from "./stats/useStatsStore";
export type { StatsStore } from "./stats/types";

// =============================================================================
// Shared Types & Utilities
// =============================================================================
// Common types, constants, and utility functions used across stores

export type { AppSettings, ChartTimeRange, UpdateStatus } from "./types";
export { ERROR_MESSAGES } from "./types";
export * from "./utils";

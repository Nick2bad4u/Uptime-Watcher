/**
 * @packageDocumentation
 * Electron main barrel export.
 *
 * Provides centralized access to all Electron modules.
 *
 * @remarks
 * This barrel file re-exports the following main modules for convenient and consistent imports throughout the application:
 * - Core modules: constants, electronUtils, types, UptimeOrchestrator
 * - Event system: events
 * - Managers: managers
 * - Services: services
 * - Utilities: utils
 *
 * For the full list of exports, see the respective files in the electron directory.
 */

// Core modules
export * from "./constants";
export * from "./electronUtils";
export * from "./UptimeOrchestrator";
export * from "./types";

// Event system
export * from "./events";

// Managers
export * from "./managers";

// Services
export * from "./services";

// Utilities
export * from "./utils";

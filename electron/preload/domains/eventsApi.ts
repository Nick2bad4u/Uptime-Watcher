/**
 * Events domain API for preload bridge
 *
 * @remarks
 * This module provides event listener functions for the events domain. It
 * includes listeners for cache invalidation, monitor status, test events, and
 * update status events.
 *
 * Exception handling: This domain API intentionally does not handle exceptions.
 * Errors are propagated to the frontend where they can be handled appropriately
 * by UI components, error boundaries, or service layers.
 *
 * @author Nick
 *
 * @packageDocumentation
 */

/* eslint-disable @typescript-eslint/no-unsafe-type-assertion -- Event data type casting is safe in this context */

import type { StatusUpdate } from "@shared/types";
import type {
    CacheInvalidatedEventData,
    MonitorDownEventData,
    MonitoringControlEventData,
    MonitorUpEventData,
    TestEventData,
    UpdateStatusEventData,
} from "@shared/types/events";

import { createEventManager } from "../core/bridgeFactory";

/**
 * Creates the events domain API with event listeners
 *
 * @returns Events API object with event listener functions
 */
export function createEventsApi(): {
    onCacheInvalidated: (
        callback: (data: CacheInvalidatedEventData) => void
    ) => () => void;
    onMonitorDown: (
        callback: (data: MonitorDownEventData) => void
    ) => () => void;
    onMonitoringStarted: (
        callback: (data: MonitoringControlEventData) => void
    ) => () => void;
    onMonitoringStopped: (
        callback: (data: MonitoringControlEventData) => void
    ) => () => void;
    onMonitorStatusChanged: (
        callback: (data: StatusUpdate) => void
    ) => () => void;
    onMonitorUp: (callback: (data: MonitorUpEventData) => void) => () => void;
    onTestEvent: (callback: (data: TestEventData) => void) => () => void;
    onUpdateStatus: (
        callback: (data: UpdateStatusEventData) => void
    ) => () => void;
} {
    return {
        /**
         * Register a listener for cache invalidation events
         *
         * @param callback - Function to call when cache is invalidated
         *
         * @returns Cleanup function to remove the listener
         */
        onCacheInvalidated: (
            callback: (data: CacheInvalidatedEventData) => void
        ): (() => void) =>
            createEventManager("cache:invalidated").on((data: unknown) => {
                callback(data as CacheInvalidatedEventData);
            }),

        /**
         * Register a listener for monitor down events
         *
         * @param callback - Function to call when a monitor goes down
         *
         * @returns Cleanup function to remove the listener
         */
        onMonitorDown: (
            callback: (data: MonitorDownEventData) => void
        ): (() => void) =>
            createEventManager("monitor:down").on((data: unknown) => {
                callback(data as MonitorDownEventData);
            }),

        /**
         * Register a listener for monitoring started events
         *
         * @param callback - Function to call when monitoring starts for a
         *   site/monitor
         *
         * @returns Cleanup function to remove the listener
         */
        onMonitoringStarted: (
            callback: (data: MonitoringControlEventData) => void
        ): (() => void) =>
            createEventManager("monitoring:started").on((data: unknown) => {
                callback(data as MonitoringControlEventData);
            }),

        /**
         * Register a listener for monitoring stopped events
         *
         * @param callback - Function to call when monitoring stops for a
         *   site/monitor
         *
         * @returns Cleanup function to remove the listener
         */
        onMonitoringStopped: (
            callback: (data: MonitoringControlEventData) => void
        ): (() => void) =>
            createEventManager("monitoring:stopped").on((data: unknown) => {
                callback(data as MonitoringControlEventData);
            }),

        /**
         * Register a listener for monitor status changed events
         *
         * @param callback - Function to call when a monitor status changes
         *
         * @returns Cleanup function to remove the listener
         */
        onMonitorStatusChanged: (
            callback: (data: StatusUpdate) => void
        ): (() => void) =>
            createEventManager("monitor:status-changed").on((data: unknown) => {
                callback(data as StatusUpdate);
            }),

        /**
         * Register a listener for monitor up events
         *
         * @param callback - Function to call when a monitor comes back up
         *
         * @returns Cleanup function to remove the listener
         */
        onMonitorUp: (
            callback: (data: MonitorUpEventData) => void
        ): (() => void) =>
            createEventManager("monitor:up").on((data: unknown) => {
                callback(data as MonitorUpEventData);
            }),

        /**
         * Register a listener for test events
         *
         * @param callback - Function to call when test events occur
         *
         * @returns Cleanup function to remove the listener
         */
        onTestEvent: (callback: (data: TestEventData) => void): (() => void) =>
            createEventManager("test-event").on((data: unknown) => {
                callback(data as TestEventData);
            }),

        /**
         * Register a listener for update status events
         *
         * @param callback - Function to call when update status changes
         *
         * @returns Cleanup function to remove the listener
         */
        onUpdateStatus: (
            callback: (data: UpdateStatusEventData) => void
        ): (() => void) =>
            createEventManager("update-status").on((data: unknown) => {
                callback(data as UpdateStatusEventData);
            }),
    };
}

/* eslint-enable @typescript-eslint/no-unsafe-type-assertion -- Re-enable type assertion warnings */

import {
    RENDERER_EVENT_CHANNELS,
    type RendererEventChannel,
    type RendererEventPayload,
} from "@shared/ipc/rendererEvents";
/**
 * Main application service that orchestrates all other services and coordinates
 * application lifecycle across the Electron backend.
 *
 * @remarks
 * Uses dependency injection through {@link ServiceContainer} to manage all
 * services and their dependencies. Provides proper initialization order, event
 * handler setup, and cleanup. Handles Electron app events and orchestrates
 * service startup and shutdown.
 *
 * Key responsibilities:
 *
 * - Application lifecycle management (startup, shutdown, error handling)
 * - Service container initialization and dependency injection
 * - Event handler registration for Electron app events
 * - Graceful shutdown coordination for all services
 * - Error handling and recovery for application-level failures
 * - Development vs production environment handling
 * - Service health monitoring and status reporting
 *
 * @example Basic application service usage:
 *
 * ```typescript
 * const appService = new ApplicationService();
 *
 * // Initialize all services
 * await appService.initializeServices();
 *
 * // Start the application
 * await appService.startApplication();
 *
 * // Shutdown gracefully
 * await appService.shutdown();
 * ```
 *
 * @example Service dependency access:
 *
 * ```typescript
 * // Access services through the container
 * const databaseManager = appService.getDatabaseManager();
 * const monitorManager = appService.getMonitorManager();
 * ```
 *
 * @packageDocumentation
 *
 * @public
 */
import { isDevelopment } from "@shared/utils/environment";
import { ensureError } from "@shared/utils/errorHandling";
import {
    interpolateLogTemplate,
    LOG_TEMPLATES,
} from "@shared/utils/logTemplates";
import { app } from "electron";

import type { UptimeEvents } from "../../events/eventTypes";
import type {
    EnhancedEventPayload,
    EventKey,
} from "../../events/TypedEventBus";
import type { RendererEventBridge } from "../events/RendererEventBridge";

import { ScopedSubscriptionManager } from "../../events/ScopedSubscriptionManager";
import { stripForwardedEventMetadata } from "../../utils/eventMetadataForwarding";
import { logger } from "../../utils/logger";
import { ServiceContainer } from "../ServiceContainer";

/**
 * Type guard that verifies whether a service-like object exposes a callable
 * {@link close} method suitable for lifecycle cleanup.
 *
 * @param candidate - Arbitrary value to inspect.
 *
 * @returns `true` when the value is an object containing a function-valued
 *   `close` property.
 */
const hasCloseFunction = (
    candidate: unknown
): candidate is { close: () => void } =>
    typeof candidate === "object" &&
    candidate !== null &&
    "close" in candidate &&
    typeof (candidate as { close?: unknown }).close === "function";

/**
 * High-level coordinator responsible for wiring Electron application lifecycle
 * events to the underlying service container and orchestrator.
 *
 * @public
 */
export class ApplicationService {
    /**
     * The container for all application services.
     *
     * @readonly
     *
     * @internal
     */
    private readonly serviceContainer: ServiceContainer;

    /** Tracks orchestrator subscriptions for deterministic cleanup. */
    private readonly scopedSubscriptions = new ScopedSubscriptionManager();

    /**
     * Named event handler for app ready event.
     */
    private readonly handleAppReady = (): void => {
        void (async (): Promise<void> => {
            try {
                await this.onAppReady();
            } catch (error) {
                logger.error(
                    LOG_TEMPLATES.errors.APPLICATION_INITIALIZATION_ERROR,
                    error
                );
            }
        })();
    };

    /**
     * Named event handler for window-all-closed event.
     */
    private readonly handleWindowAllClosed = (): void => {
        logger.info(LOG_TEMPLATES.services.APPLICATION_WINDOWS_CLOSED);
        if (process.platform !== "darwin") {
            logger.info(LOG_TEMPLATES.services.APPLICATION_QUITTING);
            app.quit();
        }
    };

    /**
     * Named event handler for activate event.
     */
    private readonly handleActivate = (): void => {
        logger.info(LOG_TEMPLATES.services.APPLICATION_ACTIVATED);
        const windowService = this.serviceContainer.getWindowService();
        if (windowService.getAllWindows().length === 0) {
            logger.info(LOG_TEMPLATES.services.APPLICATION_CREATING_WINDOW);
            windowService.createMainWindow();
        }
    };

    private get rendererEventBridge(): RendererEventBridge {
        return this.serviceContainer.getRendererEventBridge();
    }

    /**
     * Cleans up resources before application shutdown.
     *
     * @remarks
     * Performs ordered shutdown of all services including IPC cleanup,
     * monitoring stoppage, and window closure. Follows project error handling
     * standards by re-throwing errors after logging for upstream handling.
     *
     * @example
     *
     * ```typescript
     * await appService.cleanup();
     * ```
     *
     * @returns A promise that resolves when cleanup is complete.
     *
     * @throws Re-throws any errors encountered during cleanup for upstream
     *   handling.
     *
     * @public
     */
    public async cleanup(): Promise<void> {
        logger.info(LOG_TEMPLATES.services.APPLICATION_CLEANUP_START);

        try {
            const services = this.serviceContainer.getInitializedServices();
            for (const { name } of services) {
                logger.debug(
                    interpolateLogTemplate(
                        LOG_TEMPLATES.debug.APPLICATION_CLEANUP_SERVICE,
                        { name }
                    )
                );
            }

            // Remove application event listeners
            this.removeApplicationEventListeners();

            this.scopedSubscriptions.clearAll({
                onError: (error) => {
                    logger.error(
                        "[ApplicationService] Failed to dispose event subscription",
                        ensureError(error)
                    );
                },
                suppressErrors: true,
            });

            // Cleanup IPC handlers
            // NOTE: Currently synchronous, but designed to be
            // future-compatible with async cleanup
            const ipcService = this.serviceContainer.getIpcService();
            if (
                "cleanup" in ipcService &&
                typeof ipcService.cleanup === "function"
            ) {
                ipcService.cleanup();
            }

            // Stop monitoring
            const orchestrator = this.serviceContainer.getUptimeOrchestrator();
            await orchestrator.stopMonitoring();

            // Close windows
            // NOTE: Currently synchronous, but designed to be
            // future-compatible with async closure
            this.serviceContainer.getWindowService().closeMainWindow();

            const databaseServiceEntry = services.find(
                ({ name }) => name === "DatabaseService"
            );

            if (databaseServiceEntry) {
                const serviceCandidate = databaseServiceEntry.service;

                try {
                    if (hasCloseFunction(serviceCandidate)) {
                        serviceCandidate.close();
                    } else {
                        this.serviceContainer.getDatabaseService().close();
                    }
                } catch (error) {
                    logger.error(
                        LOG_TEMPLATES.errors.DATABASE_CLOSE_FAILED,
                        ensureError(error)
                    );
                }
            }

            logger.info(LOG_TEMPLATES.services.APPLICATION_CLEANUP_COMPLETE);
        } catch (error) {
            logger.error(
                LOG_TEMPLATES.errors.APPLICATION_CLEANUP_ERROR,
                ensureError(error)
            );
            // Re-throw errors after logging (project standard)
            throw error;
        }
    }

    /**
     * Handles the application ready event and initializes all services.
     *
     * @remarks
     * Performs ordered initialization of all services through the
     * {@link ServiceContainer}, creates the main application window, and sets up
     * event handlers and auto-updater. This method is called automatically when
     * Electron's 'ready' event fires. Errors are caught and logged by the
     * calling {@link setupApplication} method.
     *
     * @returns A promise that resolves when initialization is complete.
     *
     * @internal
     */
    private async onAppReady(): Promise<void> {
        logger.info(LOG_TEMPLATES.services.APPLICATION_READY);

        // Initialize all services through the container
        await this.serviceContainer.initialize();

        // Create main window
        this.serviceContainer.getWindowService().createMainWindow();

        // Setup event handlers
        this.setupUptimeEventHandlers();

        // Setup auto-updater
        this.setupAutoUpdater();

        logger.info(LOG_TEMPLATES.services.APPLICATION_SERVICES_INITIALIZED);
    }

    /**
     * Constructs the {@link ApplicationService} and sets up the service
     * container.
     *
     * @remarks
     * Creates a {@link ServiceContainer} instance with appropriate debug
     * settings and sets up application-level event handlers. This constructor
     * should be called once during application startup.
     *
     * @example
     *
     * ```typescript
     * const appService = new ApplicationService();
     * ```
     *
     * @public
     */
    public constructor() {
        logger.info(LOG_TEMPLATES.services.APPLICATION_INITIALIZING);

        // Get service container instance
        this.serviceContainer = ServiceContainer.getInstance({
            enableDebugLogging: isDevelopment(),
        });

        this.setupApplication();
    }

    /**
     * Sets up application-level Electron event handlers.
     *
     * @remarks
     * Configures handlers for core Electron application lifecycle events:
     *
     * - 'ready': Triggers service initialization and window creation
     * - 'window-all-closed': Handles application shutdown (platform-specific)
     * - 'activate': Handles application reactivation (macOS dock click)
     *
     * This method is called during construction to ensure event handlers are
     * registered before Electron's ready event fires.
     *
     * @internal
     */
    private setupApplication(): void {
        app.on("ready", this.handleAppReady);
        app.on("window-all-closed", this.handleWindowAllClosed);
        app.on("activate", this.handleActivate);
    }

    /**
     * Removes application event listeners. Called during cleanup to prevent
     * memory leaks.
     *
     * @internal
     */
    private removeApplicationEventListeners(): void {
        app.off("ready", this.handleAppReady);
        app.off("window-all-closed", this.handleWindowAllClosed);
        app.off("activate", this.handleActivate);
    }

    /**
     * Sets up the auto-updater service with status callbacks and
     * initialization.
     *
     * @remarks
     * Configures the auto-updater service to:
     *
     * - Send update status notifications to the renderer process
     * - Initialize the auto-updater mechanism
     * - Perform initial update check with error handling
     *
     * Update check errors are logged but not re-thrown to prevent application
     * startup failures due to network issues.
     *
     * @internal
     */
    private setupAutoUpdater(): void {
        const autoUpdater = this.serviceContainer.getAutoUpdaterService();

        autoUpdater.setStatusCallback((statusData) => {
            this.emitRendererEvent(
                RENDERER_EVENT_CHANNELS.UPDATE_STATUS,
                statusData
            );
        });

        autoUpdater.initialize();
        void (async (): Promise<void> => {
            try {
                await autoUpdater.checkForUpdates();
            } catch (error) {
                logger.error(
                    LOG_TEMPLATES.errors.APPLICATION_UPDATE_CHECK_ERROR,
                    error
                );
            }
        })();
    }

    /**
     * Sets up typed event handlers for uptime monitoring system events.
     *
     * @remarks
     * Establishes communication bridge between the uptime monitoring system and
     * the renderer process by forwarding typed events including: - Monitor
     * status changes (up/down/status-changed)
     *
     * - Monitoring lifecycle events (started/stopped)
     * - Cache invalidation events
     * - System errors
     *
     * Also triggers desktop notifications for monitor state changes. All event
     * forwarding includes error handling to prevent event processing failures
     * from affecting monitoring operations.
     *
     * @internal
     */
    private setupUptimeEventHandlers(): void {
        const orchestrator = this.serviceContainer.getUptimeOrchestrator();
        const rendererBridge = this.rendererEventBridge;
        const notificationService =
            this.serviceContainer.getNotificationService();

        // Handle monitor status changes with typed events
        this.scopedSubscriptions.onTyped<
            UptimeEvents,
            "monitor:status-changed"
        >(orchestrator, "monitor:status-changed", (data) => {
            const payload = this.stripOrchestratorPayloadMetadata(
                "monitor:status-changed",
                data
            );
            const monitorIdentifier = payload.monitor.id;
            const siteIdentifier = payload.site.identifier;
            try {
                logger.debug(
                    LOG_TEMPLATES.debug.APPLICATION_FORWARDING_MONITOR_STATUS,
                    {
                        monitorId: monitorIdentifier,
                        newStatus: payload.status,
                        previousStatus: payload.previousStatus,
                        siteIdentifier,
                    }
                );

                // Send status update to renderer
                this.emitRendererEvent(
                    RENDERER_EVENT_CHANNELS.MONITOR_STATUS_CHANGED,
                    payload
                );
            } catch (error: unknown) {
                logger.error(
                    LOG_TEMPLATES.errors
                        .APPLICATION_FORWARD_MONITOR_STATUS_ERROR,
                    ensureError(error)
                );
            }
        });

        // Handle monitor up events
        this.scopedSubscriptions.onTyped<UptimeEvents, "monitor:up">(
            orchestrator,
            "monitor:up",
            (data) => {
                const payload = this.stripOrchestratorPayloadMetadata(
                    "monitor:up",
                    data
                );
                try {
                    logger.info(
                        LOG_TEMPLATES.debug.APPLICATION_FORWARDING_MONITOR_UP,
                        {
                            monitorId: payload.monitor.id,
                            siteIdentifier: payload.site.identifier,
                            siteName: payload.site.name,
                        }
                    );

                    this.emitRendererEvent(
                        RENDERER_EVENT_CHANNELS.MONITOR_UP,
                        payload
                    );
                    notificationService.notifyMonitorUp(
                        payload.site,
                        payload.monitor.id
                    );
                } catch (error: unknown) {
                    logger.error(
                        LOG_TEMPLATES.errors
                            .APPLICATION_FORWARD_MONITOR_UP_ERROR,
                        ensureError(error)
                    );
                }
            }
        );

        // Handle monitor down events
        this.scopedSubscriptions.onTyped<UptimeEvents, "monitor:down">(
            orchestrator,
            "monitor:down",
            (data) => {
                const payload = this.stripOrchestratorPayloadMetadata(
                    "monitor:down",
                    data
                );
                try {
                    logger.warn(
                        LOG_TEMPLATES.warnings.APPLICATION_MONITOR_DOWN,
                        {
                            monitorId: payload.monitor.id,
                            siteIdentifier: payload.site.identifier,
                            siteName: payload.site.name,
                        }
                    );

                    this.emitRendererEvent(
                        RENDERER_EVENT_CHANNELS.MONITOR_DOWN,
                        payload
                    );
                    notificationService.notifyMonitorDown(
                        payload.site,
                        payload.monitor.id
                    );
                } catch (error: unknown) {
                    logger.error(
                        LOG_TEMPLATES.errors
                            .APPLICATION_FORWARD_MONITOR_DOWN_ERROR,
                        ensureError(error)
                    );
                }
            }
        );

        this.scopedSubscriptions.onTyped<
            UptimeEvents,
            "monitor:check-completed"
        >(orchestrator, "monitor:check-completed", (data) => {
            const payload = this.stripOrchestratorPayloadMetadata(
                "monitor:check-completed",
                data
            );
            try {
                logger.debug(
                    LOG_TEMPLATES.debug
                        .APPLICATION_FORWARDING_MANUAL_CHECK_COMPLETED,
                    {
                        checkType: payload.checkType,
                        monitorId: payload.monitorId,
                        siteIdentifier: payload.siteIdentifier,
                    }
                );
                this.emitRendererEvent(
                    RENDERER_EVENT_CHANNELS.MONITOR_CHECK_COMPLETED,
                    payload
                );
            } catch (error: unknown) {
                logger.error(
                    LOG_TEMPLATES.errors
                        .APPLICATION_FORWARD_MANUAL_CHECK_COMPLETED_ERROR,
                    ensureError(error)
                );
            }
        });

        this.scopedSubscriptions.onTyped<
            UptimeEvents,
            "settings:history-limit-updated"
        >(orchestrator, "settings:history-limit-updated", (data) => {
            const payload = this.stripOrchestratorPayloadMetadata(
                "settings:history-limit-updated",
                data
            );
            try {
                logger.debug(
                    LOG_TEMPLATES.debug
                        .APPLICATION_FORWARDING_HISTORY_LIMIT_UPDATED,
                    {
                        limit: payload.limit,
                        previousLimit: payload.previousLimit,
                        timestamp: payload.timestamp,
                    }
                );
                this.emitRendererEvent(
                    RENDERER_EVENT_CHANNELS.SETTINGS_HISTORY_LIMIT_UPDATED,
                    payload
                );
            } catch (error: unknown) {
                logger.error(
                    LOG_TEMPLATES.errors
                        .APPLICATION_FORWARD_HISTORY_LIMIT_UPDATED_ERROR,
                    ensureError(error)
                );
            }
        });

        // Handle system errors
        this.scopedSubscriptions.onTyped<UptimeEvents, "system:error">(
            orchestrator,
            "system:error",
            (data) => {
                const payload = this.stripOrchestratorPayloadMetadata(
                    "system:error",
                    data
                );
                logger.error(
                    interpolateLogTemplate(
                        LOG_TEMPLATES.errors.APPLICATION_SYSTEM_ERROR,
                        { context: payload.context }
                    ),
                    payload.error
                );
            }
        );

        // Forward monitoring start/stop events to renderer
        this.scopedSubscriptions.onTyped<UptimeEvents, "monitoring:started">(
            orchestrator,
            "monitoring:started",
            (data) => {
                const payload = this.stripOrchestratorPayloadMetadata(
                    "monitoring:started",
                    data
                );
                try {
                    logger.debug(
                        LOG_TEMPLATES.debug
                            .APPLICATION_FORWARDING_MONITORING_STARTED,
                        payload
                    );
                    this.emitRendererEvent(
                        RENDERER_EVENT_CHANNELS.MONITORING_STARTED,
                        payload
                    );
                } catch (error: unknown) {
                    logger.error(
                        LOG_TEMPLATES.errors
                            .APPLICATION_FORWARD_MONITORING_STARTED_ERROR,
                        ensureError(error)
                    );
                }
            }
        );

        this.scopedSubscriptions.onTyped<UptimeEvents, "monitoring:stopped">(
            orchestrator,
            "monitoring:stopped",
            (data) => {
                const payload = this.stripOrchestratorPayloadMetadata(
                    "monitoring:stopped",
                    data
                );
                try {
                    logger.debug(
                        LOG_TEMPLATES.debug
                            .APPLICATION_FORWARDING_MONITORING_STOPPED,
                        payload
                    );
                    this.emitRendererEvent(
                        RENDERER_EVENT_CHANNELS.MONITORING_STOPPED,
                        payload
                    );
                } catch (error: unknown) {
                    logger.error(
                        LOG_TEMPLATES.errors
                            .APPLICATION_FORWARD_MONITORING_STOPPED_ERROR,
                        ensureError(error)
                    );
                }
            }
        );

        this.scopedSubscriptions.onTyped<UptimeEvents, "site:added">(
            orchestrator,
            "site:added",
            (data) => {
                const payload = this.stripOrchestratorPayloadMetadata(
                    "site:added",
                    data
                );
                try {
                    logger.debug(
                        LOG_TEMPLATES.debug.APPLICATION_FORWARDING_SITE_ADDED,
                        {
                            identifier: payload.site.identifier,
                            source: payload.source,
                        }
                    );
                    this.emitRendererEvent(
                        RENDERER_EVENT_CHANNELS.SITE_ADDED,
                        payload
                    );
                } catch (error: unknown) {
                    logger.error(
                        LOG_TEMPLATES.errors
                            .APPLICATION_FORWARD_SITE_ADDED_ERROR,
                        ensureError(error)
                    );
                }
            }
        );

        this.scopedSubscriptions.onTyped<UptimeEvents, "site:removed">(
            orchestrator,
            "site:removed",
            (data) => {
                const payload = this.stripOrchestratorPayloadMetadata(
                    "site:removed",
                    data
                );
                try {
                    logger.debug(
                        LOG_TEMPLATES.debug.APPLICATION_FORWARDING_SITE_REMOVED,
                        {
                            cascade: payload.cascade,
                            siteIdentifier: payload.siteIdentifier,
                        }
                    );
                    this.emitRendererEvent(
                        RENDERER_EVENT_CHANNELS.SITE_REMOVED,
                        payload
                    );
                } catch (error: unknown) {
                    logger.error(
                        LOG_TEMPLATES.errors
                            .APPLICATION_FORWARD_SITE_REMOVED_ERROR,
                        ensureError(error)
                    );
                }
            }
        );

        this.scopedSubscriptions.onTyped<UptimeEvents, "site:updated">(
            orchestrator,
            "site:updated",
            (data) => {
                const payload = this.stripOrchestratorPayloadMetadata(
                    "site:updated",
                    data
                );
                try {
                    logger.debug(
                        LOG_TEMPLATES.debug.APPLICATION_FORWARDING_SITE_UPDATED,
                        {
                            identifier: payload.site.identifier,
                            updatedFields: payload.updatedFields.join(", "),
                        }
                    );
                    this.emitRendererEvent(
                        RENDERER_EVENT_CHANNELS.SITE_UPDATED,
                        payload
                    );
                } catch (error: unknown) {
                    logger.error(
                        LOG_TEMPLATES.errors
                            .APPLICATION_FORWARD_SITE_UPDATED_ERROR,
                        ensureError(error)
                    );
                }
            }
        );

        this.scopedSubscriptions.onTyped<
            UptimeEvents,
            "sites:state-synchronized"
        >(orchestrator, "sites:state-synchronized", (data) => {
            const payload = this.stripOrchestratorPayloadMetadata(
                "sites:state-synchronized",
                data
            );
            try {
                logger.debug(
                    LOG_TEMPLATES.debug.APPLICATION_FORWARDING_STATE_SYNC,
                    {
                        action: payload.action,
                        siteIdentifier: payload.siteIdentifier,
                        sitesCount: payload.sites.length,
                        source: payload.source,
                    }
                );
                rendererBridge.sendStateSyncEvent(payload);
            } catch (error: unknown) {
                logger.error(
                    LOG_TEMPLATES.errors.APPLICATION_FORWARD_STATE_SYNC_ERROR,
                    ensureError(error)
                );
            }
        });

        // Handle cache invalidation events
        this.scopedSubscriptions.onTyped<UptimeEvents, "cache:invalidated">(
            orchestrator,
            "cache:invalidated",
            (data) => {
                const payload = this.stripOrchestratorPayloadMetadata(
                    "cache:invalidated",
                    data
                );
                try {
                    logger.debug(
                        LOG_TEMPLATES.debug
                            .APPLICATION_FORWARDING_CACHE_INVALIDATION,
                        {
                            identifier: payload.identifier,
                            reason: payload.reason,
                            type: payload.type,
                        }
                    );
                    this.emitRendererEvent(
                        RENDERER_EVENT_CHANNELS.CACHE_INVALIDATED,
                        payload
                    );
                } catch (error) {
                    logger.error(
                        LOG_TEMPLATES.errors
                            .APPLICATION_FORWARD_CACHE_INVALIDATION_ERROR,
                        ensureError(error)
                    );
                }
            }
        );
    }

    private stripOrchestratorPayloadMetadata<
        EventName extends EventKey<UptimeEvents>,
    >(
        eventName: EventName,
        payload: EnhancedEventPayload<UptimeEvents[EventName]>
    ): UptimeEvents[EventName] {
        const isArrayPayload = Array.isArray(payload);
        const sanitizedPayload = stripForwardedEventMetadata(payload);

        this.logMetadataRemoval(eventName, isArrayPayload);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- After stripping metadata, the payload matches the event contract.
        return sanitizedPayload as unknown as UptimeEvents[EventName];
    }

    private logMetadataRemoval(
        eventName: EventKey<UptimeEvents>,
        isArrayPayload: boolean
    ): void {
        logger.debug(
            `[ApplicationService] Stripped orchestrator metadata for ${eventName} ${isArrayPayload ? "(array payload)" : ""}`.trim()
        );
    }

    private emitRendererEvent<K extends RendererEventChannel>(
        channel: K,
        payload: RendererEventPayload<K>
    ): void {
        this.rendererEventBridge.sendToRenderers(channel, payload);
    }
}

import {
    RENDERER_EVENT_CHANNELS,
    type RendererEventChannel,
    type RendererEventPayload,
} from "@shared/ipc/rendererEvents";
import { STATE_SYNC_ACTION } from "@shared/types/stateSync";
/**
 * Main app service that orchestrates all other services and coordinates app
 * lifecycle across the Electron backend.
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
import { getCallableDataProperty } from "@shared/utils/errorPropertyAccess";
import {
    interpolateLogTemplate,
    LOG_TEMPLATES,
} from "@shared/utils/logTemplates";
import { castUnchecked } from "@shared/utils/typeHelpers";
import { app } from "electron";
import { isEmpty } from "ts-extras";

import type { UptimeEvents } from "../../events/eventTypes";
import type {
    EnhancedEventPayload,
    EventKey,
    EventPayload,
} from "../../events/TypedEventBus";
import type { RendererEventBridge } from "../events/RendererEventBridge";

import { ScopedSubscriptionManager } from "../../events/ScopedSubscriptionManager";
import { stripForwardedEventMetadata } from "../../utils/eventMetadataForwarding";
import { fireAndForgetLogged } from "../../utils/fireAndForget";
import { logger } from "../../utils/logger";
import { ServiceContainer } from "../ServiceContainer";

/**
 * High-level coordinator responsible for wiring Electron app lifecycle events
 * to the underlying service container and orchestrator.
 *
 * @public
 */
export class ApplicationService {
    /** Shared cleanup task so startup rollback and app quit cannot overlap. */
    private cleanupPromise: Promise<void> | undefined;

    /** Startup task shared with cleanup to prevent lifecycle overlap. */
    private initializationPromise: Promise<void> | undefined;

    /** Prevents late Electron ready events from starting work during cleanup. */
    private isShuttingDown = false;

    /**
     * The container for all app services.
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
        if (this.isShuttingDown || this.initializationPromise) {
            return;
        }

        const initializationPromise = this.onAppReady();
        this.initializationPromise = initializationPromise;
        fireAndForgetLogged({
            logger,
            message: LOG_TEMPLATES.errors.APPLICATION_INITIALIZATION_ERROR,
            task: async () => {
                try {
                    await initializationPromise;
                } catch (error: unknown) {
                    const initializationError = ensureError(error);
                    let errorToReport: Error = initializationError;

                    try {
                        await this.cleanup();
                    } catch (cleanupError: unknown) {
                        errorToReport = new AggregateError(
                            [initializationError, ensureError(cleanupError)],
                            "Application initialization and rollback cleanup failed",
                            { cause: cleanupError }
                        );
                    }

                    app.exit(1);
                    throw errorToReport;
                }
            },
        });
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
        if (isEmpty(windowService.getAllWindows())) {
            logger.info(LOG_TEMPLATES.services.APPLICATION_CREATING_WINDOW);
            windowService.createMainWindow();
        }
    };

    private get rendererEventBridge(): RendererEventBridge {
        return this.serviceContainer.getRendererEventBridge();
    }

    /**
     * Cleans up resources before app shutdown.
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
        this.cleanupPromise ??= this.performCleanup();
        await this.cleanupPromise;
    }

    private async performCleanup(): Promise<void> {
        this.isShuttingDown = true;
        logger.info(LOG_TEMPLATES.services.APPLICATION_CLEANUP_START);

        try {
            // Stop accepting lifecycle events immediately, then wait for any
            // startup work that already began before touching its services.
            this.removeApplicationEventListeners();
            if (this.initializationPromise) {
                await Promise.allSettled([this.initializationPromise]);
            }

            const services = this.serviceContainer.getInitializedServices();
            const getInitializedService = (serviceName: string): unknown =>
                services.find(({ name }) => name === serviceName)?.service;
            const cleanupErrors: Error[] = [];
            const attemptCleanup = async (
                operation: () => unknown
            ): Promise<void> => {
                try {
                    await operation();
                } catch (error: unknown) {
                    cleanupErrors.push(ensureError(error));
                }
            };

            for (const { name } of services) {
                logger.debug(
                    interpolateLogTemplate(
                        LOG_TEMPLATES.debug.APPLICATION_CLEANUP_SERVICE,
                        { name }
                    )
                );
            }

            this.scopedSubscriptions.clearAll({
                onError: (error) => {
                    logger.error(
                        "[ApplicationService] Failed to dispose event subscription",
                        ensureError(error)
                    );
                },
                suppressErrors: true,
            });

            // Stop scheduler callbacks and drain any provider operation before
            // tearing down IPC, monitoring, or database dependencies.
            await attemptCleanup(async () => {
                await this.serviceContainer.shutdownCloudSyncScheduler();
            });

            const autoUpdaterService =
                getInitializedService("AutoUpdaterService");
            if (autoUpdaterService) {
                const cleanupAutoUpdater = getCallableDataProperty(
                    autoUpdaterService,
                    "cleanup"
                );
                await attemptCleanup(() =>
                    cleanupAutoUpdater?.call(autoUpdaterService)
                );
            }

            // Cleanup IPC handlers
            // NOTE: Currently synchronous, but designed to be
            // future-compatible with async cleanup
            const ipcService = getInitializedService("IpcService");
            if (ipcService) {
                const cleanupIpc = getCallableDataProperty(
                    ipcService,
                    "cleanup"
                );
                await attemptCleanup(() => cleanupIpc?.call(ipcService));
            }

            // Stop monitoring and detach orchestrator subscriptions.
            const orchestrator = getInitializedService("UptimeOrchestrator");
            if (orchestrator) {
                const shutdownOrchestrator = getCallableDataProperty(
                    orchestrator,
                    "shutdown"
                );
                await attemptCleanup(async () => {
                    await shutdownOrchestrator?.call(orchestrator);
                });
            }

            // Close windows
            // NOTE: Currently synchronous, but designed to be
            // future-compatible with async closure
            const windowService = getInitializedService("WindowService");
            if (windowService) {
                const closeMainWindow = getCallableDataProperty(
                    windowService,
                    "closeMainWindow"
                );
                await attemptCleanup(() =>
                    closeMainWindow?.call(windowService)
                );
            }

            const databaseService = getInitializedService("DatabaseService");
            if (databaseService) {
                const serviceCandidate = databaseService;

                await attemptCleanup(() => {
                    const closeDatabase = getCallableDataProperty(
                        serviceCandidate,
                        "close"
                    );
                    if (closeDatabase) {
                        closeDatabase.call(serviceCandidate);
                    } else {
                        this.serviceContainer.getDatabaseService().close();
                    }
                });
            }

            if (cleanupErrors.length === 1) {
                throw ensureError(cleanupErrors[0]);
            }
            if (cleanupErrors.length > 1) {
                throw new AggregateError(
                    cleanupErrors,
                    "Multiple application cleanup stages failed",
                    { cause: ensureError(cleanupErrors[0]) }
                );
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
     * Handles the app ready event and initializes all services.
     *
     * @remarks
     * Performs ordered initialization of all services through the
     * {@link ServiceContainer}, creates the main app window, and sets up event
     * handlers and auto-updater. This method is called automatically when
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
     * should be called once during app startup.
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
     * Configures handlers for core Electron app lifecycle events:
     *
     * - 'ready': Triggers service initialization and window creation
     * - 'window-all-closed': Handles app shutdown (platform-specific)
     * - 'activate': Handles app reactivation (macOS dock click)
     *
     * This method is called during construction to ensure event handlers are
     * registered before Electron's ready event fires.
     *
     * @internal
     */
    private setupApplication(): void {
        if (app.isReady()) {
            this.handleAppReady();
        } else {
            app.on("ready", this.handleAppReady);
        }

        app.on("window-all-closed", this.handleWindowAllClosed);
        app.on("activate", this.handleActivate);
    }

    /**
     * Removes app event listeners. Called during cleanup to prevent memory
     * leaks.
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
     * Update check errors are logged but not re-thrown to prevent app startup
     * failures due to network issues.
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
        fireAndForgetLogged({
            logger,
            message: LOG_TEMPLATES.errors.APPLICATION_UPDATE_CHECK_ERROR,
            task: async () => {
                await autoUpdater.checkForUpdates();
            },
        });
    }

    /**
     * Sets up typed event handlers for uptime monitoring system events.
     *
     * @remarks
     * Establishes communication between the uptime monitoring system, desktop
     * notifications, and the renderer process. Renderer broadcasts include:
     *
     * - Monitor status changes (`monitor:status-changed`)
     * - Monitoring lifecycle events (started/stopped)
     * - Cache invalidation events
     * - System errors
     *
     * Monitor up/down transitions are consumed locally for desktop
     * notifications; state synchronization keeps renderer site data current.
     * Every handler contains its own error boundary so notification or renderer
     * failures do not affect monitoring operations.
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
                        LOG_TEMPLATES.debug.APPLICATION_MONITOR_RECOVERED,
                        {
                            monitorId: payload.monitor.id,
                            siteIdentifier: payload.site.identifier,
                            siteName: payload.site.name,
                        }
                    );

                    notificationService.notifyMonitorUp(
                        payload.site,
                        payload.monitor.id
                    );
                } catch (error: unknown) {
                    logger.error(
                        LOG_TEMPLATES.errors
                            .APPLICATION_HANDLE_MONITOR_UP_ERROR,
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
                        LOG_TEMPLATES.warnings.APPLICATION_MONITOR_FAILURE,
                        {
                            monitorId: payload.monitor.id,
                            siteIdentifier: payload.site.identifier,
                            siteName: payload.site.name,
                        }
                    );

                    notificationService.notifyMonitorDown(
                        payload.site,
                        payload.monitor.id
                    );
                } catch (error: unknown) {
                    logger.error(
                        LOG_TEMPLATES.errors
                            .APPLICATION_HANDLE_MONITOR_DOWN_ERROR,
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

        this.scopedSubscriptions.onTyped<
            UptimeEvents,
            "sites:state-synchronized"
        >(orchestrator, "sites:state-synchronized", (data) => {
            const payload = this.stripOrchestratorPayloadMetadata(
                "sites:state-synchronized",
                data
            );
            try {
                const sitesCount =
                    payload.action === STATE_SYNC_ACTION.BULK_SYNC
                        ? payload.sites.length
                        : undefined;
                const delta =
                    payload.action === STATE_SYNC_ACTION.BULK_SYNC
                        ? undefined
                        : payload.delta;

                logger.debug(
                    LOG_TEMPLATES.debug.APPLICATION_FORWARDING_STATE_SYNC,
                    {
                        action: payload.action,
                        revision: payload.revision,
                        siteIdentifier: payload.siteIdentifier,
                        ...(typeof sitesCount === "number" && { sitesCount }),
                        ...(delta && {
                            deltaAddedCount: delta.addedSites.length,
                            deltaRemovedCount:
                                delta.removedSiteIdentifiers.length,
                            deltaUpdatedCount: delta.updatedSites.length,
                        }),
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
        payload: EnhancedEventPayload<EventPayload<UptimeEvents, EventName>>
    ): EventPayload<UptimeEvents, EventName> {
        const isArrayPayload = Array.isArray(payload);

        if (isArrayPayload) {
            this.logMetadataRemoval(eventName, true);
            return castUnchecked<EventPayload<UptimeEvents, EventName>>(
                stripForwardedEventMetadata(payload)
            );
        }

        this.logMetadataRemoval(eventName, false);
        return castUnchecked<EventPayload<UptimeEvents, EventName>>(
            stripForwardedEventMetadata(payload)
        );
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

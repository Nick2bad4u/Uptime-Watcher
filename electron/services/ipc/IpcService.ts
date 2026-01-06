import type { Site } from "@shared/types";
import type { EventMetadata } from "@shared/types/events";
import type { IpcInvokeChannel } from "@shared/types/ipc";
import type {
    StateSyncSource,
    StateSyncStatusSummary,
} from "@shared/types/stateSync";

import { STATE_SYNC_SOURCE } from "@shared/types/stateSync";
import { ensureError } from "@shared/utils/errorHandling";
import { LOG_TEMPLATES } from "@shared/utils/logTemplates";
import { ipcMain } from "electron";

import type { UptimeEvents } from "../../events/eventTypes";
import type { UptimeOrchestrator } from "../../UptimeOrchestrator";
import type { CloudService } from "../cloud/CloudService";
import type { NotificationService } from "../notifications/NotificationService";
import type { AutoUpdaterService } from "../updater/AutoUpdaterService";

import { ScopedSubscriptionManager } from "../../events/ScopedSubscriptionManager";
import { logger } from "../../utils/logger";
import { registerCloudHandlers } from "./handlers/cloudHandlers";
import { registerDataHandlers } from "./handlers/dataHandlers";
import { registerDiagnosticsHandlers } from "./handlers/diagnosticsHandlers";
import { registerMonitoringHandlers } from "./handlers/monitoringHandlers";
import { registerMonitorTypeHandlers } from "./handlers/monitorTypeHandlers";
import { registerNotificationHandlers } from "./handlers/notificationHandlers";
import { registerSettingsHandlers } from "./handlers/settingsHandlers";
import { registerSiteHandlers } from "./handlers/siteHandlers";
import { registerStateSyncHandlers } from "./handlers/stateSyncHandlers";
import { registerSystemHandlers } from "./handlers/systemHandlers";

/**
 * Centralizes registration and lifecycle management of Electron IPC handlers.
 */
export class IpcService {
    private readonly autoUpdaterService: AutoUpdaterService;

    private readonly registeredIpcHandlers = new Set<IpcInvokeChannel>();

    private readonly scopedSubscriptions = new ScopedSubscriptionManager();

    private readonly uptimeOrchestrator: UptimeOrchestrator;

    private stateSyncStatus: StateSyncStatusSummary;

    private knownSiteIdentifiers = new Set<string>();

    private stateSyncListenerRegistered = false;

    private readonly notificationService: NotificationService;

    private readonly cloudService: CloudService;

    private readonly handleStateSyncStatusUpdate = (
        data: UptimeEvents["sites:state-synchronized"] & {
            _meta?: EventMetadata;
        }
    ): void => {
        this.updateStateSyncStatusFromEvent(data);
    };

    public constructor(
        uptimeOrchestrator: UptimeOrchestrator,
        autoUpdaterService: AutoUpdaterService,
        notificationService: NotificationService,
        cloudService: CloudService
    ) {
        this.uptimeOrchestrator = uptimeOrchestrator;
        this.autoUpdaterService = autoUpdaterService;
        this.notificationService = notificationService;
        this.cloudService = cloudService;
        this.stateSyncStatus = {
            lastSyncAt: null,
            siteCount: 0,
            source: STATE_SYNC_SOURCE.CACHE,
            synchronized: false,
        } satisfies StateSyncStatusSummary;
    }

    public cleanup(): void {
        logger.info(LOG_TEMPLATES.services.IPC_SERVICE_CLEANUP);
        for (const channel of this.registeredIpcHandlers) {
            ipcMain.removeHandler(channel);
        }

        this.registeredIpcHandlers.clear();

        this.scopedSubscriptions.clearAll({
            onError: (error) => {
                logger.error(
                    "[IpcService] Failed to dispose event subscription",
                    ensureError(error)
                );
            },
            suppressErrors: true,
        });

        this.stateSyncListenerRegistered = false;
    }

    public setupHandlers(): void {
        registerCloudHandlers({
            cloudService: this.cloudService,
            registeredHandlers: this.registeredIpcHandlers,
        });

        registerSiteHandlers({
            registeredHandlers: this.registeredIpcHandlers,
            uptimeOrchestrator: this.uptimeOrchestrator,
        });

        registerMonitoringHandlers({
            registeredHandlers: this.registeredIpcHandlers,
            uptimeOrchestrator: this.uptimeOrchestrator,
        });

        registerMonitorTypeHandlers({
            registeredHandlers: this.registeredIpcHandlers,
        });

        registerDataHandlers({
            registeredHandlers: this.registeredIpcHandlers,
            uptimeOrchestrator: this.uptimeOrchestrator,
        });

        registerSettingsHandlers({
            registeredHandlers: this.registeredIpcHandlers,
            uptimeOrchestrator: this.uptimeOrchestrator,
        });

        registerNotificationHandlers({
            notificationService: this.notificationService,
            registeredHandlers: this.registeredIpcHandlers,
        });

        registerSystemHandlers({
            autoUpdaterService: this.autoUpdaterService,
            registeredHandlers: this.registeredIpcHandlers,
        });

        registerStateSyncHandlers({
            getStateSyncStatus: () => this.stateSyncStatus,
            registeredHandlers: this.registeredIpcHandlers,
            setStateSyncStatus: (summary) => {
                this.stateSyncStatus = summary;
            },
            uptimeOrchestrator: this.uptimeOrchestrator,
        });

        registerDiagnosticsHandlers({
            eventEmitter: this.uptimeOrchestrator,
            registeredHandlers: this.registeredIpcHandlers,
        });

        this.ensureStateSyncListener();
    }

    private ensureStateSyncListener(): void {
        if (this.stateSyncListenerRegistered) {
            return;
        }

        this.scopedSubscriptions.onTyped<
            UptimeEvents,
            "sites:state-synchronized"
        >(
            this.uptimeOrchestrator,
            "sites:state-synchronized",
            this.handleStateSyncStatusUpdate
        );
        this.stateSyncListenerRegistered = true;
    }

    private updateStateSyncStatus(
        sites: Site[],
        source: StateSyncSource,
        timestamp: number
    ): void {
        this.stateSyncStatus = {
            lastSyncAt: timestamp,
            siteCount: sites.length,
            source,
            synchronized: true,
        } satisfies StateSyncStatusSummary;
    }

    private updateStateSyncStatusFromEvent(
        event: UptimeEvents["sites:state-synchronized"] & {
            _meta?: EventMetadata;
        }
    ): void {
        const { source, timestamp } = event;

        if (event.truncated === true) {
            this.stateSyncStatus = {
                lastSyncAt: timestamp,
                siteCount: this.knownSiteIdentifiers.size,
                source,
                synchronized: false,
            } satisfies StateSyncStatusSummary;
            return;
        }

        if (event.action === "bulk-sync") {
            const { sites } = event;
            this.knownSiteIdentifiers = new Set(
                sites.map((site) => site.identifier)
            );
            this.updateStateSyncStatus(sites, source, timestamp);
            return;
        }

        // Update/delete are delta-only.
        const { delta } = event;

        const { addedSites, removedSiteIdentifiers, updatedSites } = delta;

        for (const removedSiteIdentifier of removedSiteIdentifiers) {
            this.knownSiteIdentifiers.delete(removedSiteIdentifier);
        }

        for (const site of addedSites) {
            this.knownSiteIdentifiers.add(site.identifier);
        }

        for (const site of updatedSites) {
            this.knownSiteIdentifiers.add(site.identifier);
        }

        this.stateSyncStatus = {
            lastSyncAt: timestamp,
            siteCount: this.knownSiteIdentifiers.size,
            source,
            synchronized: true,
        } satisfies StateSyncStatusSummary;
    }
}

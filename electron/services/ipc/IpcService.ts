import type { IpcInvokeChannel } from "@shared/types/ipc";

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
import { StateSyncStatusTracker } from "./internal/stateSyncStatusTracker";

/**
 * Centralizes registration and lifecycle management of Electron IPC handlers.
 */
export class IpcService {
    private readonly autoUpdaterService: AutoUpdaterService;

    private readonly registeredIpcHandlers = new Set<IpcInvokeChannel>();

    private readonly scopedSubscriptions = new ScopedSubscriptionManager();

    private readonly uptimeOrchestrator: UptimeOrchestrator;

    private readonly stateSyncStatusTracker: StateSyncStatusTracker;

    private stateSyncListenerRegistered = false;

    private readonly notificationService: NotificationService;

    private readonly cloudService: CloudService;

    private readonly handleStateSyncStatusUpdate = (data: unknown): void => {
        this.stateSyncStatusTracker.handleStatusEvent(data);
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
        this.stateSyncStatusTracker = new StateSyncStatusTracker(logger);
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

        this.stateSyncStatusTracker.reset();
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
            getStateSyncStatus: () => this.stateSyncStatusTracker.getStatus(),
            registeredHandlers: this.registeredIpcHandlers,
            setStateSyncStatus: (summary) => {
                this.stateSyncStatusTracker.setStatus(summary);
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
}

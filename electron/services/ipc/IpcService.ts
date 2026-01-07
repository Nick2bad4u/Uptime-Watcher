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
import { isRecord } from "@shared/utils/typeHelpers";
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

    private readonly handleStateSyncStatusUpdate = (data: unknown): void => {
        const normalized = this.normalizeStateSyncPayload(data);
        if (!normalized) {
            logger.warn(
                "[IpcService] Ignoring malformed sites:state-synchronized payload",
                {
                    payloadType: Array.isArray(data) ? "array" : typeof data,
                }
            );
            return;
        }

        this.updateStateSyncStatusFromEvent(normalized);
    };

private static isValidStateSyncSource(
        candidate: unknown
    ): candidate is StateSyncSource {
        return (
            candidate === STATE_SYNC_SOURCE.CACHE ||
            candidate === STATE_SYNC_SOURCE.DATABASE ||
            candidate === STATE_SYNC_SOURCE.FRONTEND
        );
    }

    private static buildIdentifierOnlySites(candidate: unknown): Site[] {
        if (!Array.isArray(candidate)) {
            return [];
        }

        return candidate
            .filter(isRecord)
            .map((siteCandidate) => siteCandidate["identifier"])
            .filter((identifier): identifier is string =>
                typeof identifier === "string"
            )
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Identifier-only snapshots are sufficient for IPC sync bookkeeping.
            .map((identifier) => ({ identifier }) as Site);
    }

    /**
     * Normalizes a raw state-sync event payload into a lightweight shape the
     * IPC layer can safely consume.
     *
     * @remarks
     * We intentionally avoid validating full {@link Site} payloads here.
     * State sync events can be high-frequency and large, and IPC only needs
     * identifiers and counts to maintain {@link StateSyncStatusSummary}.
     */
    private normalizeStateSyncPayload(
        candidate: unknown
    ):
        | null
        | (UptimeEvents["sites:state-synchronized"] & {
              _meta?: EventMetadata;
          }) {
        if (!isRecord(candidate)) {
            return null;
        }

        const { action, revision, source, timestamp } = candidate;

        if (
            (action !== "bulk-sync" && action !== "delete" && action !== "update") ||
            !IpcService.isValidStateSyncSource(source) ||
            typeof timestamp !== "number" ||
            !Number.isFinite(timestamp) ||
            typeof revision !== "number" ||
            !Number.isFinite(revision)
        ) {
            return null;
        }

        if (action === "bulk-sync") {
            const {
                siteCount: siteCountCandidate,
                sites: sitesCandidate,
                truncated,
            } = candidate;

            if (
                typeof siteCountCandidate !== "number" ||
                !Number.isFinite(siteCountCandidate) ||
                !Array.isArray(sitesCandidate)
            ) {
                return null;
            }

            const isTruncated = truncated === true;
            const sites = isTruncated
                ? []
                : IpcService.buildIdentifierOnlySites(sitesCandidate);

            return {
                action,
                revision,
                // Preserve the declared count even if we drop invalid site entries.
                siteCount: Math.max(0, Math.trunc(siteCountCandidate)),
                sites,
                source,
                timestamp,
                truncated: isTruncated,
            } as UptimeEvents["sites:state-synchronized"] & {
                _meta?: EventMetadata;
            };
        }

        const { delta: deltaCandidate } = candidate;
        if (!isRecord(deltaCandidate)) {
            return null;
        }

        const {
            addedSites: addedSitesCandidate,
            removedSiteIdentifiers: removedSiteIdentifiersCandidate,
            updatedSites: updatedSitesCandidate,
        } = deltaCandidate;

        if (
            !Array.isArray(addedSitesCandidate) ||
            !Array.isArray(updatedSitesCandidate) ||
            !Array.isArray(removedSiteIdentifiersCandidate)
        ) {
            return null;
        }

        const addedSites = IpcService.buildIdentifierOnlySites(
            addedSitesCandidate
        );
        const updatedSites = IpcService.buildIdentifierOnlySites(
            updatedSitesCandidate
        );
        const removedSiteIdentifiers = removedSiteIdentifiersCandidate.filter(
            (identifier): identifier is string => typeof identifier === "string"
        );

        return {
            action,
            delta: {
                addedSites,
                removedSiteIdentifiers,
                updatedSites,
            },
            revision,
            source,
            timestamp,
        } as UptimeEvents["sites:state-synchronized"] & {
            _meta?: EventMetadata;
        };
    }



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
        const { action, source, timestamp, truncated } = event;

        if (truncated === true) {
            const { siteCount } = event;

            this.stateSyncStatus = {
                lastSyncAt: timestamp,
                siteCount,
                source,
                synchronized: false,
            } satisfies StateSyncStatusSummary;
            return;
        }

        if (action === "bulk-sync") {
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

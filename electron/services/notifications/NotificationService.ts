import type { Monitor, Site } from "@shared/types";
import type { AppNotificationRequest } from "@shared/types/notifications";

import { generateCorrelationId } from "@shared/utils/correlation";
import { Notification } from "electron";

import type { UptimeEvents } from "../../events/eventTypes";
import type { TypedEventBus } from "../../events/TypedEventBus";

import { logger } from "../../utils/logger";
import { MIN_CHECK_INTERVAL } from "../monitoring/constants";

const LOG_TEMPLATES = {
    errors: {
        NOTIFY_DOWN_MONITOR_NOT_FOUND:
            "[NotificationService] Cannot notify down: monitor with ID %s not found",
        NOTIFY_DOWN_MONITOR_NULL:
            "[NotificationService] Cannot notify down: monitorId is invalid",
        NOTIFY_UP_MONITOR_NOT_FOUND:
            "[NotificationService] Cannot notify up: monitor with ID %s not found",
        NOTIFY_UP_MONITOR_NULL:
            "[NotificationService] Cannot notify up: monitorId is invalid",
    },
    warnings: {
        NOTIFICATIONS_UNSUPPORTED:
            "Notifications not supported on this platform",
        NOTIFY_SUPPRESSED:
            "[NotificationService] Suppressed %s notification for %s due to %s",
    },
} as const;

export const DEFAULT_DOWN_ALERT_COOLDOWN_MS = 90_000;

type MonitorStatusKind = "down" | "up";

interface MonitorNotificationState {
    lastNotifiedAt?: number;
    lastStatus?: MonitorStatusKind;
    suppressionUntil?: number;
}

type NotificationEventBus = Pick<TypedEventBus<UptimeEvents>, "emitTyped">;

const noopEventBus: NotificationEventBus = {
    async emitTyped() {
        /* noop */
    },
};

/**
 * User-configurable notification preferences applied to outage/restore alerts.
 */
export interface NotificationConfig {
    downAlertCooldownMs: number;
    enabled: boolean;
    /** Optional list of muted site identifiers for system notifications. */
    mutedSiteNotificationIdentifiers?: readonly string[];
    playSound: boolean;
    restoreRequiresOutage: boolean;
    showDownAlerts: boolean;
    showUpAlerts: boolean;
}

interface NotificationContext {
    monitor: Monitor;
    responseTime?: number;
    site: Site;
    status: MonitorStatusKind;
}

/**
 * Central notification orchestrator that enforces throttling and ordering rules
 * before emitting system notifications for monitor outages/restores.
 */
export class NotificationService {
    private config: NotificationConfig = {
        downAlertCooldownMs: DEFAULT_DOWN_ALERT_COOLDOWN_MS,
        enabled: true,
        playSound: false,
        restoreRequiresOutage: true,
        showDownAlerts: true,
        showUpAlerts: true,
    };

    private readonly monitorState = new Map<string, MonitorNotificationState>();

    /** Event emitter used to surface notification lifecycle telemetry. */
    private readonly eventEmitter: NotificationEventBus;

    /** Cached set of muted site identifiers for fast lookup. */
    private mutedSites = new Set<string>();

    private async emitNotificationSentEvent(
        context: NotificationContext
    ): Promise<void> {
        const correlationId = generateCorrelationId();

        try {
            await this.eventEmitter.emitTyped("notification:sent", {
                correlationId,
                monitorId: context.monitor.id,
                siteIdentifier: context.site.identifier,
                status: context.status,
                timestamp: Date.now(),
            });
        } catch (error: unknown) {
            logger.error(
                "[NotificationService] Failed to emit notification:sent",
                error
            );
        }
    }

    public constructor(eventEmitter: NotificationEventBus = noopEventBus) {
        this.eventEmitter = eventEmitter;
    }

    public isSupported(): boolean {
        return Notification.isSupported();
    }

    public updateConfig(newConfig: Partial<NotificationConfig>): void {
        const mutedIdentifiers = newConfig.mutedSiteNotificationIdentifiers;
        if (Array.isArray(mutedIdentifiers)) {
            this.mutedSites = new Set<string>(mutedIdentifiers);
        }

        this.config = { ...this.config, ...newConfig };
    }

    public getConfig(): NotificationConfig {
        return { ...this.config };
    }

    public notifyMonitorDown(site: Site, monitorId: string): void {
        if (!this.shouldGenerateNotification(this.config.showDownAlerts)) {
            return;
        }

        const monitor = this.findMonitorOrLog(site, monitorId, "down");
        if (!monitor) return;

        const now = Date.now();
        const stateKey = this.getStateKey(site.identifier, monitorId);
        if (this.isSiteMuted(site.identifier)) {
            logger.debug(
                LOG_TEMPLATES.warnings.NOTIFY_SUPPRESSED,
                "down",
                stateKey,
                "site muted"
            );
            return;
        }
        if (!this.shouldDispatchForStatus(stateKey, "down", now)) {
            return;
        }

        const context: NotificationContext = {
            monitor,
            responseTime: monitor.responseTime,
            site,
            status: "down",
        };
        this.showNotification(context, {
            body: this.composeDownBody(context),
            title: `${site.name} monitor is down`,
            urgency: "critical",
        });
    }

    public notifyMonitorUp(site: Site, monitorId: string): void {
        if (!this.shouldGenerateNotification(this.config.showUpAlerts)) {
            return;
        }

        const monitor = this.findMonitorOrLog(site, monitorId, "up");
        if (!monitor) return;

        const now = Date.now();
        const stateKey = this.getStateKey(site.identifier, monitorId);
        if (this.isSiteMuted(site.identifier)) {
            logger.debug(
                LOG_TEMPLATES.warnings.NOTIFY_SUPPRESSED,
                "up",
                stateKey,
                "site muted"
            );
            return;
        }
        if (!this.shouldDispatchForStatus(stateKey, "up", now)) {
            return;
        }

        const context: NotificationContext = {
            monitor,
            responseTime: monitor.responseTime,
            site,
            status: "up",
        };
        this.showNotification(context, {
            body: this.composeUpBody(context),
            title: `${site.name} monitor restored`,
            urgency: "normal",
        });
    }

    /**
     * Dispatches a generic system notification for user-initiated app events.
     *
     * @remarks
     * This is intentionally separate from outage/restore notifications:
     *
     * - It does not participate in per-site muting.
     * - It does not use the outage cooldown logic.
     * - It still respects the global notification enablement and platform support
     *   checks.
     */
    public notifyAppEvent(request: AppNotificationRequest): void {
        if (!this.shouldGenerateNotification(true)) {
            return;
        }

        const title = request.title.trim();
        if (title.length === 0) {
            return;
        }

        const body =
            typeof request.body === "string" ? request.body : undefined;

        const notification = new Notification({
            ...(body === undefined ? {} : { body }),
            silent: !this.config.playSound,
            title,
        });

        notification.show();
        logger.debug("[NotificationService] Dispatched app notification", {
            title,
        });
    }

    private shouldGenerateNotification(condition: boolean): boolean {
        if (!this.config.enabled || !condition) {
            return false;
        }

        if (!this.isSupported()) {
            logger.warn(LOG_TEMPLATES.warnings.NOTIFICATIONS_UNSUPPORTED);
            return false;
        }

        return true;
    }

    private findMonitorOrLog(
        site: Site,
        monitorId: string,
        status: MonitorStatusKind
    ): Monitor | undefined {
        if (!monitorId) {
            logger.error(
                status === "down"
                    ? LOG_TEMPLATES.errors.NOTIFY_DOWN_MONITOR_NULL
                    : LOG_TEMPLATES.errors.NOTIFY_UP_MONITOR_NULL
            );
            return undefined;
        }

        const monitor = site.monitors.find((m) => m.id === monitorId);
        if (!monitor) {
            logger.error(
                status === "down"
                    ? LOG_TEMPLATES.errors.NOTIFY_DOWN_MONITOR_NOT_FOUND
                    : LOG_TEMPLATES.errors.NOTIFY_UP_MONITOR_NOT_FOUND,
                monitorId
            );
        }

        return monitor;
    }

    private getStateKey(siteIdentifier: string, monitorId: string): string {
        return `${siteIdentifier}|${monitorId}`;
    }

    private shouldDispatchForStatus(
        stateKey: string,
        nextStatus: MonitorStatusKind,
        now: number
    ): boolean {
        const state = this.monitorState.get(stateKey) ?? {};

        if (nextStatus === "down") {
            if (
                state.lastStatus === "down" &&
                state.suppressionUntil !== undefined &&
                now < state.suppressionUntil
            ) {
                const remaining = state.suppressionUntil - now;
                logger.debug(
                    LOG_TEMPLATES.warnings.NOTIFY_SUPPRESSED,
                    "down",
                    stateKey,
                    `cooldown (${remaining}ms remaining)`
                );
                return false;
            }

            state.lastStatus = "down";
            state.lastNotifiedAt = now;
            state.suppressionUntil =
                now +
                Math.max(this.config.downAlertCooldownMs, MIN_CHECK_INTERVAL);
            this.monitorState.set(stateKey, state);
            return true;
        }

        if (this.config.restoreRequiresOutage && state.lastStatus !== "down") {
            logger.debug(
                LOG_TEMPLATES.warnings.NOTIFY_SUPPRESSED,
                "up",
                stateKey,
                "no prior outage notification"
            );
            return false;
        }

        state.lastStatus = "up";
        state.lastNotifiedAt = now;
        state.suppressionUntil = 0;
        this.monitorState.set(stateKey, state);
        return true;
    }

    private showNotification(
        context: NotificationContext,
        options: {
            body: string;
            title: string;
            urgency: "critical" | "normal";
        }
    ): void {
        const notification = new Notification({
            body: options.body,
            silent: !this.config.playSound,
            title: options.title,
            urgency: options.urgency,
        });
        notification.show();

        logger.info(
            `[NotificationService] Dispatched ${context.status} notification for ${context.site.identifier}|${context.monitor.id}`,
            {
                monitorId: context.monitor.id,
                responseTime: context.responseTime,
                siteIdentifier: context.site.identifier,
                status: context.status,
            }
        );

        void this.emitNotificationSentEvent(context);
    }

    private composeDownBody(context: NotificationContext): string {
        const metric =
            context.responseTime === undefined
                ? "Last response unavailable."
                : `Last response ${context.responseTime}ms.`;
        const monitorLabel = this.describeMonitor(context.monitor);
        return `${monitorLabel} reported DOWN at ${new Date().toLocaleTimeString()}. ${metric}`;
    }

    private composeUpBody(context: NotificationContext): string {
        const monitorLabel = this.describeMonitor(context.monitor);
        return `${monitorLabel} is back online as of ${new Date().toLocaleTimeString()}.`;
    }

    private describeMonitor(monitor: Monitor): string {
        const label = monitor.url ?? monitor.host ?? monitor.id;
        return `${label} (${monitor.type})`;
    }

    private isSiteMuted(siteIdentifier: string): boolean {
        return this.mutedSites.has(siteIdentifier);
    }
}

import type { Monitor, Site } from "@shared/types";
import type { AppNotificationRequest } from "@shared/types/notifications";

import { generateCorrelationId } from "@shared/utils/correlation";
import { getSafeIdentifierForLogging } from "@shared/utils/identifierLogging";
import { getSafeUrlForDisplay } from "@shared/utils/urlSafety";
import { normalizeUserFacingErrorDetail } from "@shared/utils/userFacingErrors";
import { Notification } from "electron";
import { isDefined, isFinite as isFiniteNumber, setHas } from "ts-extras";

import type { UptimeEvents } from "../../events/eventTypes";
import type { TypedEventBus } from "../../events/TypedEventBus";

import { logger } from "../../utils/logger";
import { fireAndForget } from "../../utils/fireAndForget";
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

const DEFAULT_DOWN_ALERT_COOLDOWN_MS = 90_000;

const MAX_NOTIFICATION_BODY_CHARS = 500;
const MAX_NOTIFICATION_TITLE_CHARS = 120;
const MAX_NOTIFICATION_BODY_DETAIL_CHARS =
    MAX_NOTIFICATION_BODY_CHARS - "...".length;
const MAX_NOTIFICATION_TITLE_DETAIL_CHARS =
    MAX_NOTIFICATION_TITLE_CHARS - "...".length;
const NOTIFICATION_FALLBACK_BODY = "Status changed.";
const NOTIFICATION_FALLBACK_TITLE = "Uptime Watcher";

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

function normalizeNotificationText(args: {
    fallback: string;
    maxLength: number;
    value: string;
}): string {
    return (
        normalizeUserFacingErrorDetail(args.value, {
            maxLength: args.maxLength,
        }) ?? args.fallback
    );
}

function getMonitorUrlLabel(monitor: Monitor): string | undefined {
    const url =
        monitor.url ??
        monitor.baselineUrl ??
        monitor.primaryStatusUrl ??
        monitor.replicaStatusUrl;

    return typeof url === "string" && url.length > 0
        ? getSafeUrlForDisplay(url)
        : undefined;
}

const getSafeIdentifier = (identifier: string): string =>
    getSafeIdentifierForLogging(identifier) ?? identifier;

function formatLastResponseMetric(responseTime: number | undefined): string {
    if (
        !isDefined(responseTime) ||
        !isFiniteNumber(responseTime) ||
        responseTime < 0
    ) {
        return "Last response unavailable.";
    }

    return `Last response ${responseTime}ms.`;
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
        const mutedIdentifiers: NotificationConfig["mutedSiteNotificationIdentifiers"] =
            newConfig.mutedSiteNotificationIdentifiers;
        const mutedSiteNotificationIdentifiers =
            mutedIdentifiers === undefined ? undefined : [...mutedIdentifiers];

        if (mutedSiteNotificationIdentifiers !== undefined) {
            this.mutedSites = new Set<string>(mutedSiteNotificationIdentifiers);
        }

        const downAlertCooldownMs = this.normalizeDownAlertCooldownMs(
            newConfig.downAlertCooldownMs
        );

        this.config = {
            ...this.config,
            ...newConfig,
            ...(mutedSiteNotificationIdentifiers !== undefined && {
                mutedSiteNotificationIdentifiers,
            }),
            downAlertCooldownMs,
        };
    }

    public getConfig(): NotificationConfig {
        return {
            ...this.config,
            ...(this.config.mutedSiteNotificationIdentifiers && {
                mutedSiteNotificationIdentifiers: [
                    ...this.config.mutedSiteNotificationIdentifiers,
                ],
            }),
        };
    }

    /**
     * Applies shared suppression logic for monitor status notifications.
     *
     * @remarks
     * Consolidates the duplicated code paths used by both down/up
     * notifications:
     *
     * - Site muting
     * - Per-monitor cooldown suppression
     */
    private shouldDispatchMonitorStatusNotification(args: {
        monitorId: string;
        now: number;
        siteIdentifier: string;
        status: "down" | "up";
    }): boolean {
        const stateKey = this.getStateKey(args.siteIdentifier, args.monitorId);
        const safeStateKey = this.getSafeStateKey(
            args.siteIdentifier,
            args.monitorId
        );

        if (this.isSiteMuted(args.siteIdentifier)) {
            logger.debug(
                LOG_TEMPLATES.warnings.NOTIFY_SUPPRESSED,
                args.status,
                safeStateKey,
                "site muted"
            );
            return false;
        }

        return this.shouldDispatchForStatus(
            stateKey,
            safeStateKey,
            args.status,
            args.now
        );
    }

    public notifyMonitorDown(site: Site, monitorId: string): void {
        if (!this.shouldGenerateNotification(this.config.showDownAlerts)) {
            return;
        }

        const monitor = this.findMonitorOrLog(site, monitorId, "down");
        if (!monitor) return;

        const now = Date.now();
        if (
            !this.shouldDispatchMonitorStatusNotification({
                monitorId,
                now,
                siteIdentifier: site.identifier,
                status: "down",
            })
        ) {
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
        if (
            !this.shouldDispatchMonitorStatusNotification({
                monitorId,
                now,
                siteIdentifier: site.identifier,
                status: "up",
            })
        ) {
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

        const title = normalizeUserFacingErrorDetail(request.title, {
            maxLength: MAX_NOTIFICATION_TITLE_DETAIL_CHARS,
        });
        if (!title) {
            return;
        }

        const body =
            typeof request.body === "string"
                ? normalizeUserFacingErrorDetail(request.body, {
                      maxLength: MAX_NOTIFICATION_BODY_DETAIL_CHARS,
                  })
                : undefined;

        const notification = new Notification({
            ...(isDefined(body) && { body }),
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
                getSafeIdentifier(monitorId)
            );
        }

        return monitor;
    }

    private getStateKey(siteIdentifier: string, monitorId: string): string {
        return `${siteIdentifier}|${monitorId}`;
    }

    private getSafeStateKey(siteIdentifier: string, monitorId: string): string {
        return `${getSafeIdentifier(siteIdentifier)}|${getSafeIdentifier(monitorId)}`;
    }

    private shouldDispatchForStatus(
        stateKey: string,
        safeStateKey: string,
        nextStatus: MonitorStatusKind,
        now: number
    ): boolean {
        const state = this.monitorState.get(stateKey) ?? {};

        if (nextStatus === "down") {
            if (
                state.lastStatus === "down" &&
                isDefined(state.suppressionUntil) &&
                now < state.suppressionUntil
            ) {
                const remaining = state.suppressionUntil - now;
                logger.debug(
                    LOG_TEMPLATES.warnings.NOTIFY_SUPPRESSED,
                    "down",
                    safeStateKey,
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
                safeStateKey,
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

    private normalizeDownAlertCooldownMs(
        candidate: NotificationConfig["downAlertCooldownMs"] | undefined
    ): number {
        if (!isDefined(candidate)) {
            return this.config.downAlertCooldownMs;
        }

        if (!isFiniteNumber(candidate) || candidate < 0) {
            logger.warn(
                "[NotificationService] Invalid down alert cooldown value; keeping previous value",
                {
                    candidate,
                }
            );
            return this.config.downAlertCooldownMs;
        }

        return Math.trunc(candidate);
    }

    private showNotification(
        context: NotificationContext,
        options: {
            body: string;
            title: string;
            urgency: "critical" | "normal";
        }
    ): void {
        const body = normalizeNotificationText({
            fallback: NOTIFICATION_FALLBACK_BODY,
            maxLength: MAX_NOTIFICATION_BODY_DETAIL_CHARS,
            value: options.body,
        });
        const title = normalizeNotificationText({
            fallback: NOTIFICATION_FALLBACK_TITLE,
            maxLength: MAX_NOTIFICATION_TITLE_DETAIL_CHARS,
            value: options.title,
        });

        const notification = new Notification({
            body,
            silent: !this.config.playSound,
            title,
            urgency: options.urgency,
        });
        notification.show();

        logger.info(
            `[NotificationService] Dispatched ${context.status} notification for ${this.getSafeStateKey(context.site.identifier, context.monitor.id)}`,
            {
                monitorId: getSafeIdentifier(context.monitor.id),
                responseTime: context.responseTime,
                siteIdentifier: getSafeIdentifier(context.site.identifier),
                status: context.status,
            }
        );

        fireAndForget(
            async () => {
                await this.emitNotificationSentEvent(context);
            },
            {
                onError: (error) => {
                    logger.error(
                        "[NotificationService] Unexpected notification event dispatch failure",
                        error
                    );
                },
            }
        );
    }

    private composeDownBody(context: NotificationContext): string {
        const metric = formatLastResponseMetric(context.responseTime);
        const monitorLabel = this.describeMonitor(context.monitor);
        return `${monitorLabel} reported DOWN at ${new Date().toLocaleTimeString()}. ${metric}`;
    }

    private composeUpBody(context: NotificationContext): string {
        const monitorLabel = this.describeMonitor(context.monitor);
        return `${monitorLabel} is back online as of ${new Date().toLocaleTimeString()}.`;
    }

    private describeMonitor(monitor: Monitor): string {
        const label = getMonitorUrlLabel(monitor) ?? monitor.host ?? monitor.id;
        return `${label} (${monitor.type})`;
    }

    private isSiteMuted(siteIdentifier: string): boolean {
        return setHas(this.mutedSites, siteIdentifier);
    }
}

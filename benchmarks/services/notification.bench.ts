/**
 * Notification Service Performance Benchmarks.
 *
 * @packageDocumentation
 *
 * Exercises synthetic notification queues, channel providers, and delivery
 * pipelines to assess performance characteristics.
 */

import { bench, describe } from "vitest";

/**
 * Synthetic notification channel configuration used in benchmarks.
 */
interface NotificationChannel {
    id: string;
    type: "email" | "sms" | "slack" | "webhook" | "push" | "in-app";
    name: string;
    configuration: Record<string, any>;
    isActive: boolean;
    rateLimits: {
        maxPerMinute: number;
        maxPerHour: number;
        maxPerDay: number;
    };
}

/**
 * Template metadata describing notification content and variables.
 */
interface NotificationTemplate {
    id: string;
    name: string;
    subject: string;
    body: string;
    variables: string[];
    channelTypes: string[];
    metadata: Record<string, any>;
}

/**
 * Represents a notification request entering the queue.
 */
interface NotificationRequest {
    templateId: string;
    channelIds: string[];
    recipients: string[];
    variables: Record<string, any>;
    priority: "low" | "normal" | "high" | "urgent";
    scheduledAt?: Date;
    metadata?: Record<string, any>;
}

/**
 * Captures queued notification state tracked by the dispatcher.
 */
interface QueuedNotification {
    id: string;
    request: NotificationRequest;
    status: "pending" | "processing" | "sent" | "failed" | "retrying";
    attempts: number;
    maxAttempts: number;
    createdAt: Date;
    scheduledAt: Date;
    sentAt?: Date;
    failedAt?: Date;
    error?: string;
    deliveryReceipts: DeliveryReceipt[];
}

/**
 * Delivery receipt emitted by channel providers.
 */
interface DeliveryReceipt {
    channelId: string;
    recipient: string;
    status: "delivered" | "failed" | "bounced" | "unsubscribed";
    timestamp: Date;
    response?: any;
    error?: string;
}

/**
 * Aggregated statistics describing queue health.
 */
interface NotificationStats {
    total: number;
    sent: number;
    failed: number;
    pending: number;
    byChannel: Record<string, number>;
    byPriority: Record<string, number>;
}

/**
 * Simulates a notification queue with prioritised scheduling and retries.
 */
class MockNotificationQueue {
    private queue = new Map<string, QueuedNotification>();
    private processing = new Set<string>();
    private nextId = 1;

    /**
     * Enqueues a notification request and returns its identifier.
     *
     * @param request - Notification payload to store.
     *
     * @returns Identifier assigned to the queued notification.
     */
    async enqueue(request: NotificationRequest): Promise<string> {
        const id = `notification-${this.nextId++}`;
        const now = new Date();

        const queuedNotification: QueuedNotification = {
            id,
            request,
            status: "pending",
            attempts: 0,
            maxAttempts:
                request.priority === "urgent"
                    ? 5
                    : request.priority === "high"
                      ? 3
                      : 2,
            createdAt: now,
            scheduledAt: request.scheduledAt || now,
            deliveryReceipts: [],
        };

        this.queue.set(id, queuedNotification);
        return id;
    }

    /**
     * Dequeues the next eligible notification, optionally filtering by
     * priority.
     *
     * @param priority - Optional priority filter (e.g. `urgent`).
     *
     * @returns Copy of the queued notification or `null` when none are ready.
     */
    async dequeue(priority?: string): Promise<QueuedNotification | null> {
        const now = new Date();

        // Find next notification to process
        let candidates = Array.from(this.queue.values()).filter(
            (n) =>
                n.status === "pending" &&
                n.scheduledAt <= now &&
                !this.processing.has(n.id)
        );

        if (priority) {
            candidates = candidates.filter(
                (n) => n.request.priority === priority
            );
        }

        // Sort by priority and creation time
        candidates.sort((a, b) => {
            const priorityOrder = { urgent: 4, high: 3, normal: 2, low: 1 };
            const aPriority = priorityOrder[a.request.priority];
            const bPriority = priorityOrder[b.request.priority];

            if (aPriority !== bPriority) {
                return bPriority - aPriority;
            }

            return a.createdAt.getTime() - b.createdAt.getTime();
        });

        const notification = candidates[0];
        if (notification) {
            this.processing.add(notification.id);
            await this.updateStatus(notification.id, "processing");
        }

        return notification ? { ...notification } : null;
    }

    /**
     * Marks a notification as completed, updating retry metadata accordingly.
     *
     * @param id - Identifier of the notification to update.
     * @param success - Indicates whether delivery succeeded.
     * @param receipts - Optional delivery receipts.
     * @param error - Optional error message when delivery fails.
     */
    async markComplete(
        id: string,
        success: boolean,
        receipts?: DeliveryReceipt[],
        error?: string
    ): Promise<void> {
        const notification = this.queue.get(id);
        if (!notification) return;

        notification.attempts++;
        notification.deliveryReceipts = receipts || [];

        if (success) {
            notification.status = "sent";
            notification.sentAt = new Date();
        } else if (notification.attempts >= notification.maxAttempts) {
            notification.status = "failed";
            notification.failedAt = new Date();
            notification.error = error;
        } else {
            notification.status = "retrying";
            // Exponential backoff
            const delay = 2 ** notification.attempts * 1000;
            notification.scheduledAt = new Date(Date.now() + delay);
        }

        this.processing.delete(id);
        this.queue.set(id, notification);
    }

    /**
     * Updates the status of a queued notification.
     *
     * @param id - Identifier of the notification to modify.
     * @param status - New status value.
     */
    async updateStatus(
        id: string,
        status: QueuedNotification["status"]
    ): Promise<void> {
        const notification = this.queue.get(id);
        if (notification) {
            notification.status = status;
            this.queue.set(id, notification);
        }
    }

    /**
     * Aggregates queue statistics including totals by channel and priority.
     *
     * @returns Summary statistics describing the queue.
     */
    async getStats(): Promise<NotificationStats> {
        const notifications = Array.from(this.queue.values());

        const stats: NotificationStats = {
            total: notifications.length,
            sent: 0,
            failed: 0,
            pending: 0,
            byChannel: {},
            byPriority: {},
        };

        for (const notification of notifications) {
            switch (notification.status) {
                case "sent": {
                    stats.sent++;
                    break;
                }
                case "failed": {
                    stats.failed++;
                    break;
                }
                case "pending":
                case "processing":
                case "retrying": {
                    stats.pending++;
                    break;
                }
            }

            // Count by priority
            const priority = notification.request.priority;
            stats.byPriority[priority] = (stats.byPriority[priority] || 0) + 1;

            // Count by channel
            for (const channelId of notification.request.channelIds) {
                stats.byChannel[channelId] =
                    (stats.byChannel[channelId] || 0) + 1;
            }
        }

        return stats;
    }

    /**
     * Removes completed notifications older than the supplied timestamp.
     *
     * @param olderThan - Cut-off timestamp for cleanup.
     *
     * @returns Number of entries removed.
     */
    async cleanup(olderThan: Date): Promise<number> {
        let cleaned = 0;
        for (const [id, notification] of this.queue) {
            if (
                (notification.status === "sent" ||
                    notification.status === "failed") &&
                notification.createdAt < olderThan
            ) {
                this.queue.delete(id);
                cleaned++;
            }
        }
        return cleaned;
    }

    /** Clears all queue state. */
    clear(): void {
        this.queue.clear();
        this.processing.clear();
        this.nextId = 1;
    }

    /**
     * Returns the total number of queued notifications.
     *
     * @returns Queue size.
     */
    size(): number {
        return this.queue.size;
    }

    /**
     * Counts notifications pending delivery or awaiting retries.
     *
     * @returns Number of pending notifications.
     */
    getPendingCount(): number {
        return Array.from(this.queue.values()).filter(
            (n) => n.status === "pending" || n.status === "retrying"
        ).length;
    }
}

/**
 * Simulates delivery channels with rate limiting and success modelling.
 */
class MockChannelProvider {
    private channels = new Map<string, NotificationChannel>();
    private rateLimitCounters = new Map<
        string,
        { minute: number; hour: number; day: number; lastReset: Date }
    >();

    /** Seeds the provider with default channel configurations. */
    constructor() {
        this.initializeDefaultChannels();
    }

    /**
     * Attempts to send a notification via the requested channel.
     *
     * @param channelId - Identifier of the target channel.
     * @param recipient - Recipient identifier (email, phone, etc.).
     * @param subject - Notification subject/title.
     * @param body - Notification body content.
     *
     * @returns Delivery receipt describing success or failure.
     */
    async send(
        channelId: string,
        recipient: string,
        subject: string,
        body: string
    ): Promise<DeliveryReceipt> {
        const channel = this.channels.get(channelId);
        if (!channel || !channel.isActive) {
            return {
                channelId,
                recipient,
                status: "failed",
                timestamp: new Date(),
                error: "Channel not found or inactive",
            };
        }

        // Check rate limits
        if (!this.checkRateLimit(channelId)) {
            return {
                channelId,
                recipient,
                status: "failed",
                timestamp: new Date(),
                error: "Rate limit exceeded",
            };
        }

        // Simulate sending with various success rates
        const successRate = this.getChannelSuccessRate(channel.type);
        const success = Math.random() < successRate;

        // Update rate limit counters
        this.updateRateLimitCounters(channelId);

        return {
            channelId,
            recipient,
            status: success ? "delivered" : "failed",
            timestamp: new Date(),
            response: success ? { messageId: `msg-${Date.now()}` } : undefined,
            error: success ? undefined : "Simulated delivery failure",
        };
    }

    /**
     * Determines whether the channel has remaining rate-limit capacity.
     *
     * @param channelId - Identifier of the channel to evaluate.
     *
     * @returns `true` when limits permit another send.
     */
    private checkRateLimit(channelId: string): boolean {
        const channel = this.channels.get(channelId);
        if (!channel) return false;

        const counters = this.getRateLimitCounters(channelId);
        const limits = channel.rateLimits;

        return (
            counters.minute < limits.maxPerMinute &&
            counters.hour < limits.maxPerHour &&
            counters.day < limits.maxPerDay
        );
    }

    /**
     * Increments the rate-limit counters for the supplied channel.
     *
     * @param channelId - Identifier whose counters should be updated.
     */
    private updateRateLimitCounters(channelId: string): void {
        const counters = this.getRateLimitCounters(channelId);
        counters.minute++;
        counters.hour++;
        counters.day++;
        counters.lastReset = new Date();
        this.rateLimitCounters.set(channelId, counters);
    }

    /**
     * Retrieves or initialises rate-limit counters for a channel.
     *
     * @param channelId - Identifier whose counters are required.
     *
     * @returns Mutable counter structure.
     */
    private getRateLimitCounters(channelId: string): {
        minute: number;
        hour: number;
        day: number;
        lastReset: Date;
    } {
        const now = new Date();
        const existing = this.rateLimitCounters.get(channelId);

        if (!existing) {
            const counters = { minute: 0, hour: 0, day: 0, lastReset: now };
            this.rateLimitCounters.set(channelId, counters);
            return counters;
        }

        // Reset counters based on time elapsed
        const elapsed = now.getTime() - existing.lastReset.getTime();
        const minuteElapsed = elapsed / (60 * 1000);
        const hourElapsed = elapsed / (60 * 60 * 1000);
        const dayElapsed = elapsed / (24 * 60 * 60 * 1000);

        if (minuteElapsed >= 1) existing.minute = 0;
        if (hourElapsed >= 1) existing.hour = 0;
        if (dayElapsed >= 1) existing.day = 0;

        return existing;
    }

    /**
     * Provides per-channel success probabilities.
     *
     * @param type - Channel type key.
     *
     * @returns Probability of successful delivery.
     */
    private getChannelSuccessRate(type: string): number {
        const rates = {
            email: 0.95,
            sms: 0.98,
            slack: 0.99,
            webhook: 0.92,
            push: 0.88,
            "in-app": 0.99,
        };
        return rates[type] || 0.9;
    }

    /** Registers default channels used during benchmarks. */
    private initializeDefaultChannels(): void {
        const channels = [
            {
                id: "email-primary",
                type: "email" as const,
                name: "Primary Email",
                configuration: { smtp: "smtp.example.com" },
                isActive: true,
                rateLimits: {
                    maxPerMinute: 10,
                    maxPerHour: 100,
                    maxPerDay: 1000,
                },
            },
            {
                id: "sms-primary",
                type: "sms" as const,
                name: "Primary SMS",
                configuration: { provider: "twilio" },
                isActive: true,
                rateLimits: { maxPerMinute: 5, maxPerHour: 50, maxPerDay: 200 },
            },
            {
                id: "slack-alerts",
                type: "slack" as const,
                name: "Slack Alerts",
                configuration: { webhook: "https://hooks.slack.com/..." },
                isActive: true,
                rateLimits: {
                    maxPerMinute: 20,
                    maxPerHour: 200,
                    maxPerDay: 2000,
                },
            },
            {
                id: "webhook-primary",
                type: "webhook" as const,
                name: "Primary Webhook",
                configuration: { url: "https://api.example.com/webhook" },
                isActive: true,
                rateLimits: {
                    maxPerMinute: 30,
                    maxPerHour: 300,
                    maxPerDay: 3000,
                },
            },
        ];

        channels.forEach((channel) => this.channels.set(channel.id, channel));
    }

    /**
     * Retrieves a channel definition by identifier.
     *
     * @param id - Channel identifier to look up.
     *
     * @returns Channel clone or `null` when absent.
     */
    getChannel(id: string): NotificationChannel | null {
        const channel = this.channels.get(id);
        return channel ? { ...channel } : null;
    }

    /**
     * Returns all configured channels.
     */
    getAllChannels(): NotificationChannel[] {
        return Array.from(this.channels.values(), (channel) => ({
            ...channel,
        }));
    }

    /** Clears channel rate-limit counters. */
    clear(): void {
        this.rateLimitCounters.clear();
    }
}

/**
 * Minimal template engine used to substitute variables into notification
 * payloads.
 */
class MockTemplateEngine {
    private templates = new Map<string, NotificationTemplate>();

    /** Seeds the engine with default templates. */
    constructor() {
        this.initializeDefaultTemplates();
    }

    /**
     * Renders the specified template using the provided variables.
     *
     * @param templateId - Identifier of the template to render.
     * @param variables - Key/value pairs used for substitution.
     *
     * @returns Subject and body strings with variables replaced.
     */
    async render(
        templateId: string,
        variables: Record<string, any>
    ): Promise<{ subject: string; body: string }> {
        const template = this.templates.get(templateId);
        if (!template) {
            throw new Error(`Template ${templateId} not found`);
        }

        // Simple variable substitution
        let subject = template.subject;
        let body = template.body;

        for (const [key, value] of Object.entries(variables)) {
            const placeholder = `{{${key}}}`;
            subject = subject.replaceAll(
                new RegExp(placeholder, "g"),
                String(value)
            );
            body = body.replaceAll(new RegExp(placeholder, "g"), String(value));
        }

        return { subject, body };
    }

    /** Registers default templates consumed by the benchmarks. */
    private initializeDefaultTemplates(): void {
        const templates = [
            {
                id: "site-down",
                name: "Site Down Alert",
                subject: "ALERT: {{siteName}} is DOWN",
                body: "Site {{siteName}} ({{siteUrl}}) is currently down. Last check failed at {{timestamp}} with error: {{error}}",
                variables: [
                    "siteName",
                    "siteUrl",
                    "timestamp",
                    "error",
                ],
                channelTypes: [
                    "email",
                    "sms",
                    "slack",
                ],
                metadata: {},
            },
            {
                id: "site-up",
                name: "Site Recovery",
                subject: "RECOVERY: {{siteName}} is back UP",
                body: "Site {{siteName}} ({{siteUrl}}) has recovered and is now accessible. Downtime duration: {{downtime}}",
                variables: [
                    "siteName",
                    "siteUrl",
                    "downtime",
                ],
                channelTypes: ["email", "slack"],
                metadata: {},
            },
            {
                id: "maintenance",
                name: "Maintenance Notification",
                subject: "Maintenance scheduled for {{siteName}}",
                body: "Scheduled maintenance for {{siteName}} will begin at {{startTime}} and is expected to last {{duration}}.",
                variables: [
                    "siteName",
                    "startTime",
                    "duration",
                ],
                channelTypes: [
                    "email",
                    "slack",
                    "in-app",
                ],
                metadata: {},
            },
            {
                id: "daily-report",
                name: "Daily Status Report",
                subject: "Daily Uptime Report - {{date}}",
                body: "Daily report for {{date}}:\n\nTotal sites monitored: {{totalSites}}\nUptime: {{uptime}}%\nIncidents: {{incidents}}",
                variables: [
                    "date",
                    "totalSites",
                    "uptime",
                    "incidents",
                ],
                channelTypes: ["email"],
                metadata: {},
            },
        ];

        templates.forEach((template) =>
            this.templates.set(template.id, template as NotificationTemplate));
    }

    /**
     * Retrieves a template definition by identifier.
     *
     * @param id - Template identifier to resolve.
     *
     * @returns Template clone or `null` when missing.
     */
    getTemplate(id: string): NotificationTemplate | null {
        const template = this.templates.get(id);
        return template ? { ...template } : null;
    }
}

/**
 * High-level notification service coordinating queueing and delivery.
 */
class MockNotificationService {
    private queue: MockNotificationQueue;
    private channelProvider: MockChannelProvider;
    private templateEngine: MockTemplateEngine;
    private processingInterval?: NodeJS.Timeout;
    private isProcessing = false;

    /** Builds the service with fresh queue, provider, and template engine. */
    constructor() {
        this.queue = new MockNotificationQueue();
        this.channelProvider = new MockChannelProvider();
        this.templateEngine = new MockTemplateEngine();
    }

    /**
     * Validates and enqueues a notification for processing.
     *
     * @param request - Notification request to queue.
     *
     * @returns Identifier assigned to the queued notification.
     */
    async sendNotification(request: NotificationRequest): Promise<string> {
        // Validate template exists
        const template = this.templateEngine.getTemplate(request.templateId);
        if (!template) {
            throw new Error(`Template ${request.templateId} not found`);
        }

        // Validate channels exist
        for (const channelId of request.channelIds) {
            const channel = this.channelProvider.getChannel(channelId);
            if (!channel) {
                throw new Error(`Channel ${channelId} not found`);
            }
        }

        // Enqueue notification
        return await this.queue.enqueue(request);
    }

    /**
     * Attempts to enqueue a list of notifications, skipping invalid entries.
     */
    async sendBulkNotifications(
        requests: NotificationRequest[]
    ): Promise<string[]> {
        const results: string[] = [];

        for (const request of requests) {
            try {
                const id = await this.sendNotification(request);
                results.push(id);
            } catch (error) {
                console.error("Failed to queue notification:", error);
            }
        }

        return results;
    }

    /** Starts the background queue processor with the provided interval. */
    startProcessing(intervalMs: number = 1000): void {
        if (this.processingInterval) {
            this.stopProcessing();
        }

        this.processingInterval = setInterval(() => {
            this.processQueue();
        }, intervalMs);
    }

    /** Stops the background queue processor if active. */
    stopProcessing(): void {
        if (this.processingInterval) {
            clearInterval(this.processingInterval);
            this.processingInterval = undefined;
        }
    }

    /**
     * Processes queued notifications in priority order.
     */
    async processQueue(): Promise<void> {
        if (this.isProcessing) return;

        this.isProcessing = true;

        try {
            // Process high priority first
            await this.processBatch("urgent", 5);
            await this.processBatch("high", 10);
            await this.processBatch("normal", 15);
            await this.processBatch("low", 20);
        } finally {
            this.isProcessing = false;
        }
    }

    /**
     * Processes a batch of notifications for the given priority tier.
     *
     * @param priority - Priority bucket to target.
     * @param batchSize - Maximum number of notifications to process.
     */
    private async processBatch(
        priority: string,
        batchSize: number
    ): Promise<void> {
        for (let i = 0; i < batchSize; i++) {
            const notification = await this.queue.dequeue(priority);
            if (!notification) break;

            await this.processNotification(notification);
        }
    }

    /**
     * Renders the template and dispatches notifications across channels.
     *
     * @param notification - Queued notification being processed.
     */
    private async processNotification(
        notification: QueuedNotification
    ): Promise<void> {
        try {
            // Render template
            const { subject, body } = await this.templateEngine.render(
                notification.request.templateId,
                notification.request.variables
            );

            // Send to all recipients via all channels
            const receipts: DeliveryReceipt[] = [];

            for (const channelId of notification.request.channelIds) {
                for (const recipient of notification.request.recipients) {
                    const receipt = await this.channelProvider.send(
                        channelId,
                        recipient,
                        subject,
                        body
                    );
                    receipts.push(receipt);
                }
            }

            // Check if all deliveries were successful
            const allSuccessful = receipts.every(
                (r) => r.status === "delivered"
            );

            await this.queue.markComplete(
                notification.id,
                allSuccessful,
                receipts
            );
        } catch (error) {
            await this.queue.markComplete(
                notification.id,
                false,
                [],
                error.message
            );
        }
    }

    /**
     * Retrieves current queue statistics.
     *
     * @returns Snapshot of queue metrics.
     */
    async getQueueStats(): Promise<NotificationStats> {
        return await this.queue.getStats();
    }

    /**
     * Returns the configured delivery channels.
     *
     * @returns List of channel configurations.
     */
    async getChannels(): Promise<NotificationChannel[]> {
        return this.channelProvider.getAllChannels();
    }

    /**
     * Removes old notifications from the queue.
     *
     * @param olderThanDays - Age threshold expressed in days.
     *
     * @returns Number of notifications purged.
     */
    async cleanupOldNotifications(olderThanDays: number = 30): Promise<number> {
        const cutoffDate = new Date(
            Date.now() - olderThanDays * 24 * 60 * 60 * 1000
        );
        return await this.queue.cleanup(cutoffDate);
    }

    /**
     * Returns the number of notifications pending delivery.
     *
     * @returns Pending notification count.
     */
    getPendingCount(): number {
        return this.queue.getPendingCount();
    }

    /**
     * Returns the total queue size.
     *
     * @returns Total queued notification count.
     */
    getQueueSize(): number {
        return this.queue.size();
    }

    /** Clears queue state and stops background processing. */
    reset(): void {
        this.stopProcessing();
        this.queue.clear();
        this.channelProvider.clear();
        this.isProcessing = false;
    }
}

// Helper functions for creating test data
function createSiteDownNotification(siteData: any): NotificationRequest {
    return {
        templateId: "site-down",
        channelIds: ["email-primary", "slack-alerts"],
        recipients: ["admin@example.com", "#alerts"],
        variables: {
            siteName: siteData.name,
            siteUrl: siteData.url,
            timestamp: new Date().toISOString(),
            error: siteData.error || "Connection timeout",
        },
        priority: "high",
        metadata: { siteIdentifier: siteData.id },
    };
}

function createMaintenanceNotification(siteData: any): NotificationRequest {
    return {
        templateId: "maintenance",
        channelIds: ["email-primary", "slack-alerts"],
        recipients: ["team@example.com", "#maintenance"],
        variables: {
            siteName: siteData.name,
            startTime: new Date(Date.now() + 3_600_000).toISOString(), // 1 hour from now
            duration: "2 hours",
        },
        priority: "normal",
        scheduledAt: new Date(Date.now() + 1_800_000), // 30 minutes from now
        metadata: { type: "maintenance", siteIdentifier: siteData.id },
    };
}

function createBulkNotifications(count: number): NotificationRequest[] {
    return Array.from({ length: count }, (_, i) => {
        const siteData = {
            id: `site-${i + 1}`,
            name: `Site ${i + 1}`,
            url: `https://site${i + 1}.example.com`,
            error: i % 5 === 0 ? "DNS resolution failed" : "Connection timeout",
        };

        return i % 3 === 0
            ? createMaintenanceNotification(siteData)
            : createSiteDownNotification(siteData);
    });
}

describe("Notification Service Performance", () => {
    let service: MockNotificationService;

    bench(
        "service initialization",
        () => {
            service = new MockNotificationService();
        },
        { warmupIterations: 10, iterations: 1000 }
    );

    bench(
        "send single notification",
        () => {
            service = new MockNotificationService();
            const siteData = {
                id: "site-1",
                name: "Test Site",
                url: "https://test.com",
            };
            const notification = createSiteDownNotification(siteData);
            service.sendNotification(notification);
        },
        { warmupIterations: 10, iterations: 2000 }
    );

    bench(
        "queue notification",
        () => {
            service = new MockNotificationService();
            const siteData = {
                id: "site-1",
                name: "Test Site",
                url: "https://test.com",
            };
            const notification = createSiteDownNotification(siteData);
            service["queue"].enqueue(notification);
        },
        { warmupIterations: 10, iterations: 3000 }
    );

    bench(
        "process single notification",
        () => {
            service = new MockNotificationService();
            const siteData = {
                id: "site-1",
                name: "Test Site",
                url: "https://test.com",
            };
            const notification = createSiteDownNotification(siteData);

            service["queue"].enqueue(notification).then((id) => {
                service["queue"].dequeue().then((queued) => {
                    if (queued) {
                        service["processNotification"](queued);
                    }
                });
            });
        },
        { warmupIterations: 10, iterations: 1500 }
    );

    bench(
        "template rendering",
        () => {
            service = new MockNotificationService();
            const templateEngine = service["templateEngine"];
            templateEngine.render("site-down", {
                siteName: "Test Site",
                siteUrl: "https://test.com",
                timestamp: new Date().toISOString(),
                error: "Connection timeout",
            });
        },
        { warmupIterations: 10, iterations: 5000 }
    );

    bench(
        "channel delivery",
        () => {
            service = new MockNotificationService();
            const channelProvider = service["channelProvider"];
            channelProvider.send(
                "email-primary",
                "test@example.com",
                "Test Subject",
                "Test message body"
            );
        },
        { warmupIterations: 10, iterations: 4000 }
    );

    bench(
        "bulk notification sending",
        () => {
            service = new MockNotificationService();
            const notifications = createBulkNotifications(20);
            service.sendBulkNotifications(notifications);
        },
        { warmupIterations: 5, iterations: 300 }
    );

    bench(
        "queue processing",
        () => {
            service = new MockNotificationService();
            const notifications = createBulkNotifications(15);

            service.sendBulkNotifications(notifications).then(() => {
                service.processQueue();
            });
        },
        { warmupIterations: 5, iterations: 200 }
    );

    bench(
        "priority queue handling",
        () => {
            service = new MockNotificationService();

            // Create notifications with different priorities
            const urgentNotifications = Array.from({ length: 5 }, (_, i) => ({
                templateId: "site-down",
                channelIds: ["email-primary"],
                recipients: [`urgent${i}@example.com`],
                variables: {
                    siteName: `Urgent Site ${i}`,
                    siteUrl: `https://urgent${i}.com`,
                    timestamp: new Date().toISOString(),
                    error: "Critical error",
                },
                priority: "urgent" as const,
            }));

            const normalNotifications = Array.from({ length: 10 }, (_, i) => ({
                templateId: "maintenance",
                channelIds: ["email-primary"],
                recipients: [`normal${i}@example.com`],
                variables: {
                    siteName: `Normal Site ${i}`,
                    startTime: new Date().toISOString(),
                    duration: "1 hour",
                },
                priority: "normal" as const,
            }));

            const allNotifications = [
                ...urgentNotifications,
                ...normalNotifications,
            ];

            service.sendBulkNotifications(allNotifications).then(() => {
                service.processQueue();
            });
        },
        { warmupIterations: 5, iterations: 150 }
    );

    bench(
        "rate limit checking",
        () => {
            service = new MockNotificationService();
            const channelProvider = service["channelProvider"];

            // Send multiple notifications to test rate limiting
            const sends = Array.from({ length: 15 }, (_, i) =>
                channelProvider.send(
                    "email-primary",
                    `test${i}@example.com`,
                    "Rate Limit Test",
                    "Testing rate limits"
                ));

            Promise.all(sends);
        },
        { warmupIterations: 10, iterations: 500 }
    );

    bench(
        "notification retry logic",
        () => {
            service = new MockNotificationService();
            const queue = service["queue"];

            const failingNotification: NotificationRequest = {
                templateId: "site-down",
                channelIds: ["email-primary"],
                recipients: ["test@example.com"],
                variables: {
                    siteName: "Test Site",
                    siteUrl: "https://test.com",
                    timestamp: new Date().toISOString(),
                    error: "Test error",
                },
                priority: "normal",
            };

            queue.enqueue(failingNotification).then((id) => {
                // Simulate failure
                queue
                    .markComplete(id, false, [], "Simulated failure")
                    .then(() => {
                        // Process retry
                        queue.dequeue();
                    });
            });
        },
        { warmupIterations: 10, iterations: 1000 }
    );

    bench(
        "multi-channel delivery",
        () => {
            service = new MockNotificationService();

            const multiChannelNotification: NotificationRequest = {
                templateId: "site-down",
                channelIds: [
                    "email-primary",
                    "sms-primary",
                    "slack-alerts",
                    "webhook-primary",
                ],
                recipients: [
                    "admin@example.com",
                    "+1234567890",
                    "#alerts",
                    "webhook-endpoint",
                ],
                variables: {
                    siteName: "Critical Site",
                    siteUrl: "https://critical.com",
                    timestamp: new Date().toISOString(),
                    error: "Service unavailable",
                },
                priority: "urgent",
            };

            service.sendNotification(multiChannelNotification).then((id) => {
                service["queue"].dequeue().then((queued) => {
                    if (queued) {
                        service["processNotification"](queued);
                    }
                });
            });
        },
        { warmupIterations: 10, iterations: 800 }
    );

    bench(
        "scheduled notifications",
        () => {
            service = new MockNotificationService();

            const scheduledNotifications = Array.from({ length: 10 }, (
                _,
                i
            ) => ({
                templateId: "maintenance",
                channelIds: ["email-primary"],
                recipients: [`scheduled${i}@example.com`],
                variables: {
                    siteName: `Scheduled Site ${i}`,
                    startTime: new Date().toISOString(),
                    duration: "30 minutes",
                },
                priority: "normal" as const,
                scheduledAt: new Date(Date.now() + i * 60_000), // Schedule every minute
            }));

            service.sendBulkNotifications(scheduledNotifications);
        },
        { warmupIterations: 10, iterations: 500 }
    );

    bench(
        "queue statistics",
        () => {
            service = new MockNotificationService();
            const notifications = createBulkNotifications(25);

            service.sendBulkNotifications(notifications).then(() => {
                service.getQueueStats();
            });
        },
        { warmupIterations: 10, iterations: 800 }
    );

    bench(
        "notification cleanup",
        () => {
            service = new MockNotificationService();
            const notifications = createBulkNotifications(30);

            service.sendBulkNotifications(notifications).then(() => {
                // Process some notifications
                service.processQueue().then(() => {
                    service.cleanupOldNotifications(1); // Cleanup 1-day old
                });
            });
        },
        { warmupIterations: 5, iterations: 300 }
    );

    bench(
        "continuous processing simulation",
        () => {
            service = new MockNotificationService();

            // Add initial batch
            const initialNotifications = createBulkNotifications(20);
            service.sendBulkNotifications(initialNotifications).then(() => {
                // Start processing
                service.startProcessing(100); // Process every 100ms

                // Add more notifications during processing
                setTimeout(() => {
                    const moreNotifications = createBulkNotifications(10);
                    service.sendBulkNotifications(moreNotifications);
                }, 50);

                // Stop processing after a short time
                setTimeout(() => {
                    service.stopProcessing();
                }, 200);
            });
        },
        { warmupIterations: 3, iterations: 50 }
    );

    bench(
        "service reset",
        () => {
            service = new MockNotificationService();
            const notifications = createBulkNotifications(15);

            service.sendBulkNotifications(notifications).then(() => {
                service.startProcessing();
                service.reset();
            });
        },
        { warmupIterations: 10, iterations: 600 }
    );
});

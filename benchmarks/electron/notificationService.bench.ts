/**
 * @module benchmarks/electron/notificationService
 *
 * @file Benchmarks for notification service operations in the Electron main
 *   process.
 *
 *   Tests performance of notification creation, delivery, queuing, rate limiting,
 *   and cross-platform notification handling.
 */

import { bench, describe } from "vitest";

// Define comprehensive interfaces for type safety
interface NotificationRequest {
    id: string;
    title: string;
    body: string;
    icon?: string;
    urgency: "low" | "normal" | "critical";
    category: string;
    actions?: NotificationAction[];
    metadata: Record<string, unknown>;
    timestamp: number;
    expiresAt?: number;
    silent: boolean;
    tag?: string;
}

interface NotificationAction {
    id: string;
    title: string;
    type: "button" | "reply";
    placeholder?: string;
}

interface NotificationDelivery {
    notificationId: string;
    deliveryMethod: string;
    startTime: number;
    endTime: number;
    success: boolean;
    error?: string;
    platformSpecific: Record<string, unknown>;
    userInteraction?: {
        action: string;
        timestamp: number;
        value?: string;
    };
}

interface NotificationQueue {
    priority: number;
    maxSize: number;
    currentSize: number;
    droppedCount: number;
    processingRate: number;
    averageWaitTime: number;
}

interface RateLimitRule {
    category: string;
    maxNotifications: number;
    timeWindow: number; // Milliseconds
    currentCount: number;
    windowStart: number;
    violationCount: number;
}

describe("Notification Service Benchmarks", () => {
    const notificationCategories = [
        "site-status",
        "monitor-alert",
        "system-update",
        "backup-complete",
        "error-occurred",
        "maintenance",
        "security",
        "performance",
        "user-action",
    ];

    const deliveryMethods = [
        "native",
        "in-app",
        "tray",
        "popup",
        "sound",
        "vibration",
    ];
    const platforms = [
        "win32",
        "darwin",
        "linux",
    ];

    // Notification creation and formatting
    bench("notification creation simulation", () => {
        interface CreationTask {
            requestId: string;
            category: string;
            complexity: number;
            creationTime: number;
            validationTime: number;
            formattingTime: number;
            success: boolean;
            warnings: string[];
        }

        const creationTasks: CreationTask[] = [];

        const notificationTemplates = [
            {
                category: "site-status",
                titleTemplates: [
                    "Site {siteName} is {status}",
                    "{siteName} status changed to {status}",
                ],
                bodyTemplates: [
                    "Site {siteName} at {url} is now {status}. Response time: {responseTime}ms",
                    "Status change detected for {siteName}. Previous: {previousStatus}, Current: {status}",
                ],
                urgencyDistribution: { low: 0.2, normal: 0.6, critical: 0.2 },
                iconRequired: true,
                actionsCount: 2,
            },
            {
                category: "monitor-alert",
                titleTemplates: [
                    "Monitor Alert: {monitorName}",
                    "Alert from {monitorName}",
                ],
                bodyTemplates: [
                    "Monitor {monitorName} has detected an issue: {alertMessage}",
                    "Alert threshold exceeded for {monitorName}. Value: {currentValue}, Threshold: {threshold}",
                ],
                urgencyDistribution: { low: 0.1, normal: 0.3, critical: 0.6 },
                iconRequired: true,
                actionsCount: 3,
            },
            {
                category: "system-update",
                titleTemplates: [
                    "System Update Available",
                    "Update Ready: Version {version}",
                ],
                bodyTemplates: [
                    "A new version ({version}) is available for download",
                    "System update is ready to install. Would you like to update now?",
                ],
                urgencyDistribution: { low: 0.7, normal: 0.3, critical: 0 },
                iconRequired: false,
                actionsCount: 2,
            },
            {
                category: "backup-complete",
                titleTemplates: [
                    "Backup Completed",
                    "Backup Finished Successfully",
                ],
                bodyTemplates: [
                    "Backup completed successfully. {fileCount} files backed up to {destination}",
                    "Scheduled backup finished. Size: {backupSize}, Duration: {duration}",
                ],
                urgencyDistribution: { low: 0.8, normal: 0.2, critical: 0 },
                iconRequired: false,
                actionsCount: 1,
            },
        ];

        for (let i = 0; i < 600; i++) {
            const template =
                notificationTemplates[
                    Math.floor(Math.random() * notificationTemplates.length)
                ];
            const titleTemplate =
                template.titleTemplates[
                    Math.floor(Math.random() * template.titleTemplates.length)
                ];
            const bodyTemplate =
                template.bodyTemplates[
                    Math.floor(Math.random() * template.bodyTemplates.length)
                ];

            // Determine urgency based on distribution
            const urgencyRand = Math.random();
            let urgency: "low" | "normal" | "critical";
            if (urgencyRand < template.urgencyDistribution.low) {
                urgency = "low";
            } else if (
                urgencyRand <
                template.urgencyDistribution.low +
                    template.urgencyDistribution.normal
            ) {
                urgency = "normal";
            } else {
                urgency = "critical";
            }

            // Calculate complexity score
            let complexity = 1; // Base complexity
            complexity += titleTemplate.split("{").length - 1; // Template variables
            complexity += bodyTemplate.split("{").length - 1;
            if (template.iconRequired) complexity += 1;
            complexity += template.actionsCount;
            if (urgency === "critical") complexity += 2;

            // Simulate creation timing
            const validationTime = Math.max(
                1,
                complexity * 0.5 + Math.random() * 2
            );
            const formattingTime = Math.max(
                1,
                complexity * 0.8 + Math.random() * 3
            );
            const creationTime =
                validationTime + formattingTime + Math.random() * 5;

            // Simulate validation warnings
            const warnings: string[] = [];
            if (titleTemplate.length > 64)
                warnings.push("Title may be truncated on some platforms");
            if (bodyTemplate.length > 256)
                warnings.push("Body text is quite long");
            if (template.actionsCount > 3)
                warnings.push("Too many actions may not display properly");
            if (urgency === "critical" && Math.random() > 0.9)
                warnings.push("Critical notifications may be rate-limited");

            const creationTask: CreationTask = {
                requestId: `create-${i}`,
                category: template.category,
                complexity,
                creationTime,
                validationTime,
                formattingTime,
                success: Math.random() > 0.01, // 99% success rate
                warnings,
            };

            creationTasks.push(creationTask);
        }

        // Calculate creation metrics
        const successfulCreations = creationTasks.filter((t) => t.success);
        const averageCreationTime =
            creationTasks.reduce((sum, t) => sum + t.creationTime, 0) /
            creationTasks.length;
        const averageComplexity =
            creationTasks.reduce((sum, t) => sum + t.complexity, 0) /
            creationTasks.length;
        const totalWarnings = creationTasks.reduce(
            (sum, t) => sum + t.warnings.length,
            0
        );
    });

    // Notification delivery performance
    bench("notification delivery simulation", () => {
        const notificationDeliveries: NotificationDelivery[] = [];

        const deliveryScenarios = [
            {
                method: "native",
                platforms: [
                    "win32",
                    "darwin",
                    "linux",
                ],
                baseLatency: 50,
                variance: 0.3,
                successRate: 0.97,
                platformOverhead: { win32: 20, darwin: 15, linux: 25 },
            },
            {
                method: "in-app",
                platforms: [
                    "win32",
                    "darwin",
                    "linux",
                ],
                baseLatency: 10,
                variance: 0.2,
                successRate: 0.995,
                platformOverhead: { win32: 2, darwin: 1, linux: 3 },
            },
            {
                method: "tray",
                platforms: [
                    "win32",
                    "darwin",
                    "linux",
                ],
                baseLatency: 30,
                variance: 0.4,
                successRate: 0.98,
                platformOverhead: { win32: 10, darwin: 5, linux: 15 },
            },
            {
                method: "popup",
                platforms: [
                    "win32",
                    "darwin",
                    "linux",
                ],
                baseLatency: 25,
                variance: 0.3,
                successRate: 0.99,
                platformOverhead: { win32: 8, darwin: 5, linux: 12 },
            },
            {
                method: "sound",
                platforms: [
                    "win32",
                    "darwin",
                    "linux",
                ],
                baseLatency: 5,
                variance: 0.5,
                successRate: 0.95,
                platformOverhead: { win32: 3, darwin: 2, linux: 8 },
            },
        ];

        for (let i = 0; i < 800; i++) {
            const scenario =
                deliveryScenarios[
                    Math.floor(Math.random() * deliveryScenarios.length)
                ];
            const platform =
                scenario.platforms[
                    Math.floor(Math.random() * scenario.platforms.length)
                ];

            const startTime = Date.now();

            // Calculate delivery latency
            const variance = (Math.random() - 0.5) * scenario.variance;
            const platformOverhead =
                scenario.platformOverhead[
                    platform as keyof typeof scenario.platformOverhead
                ] || 0;
            const deliveryLatency = Math.max(
                1,
                scenario.baseLatency * (1 + variance) + platformOverhead
            );

            const endTime = startTime + deliveryLatency;

            // Determine success/failure
            const success = Math.random() < scenario.successRate;

            // Simulate platform-specific behavior
            const platformSpecific: Record<string, unknown> = {};

            switch (platform) {
                case "win32": {
                    platformSpecific.useToastNotification =
                        scenario.method === "native";
                    platformSpecific.balloonTimeout =
                        scenario.method === "tray" ? 5000 : undefined;
                    break;
                }
                case "darwin": {
                    platformSpecific.useNotificationCenter =
                        scenario.method === "native";
                    platformSpecific.soundName =
                        scenario.method === "sound" ? "default" : undefined;
                    break;
                }
                case "linux": {
                    platformSpecific.useLibnotify =
                        scenario.method === "native";
                    platformSpecific.urgencyLevel = [
                        "low",
                        "normal",
                        "critical",
                    ][Math.floor(Math.random() * 3)];
                    break;
                }
            }

            // Simulate user interaction (15% interaction rate)
            let userInteraction: NotificationDelivery["userInteraction"];
            if (success && Math.random() < 0.15) {
                const interactionTypes = [
                    "click",
                    "dismiss",
                    "action-1",
                    "action-2",
                ];
                userInteraction = {
                    action: interactionTypes[
                        Math.floor(Math.random() * interactionTypes.length)
                    ],
                    timestamp: endTime + Math.random() * 30_000, // Within 30 seconds
                    value: Math.random() > 0.7 ? "user-response" : undefined,
                };
            }

            const delivery: NotificationDelivery = {
                notificationId: `notification-${i}`,
                deliveryMethod: scenario.method,
                startTime,
                endTime,
                success,
                error: success
                    ? undefined
                    : `${scenario.method} delivery failed on ${platform}`,
                platformSpecific,
                userInteraction,
            };

            notificationDeliveries.push(delivery);
        }

        // Calculate delivery metrics
        const successfulDeliveries = notificationDeliveries.filter(
            (d) => d.success
        );
        const averageDeliveryTime =
            notificationDeliveries.reduce(
                (sum, d) => sum + (d.endTime - d.startTime),
                0
            ) / notificationDeliveries.length;
        const interactionRate =
            notificationDeliveries.filter((d) => d.userInteraction).length /
            notificationDeliveries.length;

        // Platform-specific analysis
        const platformStats = platforms.map((platform) => {
            const platformDeliveries = notificationDeliveries.filter(
                (d) =>
                    d.platformSpecific &&
                    Object.keys(d.platformSpecific).length > 0
            );
            const successfulPlatformDeliveries = platformDeliveries.filter(
                (d) => d.success
            );

            return {
                platform,
                deliveries: platformDeliveries.length,
                successRate:
                    successfulPlatformDeliveries.length /
                    platformDeliveries.length,
                averageLatency:
                    platformDeliveries.reduce(
                        (sum, d) => sum + (d.endTime - d.startTime),
                        0
                    ) / platformDeliveries.length,
            };
        });
    });

    // Notification queue management
    bench("notification queue simulation", () => {
        interface QueuedNotification {
            id: string;
            priority: number;
            queuedAt: number;
            processedAt?: number;
            waitTime?: number;
            category: string;
            urgency: string;
        }

        const queues: NotificationQueue[] = [
            {
                priority: 1,
                maxSize: 50,
                currentSize: 0,
                droppedCount: 0,
                processingRate: 10,
                averageWaitTime: 0,
            },
            {
                priority: 2,
                maxSize: 100,
                currentSize: 0,
                droppedCount: 0,
                processingRate: 5,
                averageWaitTime: 0,
            },
            {
                priority: 3,
                maxSize: 200,
                currentSize: 0,
                droppedCount: 0,
                processingRate: 2,
                averageWaitTime: 0,
            },
        ];

        const queuedNotifications: QueuedNotification[] = [];
        const processedNotifications: QueuedNotification[] = [];

        // Simulate notification arrivals and processing
        for (let i = 0; i < 1000; i++) {
            const category =
                notificationCategories[
                    Math.floor(Math.random() * notificationCategories.length)
                ];
            const urgency = [
                "low",
                "normal",
                "critical",
            ][Math.floor(Math.random() * 3)];

            // Determine priority based on urgency and category
            let priority: number;
            if (urgency === "critical") {
                priority = 1;
            } else if (
                urgency === "normal" ||
                ["site-status", "monitor-alert"].includes(category)
            ) {
                priority = 2;
            } else {
                priority = 3;
            }

            const notification: QueuedNotification = {
                id: `queued-${i}`,
                priority,
                queuedAt: Date.now() + i * 100, // Stagger arrivals
                category,
                urgency,
            };

            // Find appropriate queue
            const queue = queues.find((q) => q.priority === priority);
            if (!queue) continue;

            // Check if queue has space
            if (queue.currentSize < queue.maxSize) {
                queue.currentSize++;
                queuedNotifications.push(notification);
            } else {
                // Drop notification due to queue overflow
                queue.droppedCount++;
            }
        }

        // Simulate queue processing
        let currentTime = Date.now();
        const processInterval = 1000; // Process every second

        for (let cycle = 0; cycle < 100; cycle++) {
            currentTime += processInterval;

            for (const queue of queues) {
                const notificationsToProcess = Math.min(
                    queue.processingRate,
                    queuedNotifications.filter(
                        (n) => n.priority === queue.priority && !n.processedAt
                    ).length
                );

                const candidates = queuedNotifications
                    .filter(
                        (n) => n.priority === queue.priority && !n.processedAt
                    )
                    .toSorted((a, b) => a.queuedAt - b.queuedAt)
                    .slice(0, notificationsToProcess);

                for (const notification of candidates) {
                    notification.processedAt =
                        currentTime + Math.random() * 1000; // Process within the interval
                    notification.waitTime =
                        notification.processedAt - notification.queuedAt;

                    processedNotifications.push(notification);
                    queue.currentSize--;
                }

                // Update queue metrics
                const queueNotifications = queuedNotifications.filter(
                    (n) => n.priority === queue.priority && n.processedAt
                );
                if (queueNotifications.length > 0) {
                    queue.averageWaitTime =
                        queueNotifications.reduce(
                            (sum, n) => sum + (n.waitTime || 0),
                            0
                        ) / queueNotifications.length;
                }
            }
        }

        // Calculate queue performance metrics
        const totalProcessed = processedNotifications.length;
        const totalDropped = queues.reduce((sum, q) => sum + q.droppedCount, 0);
        const averageWaitTime =
            processedNotifications.reduce(
                (sum, n) => sum + (n.waitTime || 0),
                0
            ) / totalProcessed;

        const queueStats = queues.map((queue) => ({
            priority: queue.priority,
            processed: processedNotifications.filter(
                (n) => n.priority === queue.priority
            ).length,
            dropped: queue.droppedCount,
            averageWaitTime: queue.averageWaitTime,
            efficiency:
                queue.droppedCount === 0
                    ? 1
                    : processedNotifications.filter(
                          (n) => n.priority === queue.priority
                      ).length /
                      (processedNotifications.filter(
                          (n) => n.priority === queue.priority
                      ).length +
                          queue.droppedCount),
        }));
    });

    // Rate limiting simulation
    bench("rate limiting simulation", () => {
        const rateLimitRules: RateLimitRule[] = [
            {
                category: "site-status",
                maxNotifications: 10,
                timeWindow: 60_000, // 1 minute
                currentCount: 0,
                windowStart: Date.now(),
                violationCount: 0,
            },
            {
                category: "monitor-alert",
                maxNotifications: 5,
                timeWindow: 60_000, // 1 minute
                currentCount: 0,
                windowStart: Date.now(),
                violationCount: 0,
            },
            {
                category: "system-update",
                maxNotifications: 1,
                timeWindow: 3_600_000, // 1 hour
                currentCount: 0,
                windowStart: Date.now(),
                violationCount: 0,
            },
            {
                category: "error-occurred",
                maxNotifications: 20,
                timeWindow: 300_000, // 5 minutes
                currentCount: 0,
                windowStart: Date.now(),
                violationCount: 0,
            },
        ];

        interface RateLimitCheck {
            notificationId: string;
            category: string;
            timestamp: number;
            allowed: boolean;
            reason?: string;
            remainingQuota: number;
            windowResetTime: number;
        }

        const rateLimitChecks: RateLimitCheck[] = [];

        // Simulate notification attempts over time
        for (let i = 0; i < 500; i++) {
            const category =
                notificationCategories[
                    Math.floor(Math.random() * notificationCategories.length)
                ];
            const timestamp = Date.now() + i * 1000; // One per second

            const rule = rateLimitRules.find((r) => r.category === category);

            let allowed = true;
            let reason: string | undefined;
            let remainingQuota = 0;
            let windowResetTime = 0;

            if (rule) {
                // Check if we need to reset the window
                if (timestamp - rule.windowStart >= rule.timeWindow) {
                    rule.currentCount = 0;
                    rule.windowStart = timestamp;
                }

                // Check rate limit
                if (rule.currentCount >= rule.maxNotifications) {
                    allowed = false;
                    reason = `Rate limit exceeded for ${category}: ${rule.currentCount}/${rule.maxNotifications} in ${rule.timeWindow / 1000}s`;
                    rule.violationCount++;
                } else {
                    rule.currentCount++;
                }

                remainingQuota = Math.max(
                    0,
                    rule.maxNotifications - rule.currentCount
                );
                windowResetTime = rule.windowStart + rule.timeWindow;
            }

            const rateLimitCheck: RateLimitCheck = {
                notificationId: `rate-check-${i}`,
                category,
                timestamp,
                allowed,
                reason,
                remainingQuota,
                windowResetTime,
            };

            rateLimitChecks.push(rateLimitCheck);
        }

        // Calculate rate limiting metrics
        const totalChecks = rateLimitChecks.length;
        const allowedNotifications = rateLimitChecks.filter((c) => c.allowed);
        const blockedNotifications = rateLimitChecks.filter((c) => !c.allowed);
        const blockRate = blockedNotifications.length / totalChecks;

        // Category-specific analysis
        const categoryStats = notificationCategories.map((category) => {
            const categoryChecks = rateLimitChecks.filter(
                (c) => c.category === category
            );
            const categoryAllowed = categoryChecks.filter((c) => c.allowed);
            const categoryRule = rateLimitRules.find(
                (r) => r.category === category
            );

            return {
                category,
                totalAttempts: categoryChecks.length,
                allowed: categoryAllowed.length,
                blocked: categoryChecks.length - categoryAllowed.length,
                blockRate:
                    categoryChecks.length > 0
                        ? (categoryChecks.length - categoryAllowed.length) /
                          categoryChecks.length
                        : 0,
                violationCount: categoryRule?.violationCount || 0,
                limit: categoryRule?.maxNotifications || "no limit",
                window: categoryRule?.timeWindow || "no window",
            };
        });
    });

    // Multi-channel notification coordination
    bench("multi-channel coordination simulation", () => {
        interface ChannelDelivery {
            notificationId: string;
            channel: string;
            startTime: number;
            endTime: number;
            success: boolean;
            priority: number;
            fallbackUsed: boolean;
        }

        interface CoordinationStrategy {
            name: string;
            channels: string[];
            fallbackChain: string[];
            timeout: number;
            requireAllChannels: boolean;
        }

        const coordinationStrategies: CoordinationStrategy[] = [
            {
                name: "critical-alert",
                channels: [
                    "native",
                    "in-app",
                    "sound",
                ],
                fallbackChain: ["tray", "popup"],
                timeout: 5000,
                requireAllChannels: true,
            },
            {
                name: "standard-notification",
                channels: ["native"],
                fallbackChain: ["in-app", "tray"],
                timeout: 3000,
                requireAllChannels: false,
            },
            {
                name: "silent-update",
                channels: ["in-app"],
                fallbackChain: ["tray"],
                timeout: 1000,
                requireAllChannels: false,
            },
            {
                name: "emergency-broadcast",
                channels: [
                    "native",
                    "in-app",
                    "tray",
                    "sound",
                    "popup",
                ],
                fallbackChain: [],
                timeout: 10_000,
                requireAllChannels: false,
            },
        ];

        const channelDeliveries: ChannelDelivery[] = [];

        for (let i = 0; i < 200; i++) {
            const strategy =
                coordinationStrategies[
                    Math.floor(Math.random() * coordinationStrategies.length)
                ];
            const notificationId = `multi-channel-${i}`;

            let overallSuccess = false;
            let anyChannelSucceeded = false;
            const deliveryResults: ChannelDelivery[] = [];

            // Try primary channels
            for (let j = 0; j < strategy.channels.length; j++) {
                const channel = strategy.channels[j];
                const startTime = Date.now() + j * 50; // Stagger slightly

                // Simulate channel-specific delivery characteristics
                let successRate: number;
                let baseLatency: number;

                switch (channel) {
                    case "native": {
                        successRate = 0.95;
                        baseLatency = 100;
                        break;
                    }
                    case "in-app": {
                        successRate = 0.98;
                        baseLatency = 20;
                        break;
                    }
                    case "tray": {
                        successRate = 0.92;
                        baseLatency = 80;
                        break;
                    }
                    case "sound": {
                        successRate = 0.88;
                        baseLatency = 30;
                        break;
                    }
                    case "popup": {
                        successRate = 0.96;
                        baseLatency = 60;
                        break;
                    }
                    default: {
                        successRate = 0.9;
                        baseLatency = 50;
                    }
                }

                const latency = baseLatency + Math.random() * 50;
                const success = Math.random() < successRate;
                const endTime = startTime + latency;

                if (success) {
                    anyChannelSucceeded = true;
                }

                const delivery: ChannelDelivery = {
                    notificationId,
                    channel,
                    startTime,
                    endTime,
                    success,
                    priority: j + 1,
                    fallbackUsed: false,
                };

                deliveryResults.push(delivery);
                channelDeliveries.push(delivery);
            }

            // Check if we need fallback
            const needsFallback = strategy.requireAllChannels
                ? !deliveryResults.every((d) => d.success)
                : !anyChannelSucceeded;

            if (needsFallback && strategy.fallbackChain.length > 0) {
                for (const fallbackChannel of strategy.fallbackChain) {
                    const startTime = Date.now() + 200; // Fallback delay
                    const latency = 100 + Math.random() * 100; // Fallback is typically slower
                    const success = Math.random() < 0.85; // Lower success rate for fallback
                    const endTime = startTime + latency;

                    const fallbackDelivery: ChannelDelivery = {
                        notificationId,
                        channel: fallbackChannel,
                        startTime,
                        endTime,
                        success,
                        priority: 999, // Fallback priority
                        fallbackUsed: true,
                    };

                    deliveryResults.push(fallbackDelivery);
                    channelDeliveries.push(fallbackDelivery);

                    if (success) {
                        anyChannelSucceeded = true;
                        break; // Stop trying fallbacks after first success
                    }
                }
            }

            // Determine overall coordination success
            overallSuccess = strategy.requireAllChannels
                ? deliveryResults
                      .filter((d) => !d.fallbackUsed)
                      .every((d) => d.success)
                : anyChannelSucceeded;
        }

        // Calculate coordination metrics
        const notificationGroups = channelDeliveries.reduce(
            (groups, delivery) => {
                if (!groups[delivery.notificationId]) {
                    groups[delivery.notificationId] = [];
                }
                groups[delivery.notificationId].push(delivery);
                return groups;
            },
            {} as Record<string, ChannelDelivery[]>
        );

        const coordinationStats = Object.values(notificationGroups).map(
            (group) => {
                const primaryChannels = group.filter((d) => !d.fallbackUsed);
                const fallbackChannels = group.filter((d) => d.fallbackUsed);
                const anySuccess = group.some((d) => d.success);
                const allPrimarySuccess = primaryChannels.every(
                    (d) => d.success
                );

                return {
                    notificationId: group[0].notificationId,
                    totalChannels: group.length,
                    primaryChannels: primaryChannels.length,
                    fallbackChannels: fallbackChannels.length,
                    anySuccess,
                    allPrimarySuccess,
                    totalLatency:
                        Math.max(...group.map((d) => d.endTime)) -
                        Math.min(...group.map((d) => d.startTime)),
                    fallbackUsed: fallbackChannels.length > 0,
                };
            }
        );

        const overallCoordinationSuccess =
            coordinationStats.filter((s) => s.anySuccess).length /
            coordinationStats.length;
        const fallbackUsageRate =
            coordinationStats.filter((s) => s.fallbackUsed).length /
            coordinationStats.length;
        const averageChannelsPerNotification =
            coordinationStats.reduce((sum, s) => sum + s.totalChannels, 0) /
            coordinationStats.length;
    });
});

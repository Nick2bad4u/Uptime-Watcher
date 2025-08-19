/**
 * Notification System Performance Benchmarks
 *
 * @file Performance benchmarks for notification system operations.
 *
 * @author GitHub Copilot
 * @since 2025-08-19
 * @category Performance
 * @benchmark Monitoring-NotificationSystem
 * @tags ["performance", "monitoring", "notifications", "delivery"]
 */

import { bench, describe } from "vitest";

class MockNotificationSystem {
    private queue: any[] = [];
    private sent: any[] = [];

    async sendNotification(notification: { id: string; type: string; message: string; recipients: string[] }): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, Math.random() * 20));
        this.sent.push({ ...notification, sentAt: Date.now() });
    }

    queueNotification(notification: any): void {
        this.queue.push({ ...notification, queuedAt: Date.now() });
    }

    async processQueue(): Promise<void> {
        while (this.queue.length > 0) {
            const notification = this.queue.shift();
            if (notification) {
                await this.sendNotification(notification);
            }
        }
    }

    async bulkSend(notifications: any[]): Promise<void> {
        const promises = notifications.map(n => this.sendNotification(n));
        await Promise.all(promises);
    }

    getQueueSize(): number {
        return this.queue.length;
    }

    getSentCount(): number {
        return this.sent.length;
    }
}

describe("Notification System Performance", () => {
    let notificationSystem: MockNotificationSystem;

    bench("send single notification", async () => {
        notificationSystem = new MockNotificationSystem();
        await notificationSystem.sendNotification({
            id: 'notif-1',
            type: 'alert',
            message: 'Test notification',
            recipients: ['user1@example.com', 'user2@example.com']
        });
    }, { warmupIterations: 5, iterations: 500 });

    bench("queue notification", () => {
        notificationSystem = new MockNotificationSystem();
        notificationSystem.queueNotification({
            id: 'notif-1',
            type: 'alert',
            message: 'Test notification',
            recipients: ['user1@example.com']
        });
    }, { warmupIterations: 5, iterations: 5000 });

    bench("process queue (10 notifications)", async () => {
        notificationSystem = new MockNotificationSystem();
        for (let i = 0; i < 10; i++) {
            notificationSystem.queueNotification({
                id: `notif-${i}`,
                type: 'alert',
                message: `Notification ${i}`,
                recipients: ['user@example.com']
            });
        }
        await notificationSystem.processQueue();
    }, { warmupIterations: 2, iterations: 100 });

    bench("bulk send (20 notifications)", async () => {
        notificationSystem = new MockNotificationSystem();
        const notifications = Array.from({ length: 20 }, (_, i) => ({
            id: `notif-${i}`,
            type: 'alert',
            message: `Bulk notification ${i}`,
            recipients: ['user@example.com']
        }));
        await notificationSystem.bulkSend(notifications);
    }, { warmupIterations: 2, iterations: 50 });

    bench("get queue size", () => {
        notificationSystem = new MockNotificationSystem();
        for (let i = 0; i < 100; i++) {
            notificationSystem.queueNotification({
                id: `notif-${i}`,
                type: 'alert',
                message: `Notification ${i}`,
                recipients: ['user@example.com']
            });
        }
        notificationSystem.getQueueSize();
    }, { warmupIterations: 5, iterations: 5000 });
});

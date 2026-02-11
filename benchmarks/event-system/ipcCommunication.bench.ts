/**
 * IPC Communication Performance Benchmarks
 *
 * @file Performance benchmarks for IPC communication between main and renderer
 *   processes.
 *
 * @author GitHub Copilot
 *
 * @since 2025-08-19
 *
 * @category Performance
 *
 * @benchmark Event-IpcCommunication
 *
 * @tags ["performance", "ipc", "electron", "communication"]
 */

import { bench, describe } from "vitest";
import type { UnknownRecord } from "type-fest";

interface IpcMessage {
    id: string;
    channel: string;
    data: IpcPayload;
    timestamp: number;
    type: "request" | "response" | "notification";
}

type IpcPayload = unknown;

type IpcHandler = (data: IpcPayload) => unknown | Promise<unknown>;

type SiteStatus = "online" | "offline";

interface SiteRecord {
    id: string;
    name: string;
    url: string;
    status: SiteStatus;
    created?: number;
    updated?: number;
}

interface MonitorRecord {
    id: string;
    siteIdentifier: string;
    type: "http" | "ping" | "tcp";
    interval: number;
    status: "active" | "paused";
}

interface HistoryEntry {
    id: string;
    timestamp: number;
    status: SiteStatus;
    responseTime: number;
}

type CreateSitePayload = Partial<Omit<SiteRecord, "id">> &
    Pick<SiteRecord, "name" | "url">;

type UpdateSitePayload = Partial<Omit<SiteRecord, "id">> &
    Pick<SiteRecord, "id">;

type BatchCreatePayload = CreateSitePayload[];

interface HistoryFilters extends UnknownRecord {
    siteIdentifier?: string;
    limit?: number;
}

interface PendingRequest {
    resolve: (value: unknown) => void;
    reject: (reason: unknown) => void;
    timeout: NodeJS.Timeout;
}

class MockIpcService {
    private handlers = new Map<string, IpcHandler>();
    private pendingRequests = new Map<string, PendingRequest>();
    private messageHistory: IpcMessage[] = [];
    private requestTimeout = 30_000; // 30 seconds

    registerHandler<TPayload = IpcPayload>(
        channel: string,
        handler: (data: TPayload) => unknown | Promise<unknown>
    ): void {
        this.handlers.set(channel, (payload) => handler(payload as TPayload));
    }

    async invoke(channel: string, data: IpcPayload): Promise<unknown> {
        const messageId = this.generateMessageId();
        const message: IpcMessage = {
            id: messageId,
            channel,
            data,
            timestamp: Date.now(),
            type: "request",
        };

        this.logMessage(message);

        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                this.pendingRequests.delete(messageId);
                reject(
                    new Error(`IPC request timeout for channel: ${channel}`)
                );
            }, this.requestTimeout);

            this.pendingRequests.set(messageId, { resolve, reject, timeout });

            // Simulate async processing
            setTimeout(() => {
                const handler = this.handlers.get(channel);
                if (handler) {
                    Promise.resolve(handler(data))
                        .then((result) => {
                            this.handleResponse(messageId, result);
                        })
                        .catch((error) => {
                            this.handleError(messageId, error);
                        });
                } else {
                    this.handleError(
                        messageId,
                        new Error(`No handler for channel: ${channel}`)
                    );
                }
            }, Math.random() * 10);
        });
    }

    send(channel: string, data: IpcPayload): void {
        const message: IpcMessage = {
            id: this.generateMessageId(),
            channel,
            data,
            timestamp: Date.now(),
            type: "notification",
        };

        this.logMessage(message);

        // Simulate sending to renderer
        setTimeout(() => {
            const handler = this.handlers.get(channel);
            handler?.(data);
        }, 1);
    }

    private handleResponse(messageId: string, result: unknown): void {
        const pending = this.pendingRequests.get(messageId);
        if (pending) {
            clearTimeout(pending.timeout);
            this.pendingRequests.delete(messageId);

            const responseMessage: IpcMessage = {
                id: this.generateMessageId(),
                channel: "response",
                data: result,
                timestamp: Date.now(),
                type: "response",
            };
            this.logMessage(responseMessage);

            pending.resolve(result);
        }
    }

    private handleError(messageId: string, error: unknown): void {
        const pending = this.pendingRequests.get(messageId);
        if (pending) {
            clearTimeout(pending.timeout);
            this.pendingRequests.delete(messageId);
            pending.reject(error);
        }
    }

    private generateMessageId(): string {
        return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    }

    private logMessage(message: IpcMessage): void {
        this.messageHistory.push(message);
        if (this.messageHistory.length > 1000) {
            this.messageHistory.shift();
        }
    }

    // Simulated handlers for common IPC operations
    handleGetSites(): SiteRecord[] {
        return Array.from({ length: 100 }, (_, i) => ({
            id: `site-${i}`,
            name: `Site ${i}`,
            url: `https://site${i}.com`,
            status: ["online", "offline"][i % 2] as SiteStatus,
        }));
    }

    handleCreateSite(data: CreateSitePayload): SiteRecord {
        const status: SiteStatus = data.status ?? "online";
        return {
            id: `site-${Date.now()}`,
            ...data,
            created: Date.now(),
            status,
        };
    }

    handleUpdateSite(data: UpdateSitePayload): SiteRecord {
        const nextStatus: SiteStatus = data.status ?? "online";
        return {
            id: data.id,
            name: data.name ?? `Site ${data.id}`,
            url: data.url ?? "https://site-update.com",
            status: nextStatus,
            updated: Date.now(),
        };
    }

    handleDeleteSite(siteIdentifier: string): boolean {
        return true;
    }

    handleGetMonitors(siteIdentifier: string): MonitorRecord[] {
        return Array.from({ length: 10 }, (_, i) => ({
            id: `monitor-${i}`,
            siteIdentifier,
            type: "http",
            interval: 60_000,
            status: "active",
        }));
    }

    handleGetHistory(filters: HistoryFilters): HistoryEntry[] {
        const limit = filters.limit ?? 100;
        return Array.from({ length: limit }, (_, i) => ({
            id: `history-${i}`,
            timestamp: Date.now() - i * 60_000,
            status: ["online", "offline"][i % 2] as SiteStatus,
            responseTime: Math.random() * 1000,
        }));
    }

    getMessageHistory(): IpcMessage[] {
        return Array.from(this.messageHistory);
    }

    getPendingRequestsCount(): number {
        return this.pendingRequests.size;
    }

    clearHistory(): void {
        this.messageHistory = [];
    }
}

describe("IPC Communication Performance", () => {
    let ipcService: MockIpcService;

    bench(
        "ipc service initialization",
        () => {
            ipcService = new MockIpcService();
        },
        { warmupIterations: 10, iterations: 1000 }
    );

    bench(
        "register handler",
        () => {
            ipcService = new MockIpcService();
            ipcService.registerHandler("test-channel", () => "response");
        },
        { warmupIterations: 10, iterations: 5000 }
    );

    bench(
        "send notification",
        () => {
            ipcService = new MockIpcService();
            ipcService.registerHandler("notification", () => {});
            ipcService.send("notification", { message: "test" });
        },
        { warmupIterations: 10, iterations: 2000 }
    );

    bench(
        "invoke simple request",
        async () => {
            ipcService = new MockIpcService();
            ipcService.registerHandler(
                "simple-request",
                () => "simple-response"
            );
            await ipcService.invoke("simple-request", { data: "test" });
        },
        { warmupIterations: 5, iterations: 500 }
    );

    bench(
        "invoke get sites",
        async () => {
            ipcService = new MockIpcService();
            ipcService.registerHandler(
                "get-sites",
                ipcService.handleGetSites.bind(ipcService)
            );
            await ipcService.invoke("get-sites", {});
        },
        { warmupIterations: 5, iterations: 300 }
    );

    bench(
        "invoke create site",
        async () => {
            ipcService = new MockIpcService();
            ipcService.registerHandler(
                "create-site",
                ipcService.handleCreateSite.bind(ipcService)
            );
            await ipcService.invoke("create-site", {
                name: "Test Site",
                url: "https://test.com",
                type: "http",
            });
        },
        { warmupIterations: 5, iterations: 500 }
    );

    bench(
        "invoke get monitors",
        async () => {
            ipcService = new MockIpcService();
            ipcService.registerHandler(
                "get-monitors",
                ipcService.handleGetMonitors.bind(ipcService)
            );
            await ipcService.invoke("get-monitors", "site-1");
        },
        { warmupIterations: 5, iterations: 500 }
    );

    bench(
        "invoke get history",
        async () => {
            ipcService = new MockIpcService();
            ipcService.registerHandler(
                "get-history",
                ipcService.handleGetHistory.bind(ipcService)
            );
            await ipcService.invoke("get-history", {
                siteIdentifier: "site-1",
                timeRange: 24 * 60 * 60 * 1000,
            });
        },
        { warmupIterations: 5, iterations: 200 }
    );

    bench(
        "concurrent requests",
        async () => {
            ipcService = new MockIpcService();
            ipcService.registerHandler("concurrent-test", () => "response");

            const promises: Promise<unknown>[] = [];
            for (let i = 0; i < 10; i++) {
                promises.push(
                    ipcService.invoke("concurrent-test", { index: i })
                );
            }

            await Promise.all(promises);
        },
        { warmupIterations: 5, iterations: 100 }
    );

    bench(
        "batch operations",
        async () => {
            ipcService = new MockIpcService();
            ipcService.registerHandler("batch-create", (data): SiteRecord[] => {
                const payload = Array.isArray(data)
                    ? (data as BatchCreatePayload)
                    : [];
                return payload.map((item) => ({
                    ...item,
                    id: `item-${Date.now()}`,
                    status: (item.status ?? "online") as SiteStatus,
                }));
            });

            const batchData: BatchCreatePayload = Array.from(
                { length: 50 },
                (_, i) => ({
                    name: `Item ${i}`,
                    url: `https://item-${i}.example.com`,
                })
            );

            await ipcService.invoke("batch-create", batchData);
        },
        { warmupIterations: 5, iterations: 100 }
    );

    bench(
        "message history management",
        () => {
            ipcService = new MockIpcService();
            ipcService.registerHandler("history-test", () => "response");

            // Generate messages to test history management
            for (let i = 0; i < 1200; i++) {
                ipcService.send("history-test", { index: i });
            }

            ipcService.getMessageHistory();
            ipcService.clearHistory();
        },
        { warmupIterations: 5, iterations: 50 }
    );
});

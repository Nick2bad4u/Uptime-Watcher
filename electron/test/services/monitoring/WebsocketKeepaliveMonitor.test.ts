/* eslint-disable unicorn/prefer-event-target */
/**
 * Unit tests for the WebSocket keepalive monitor service.
 */

import type { EventEmitter as NodeEventEmitter } from "node:events";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Site } from "@shared/types";

const socketReadyState = {
    CONNECTING: 0,
    OPEN: 1,
    CLOSING: 2,
    CLOSED: 3,
} as const;

interface CapturedWebSocket extends NodeEventEmitter {
    readyState: number;
    ping: ReturnType<typeof vi.fn>;
    close: ReturnType<typeof vi.fn>;
    terminate: ReturnType<typeof vi.fn>;
}

const socketInstances: CapturedWebSocket[] = [];

vi.mock("ws", async () => {
    const { EventEmitter } = await import("node:events");

    class LocalWebSocket extends EventEmitter {
        public static readonly CONNECTING = 0;

        public static readonly OPEN = 1;

        public static readonly CLOSING = 2;

        public static readonly CLOSED = 3;

        public readonly url: string;
        public readyState: number = LocalWebSocket.CONNECTING;

        public constructor(url: string) {
            super();
            this.url = url;
        }

        public readonly ping = vi.fn();

        public readonly close = vi.fn(() => {
            this.readyState = LocalWebSocket.CLOSING;
        });

        public readonly terminate = vi.fn(() => {
            this.readyState = LocalWebSocket.CLOSED;
        });
    }

    class CapturingWebSocket extends LocalWebSocket {
        public constructor(url: string, _options?: unknown) {
            super(url);
            socketInstances.push(this as CapturedWebSocket);
        }
    }

    return {
        __esModule: true as const,
        default: CapturingWebSocket,
        WebSocket: CapturingWebSocket,
    };
});

vi.mock("../../../utils/operationalHooks", () => ({
    withOperationalHooks: vi.fn(async (operation: () => Promise<unknown>) =>
        operation()
    ),
}));

import { WebsocketKeepaliveMonitor } from "../../../services/monitoring/WebsocketKeepaliveMonitor";

function createMonitor(
    overrides: Partial<Site["monitors"][0]> = {}
): Site["monitors"][0] {
    return {
        activeOperations: [],
        checkInterval: 60_000,
        history: [],
        id: "websocket-monitor-1",
        maxPongDelayMs: 200,
        monitoring: true,
        responseTime: 0,
        retryAttempts: 0,
        status: "pending",
        timeout: 5000,
        type: "websocket-keepalive",
        url: "ws://example.com/socket",
        ...overrides,
    } as Site["monitors"][0];
}

describe("WebsocketKeepaliveMonitor service", () => {
    let service: WebsocketKeepaliveMonitor;

    beforeEach(() => {
        vi.clearAllMocks();
        socketInstances.length = 0;
        service = new WebsocketKeepaliveMonitor();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("returns up when a pong is received within the allowed window", async () => {
        const monitor = createMonitor();
        const checkPromise = service.check(monitor);
        const socket = socketInstances.at(-1);
        expect(socket).toBeDefined();

        socket!.readyState = socketReadyState.OPEN;
        socket!.emit("open");
        socket!.emit("pong");

        const result = await checkPromise;
        expect(result.status).toBe("up");
        expect(result.details).toContain("responded");
    });

    it("returns degraded when the pong timeout elapses", async () => {
        vi.useFakeTimers();
        const monitor = createMonitor({ maxPongDelayMs: 150 });
        const checkPromise = service.check(monitor);
        const socket = socketInstances.at(-1);
        expect(socket).toBeDefined();

        socket!.readyState = socketReadyState.OPEN;
        socket!.emit("open");

        await vi.advanceTimersByTimeAsync(160);

        const result = await checkPromise;
        expect(result.status).toBe("degraded");
        expect(result.error).toContain("No pong");
    });

    it("returns down when the connection closes", async () => {
        const monitor = createMonitor();
        const checkPromise = service.check(monitor);
        const socket = socketInstances.at(-1);
        expect(socket).toBeDefined();

        socket!.readyState = socketReadyState.OPEN;
        socket!.emit("open");
        socket!.emit("close", 1000, Buffer.from("reason"));

        const result = await checkPromise;
        expect(result.status).toBe("down");
        expect(result.error).toContain("Connection closed");
    });

    it("returns error when the URL is invalid", async () => {
        const monitor = createMonitor({ url: "invalid" });
        const result = await service.check(monitor);
        expect(result.status).toBe("down");
        expect(result.error).toContain("valid ws:// or wss:// URL");
    });

    it("returns down when the socket emits an error", async () => {
        const monitor = createMonitor();
        const checkPromise = service.check(monitor);
        const socket = socketInstances.at(-1);
        expect(socket).toBeDefined();

        socket!.emit("error", new Error("handshake failed"));

        const result = await checkPromise;
        expect(result.status).toBe("down");
        expect(result.details).toContain("handshake failed");
    });

    it("does not create a socket when the AbortSignal is already aborted", async () => {
        const monitor = createMonitor();
        const controller = new AbortController();
        controller.abort();

        const result = await service.check(monitor, controller.signal);

        expect(socketInstances).toHaveLength(0);
        expect(result.status).toBe("down");
        expect(result.details ?? result.error).toContain("canceled");
    });

    it("terminates the socket when aborted during the check", async () => {
        const monitor = createMonitor();
        const controller = new AbortController();

        const checkPromise = service.check(monitor, controller.signal);
        const socket = socketInstances.at(-1);
        expect(socket).toBeDefined();

        socket!.readyState = socketReadyState.OPEN;
        socket!.emit("open");

        controller.abort();

        const result = await checkPromise;
        expect(result.status).toBe("down");
        expect(result.details ?? result.error).toContain("canceled");
        expect(socket!.terminate).toHaveBeenCalled();
    });
});

/* eslint-enable unicorn/prefer-event-target */

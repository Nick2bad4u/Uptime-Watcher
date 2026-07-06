/* eslint-disable unicorn/prefer-event-target */
/**
 * Comprehensive unit tests for the SSL monitor implementation.
 */

import type { Site } from "@shared/types";
import type { PeerCertificate } from "node:tls";

import { EventEmitter } from "node:events";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
    createMonitorConfig,
    createMonitorErrorResult,
    validateMonitorHostAndPort,
} from "../../../services/monitoring/shared/monitorServiceHelpers";
import { SslMonitor } from "../../../services/monitoring/SslMonitor";

vi.mock("../../../services/monitoring/shared/monitorServiceHelpers", () => ({
    createMonitorConfig: vi.fn(),
    createMonitorErrorResult: vi.fn(),
    validateMonitorHostAndPort: vi.fn(),
}));

const connectMock = vi.fn();
vi.mock("node:tls", () => ({
    __esModule: true,
    default: {
        connect: (...args: unknown[]) => connectMock(...args),
    },
    connect: (...args: unknown[]) => connectMock(...args),
}));

class MockTlsSocket extends EventEmitter {
    public authorized: boolean;

    public authorizationError?: Error | string;

    private readonly certificate: PeerCertificate;
    public destroyed = false;

    public readonly setTimeout = vi.fn(
        (_timeout: number, _handler?: () => void) => this
    );

    public readonly end = vi.fn(() => this);

    public readonly destroy = vi.fn(() => {
        this.destroyed = true;
        return this;
    });

    public constructor(
        certificate: PeerCertificate,
        options: {
            authorizationError?: Error | string;
            authorized?: boolean;
        } = {}
    ) {
        super();
        this.certificate = certificate;
        this.authorized = options.authorized ?? true;
        if (options.authorizationError !== undefined) {
            this.authorizationError = options.authorizationError;
        }
    }

    public getPeerCertificate(): PeerCertificate {
        return this.certificate;
    }
}

function createCertificate(
    validTo: Date,
    subject: Partial<PeerCertificate["subject"]> = {}
): PeerCertificate {
    return {
        issuer: { CN: "Test CA" },
        issuerCertificate: undefined as unknown as PeerCertificate,
        raw: Buffer.alloc(0),
        serialNumber: "00",
        subject: {
            CN: "example.com",
            ...subject,
        },
        subjectaltname: undefined,
        valid_from: new Date(validTo.getTime() - 30 * 86_400_000).toUTCString(),
        valid_to: validTo.toUTCString(),
    } as unknown as PeerCertificate;
}

function mockSuccessfulHandshake(
    certificate: PeerCertificate,
    overrides: {
        authorizationError?: Error | string;
        authorized?: boolean;
    } = {}
): void {
    connectMock.mockImplementation(() => {
        const socket = new MockTlsSocket(certificate, overrides);
        setImmediate(() => {
            socket.emit("secureConnect");
        });
        return socket;
    });
}

function mockHandshakeError(error: Error): void {
    connectMock.mockImplementation(() => {
        const socket = new MockTlsSocket(
            createCertificate(new Date(Date.now() + 60 * 86_400_000))
        );
        setImmediate(() => {
            socket.emit("error", error);
        });
        return socket;
    });
}

describe("SslMonitor service", () => {
    let sslMonitor: SslMonitor;
    let monitor: Site["monitors"][0];

    beforeEach(() => {
        connectMock.mockReset();
        vi.clearAllMocks();

        monitor = {
            id: "ssl-monitor-1",
            type: "ssl",
            host: "example.com",
            port: 443,
            certificateWarningDays: 30,
            checkInterval: 30_000,
            timeout: 10_000,
            retryAttempts: 0,
            monitoring: true,
            status: "pending",
            responseTime: 0,
            history: [],
        };

        vi.mocked(validateMonitorHostAndPort).mockReturnValue(null);
        vi.mocked(createMonitorConfig).mockReturnValue({
            retryAttempts: 0,
            timeout: 5000,
            checkInterval: 30_000,
        });
        vi.mocked(createMonitorErrorResult).mockImplementation(
            (message: string, responseTime = 0) => ({
                error: message,
                responseTime,
                status: "down",
            })
        );

        sslMonitor = new SslMonitor();
    });

    it("marks certificates as up when validity window is healthy", async () => {
        const certificate = createCertificate(
            new Date(Date.now() + 120 * 86_400_000)
        );
        mockSuccessfulHandshake(certificate);

        const result = await sslMonitor.check(monitor);

        expect(result.status).toBe("up");
        expect(result.details).toContain("valid until");
        expect(createMonitorErrorResult).not.toHaveBeenCalled();
    });

    it("trims certificate subjects in result details", async () => {
        const certificate = createCertificate(
            new Date(Date.now() + 120 * 86_400_000),
            {
                CN: "   uptime.example.com   ",
            }
        );
        mockSuccessfulHandshake(certificate);

        const result = await sslMonitor.check(monitor);

        expect(result.details).toContain("Certificate for uptime.example.com");
        expect(result.details).not.toContain("   uptime.example.com   ");
    });

    it("marks certificates as degraded when approaching expiry", async () => {
        const certificate = createCertificate(
            new Date(Date.now() + 5 * 86_400_000)
        );
        mockSuccessfulHandshake(certificate);

        const result = await sslMonitor.check(monitor);

        expect(result.status).toBe("degraded");
        expect(result.details).toContain("expires in");
    });

    it("marks certificates as down when expired", async () => {
        const certificate = createCertificate(
            new Date(Date.now() - 2 * 86_400_000)
        );
        mockSuccessfulHandshake(certificate);

        const result = await sslMonitor.check(monitor);

        expect(result.status).toBe("down");
        expect(result.details).toContain("expired");
        expect(result.details?.toLowerCase()).toContain("certificate");
    });

    it("uses error result when handshake fails", async () => {
        const error = new Error("ECONNRESET");
        mockHandshakeError(error);

        const result = await sslMonitor.check(monitor);

        expect(createMonitorErrorResult).toHaveBeenCalledWith(
            "ECONNRESET",
            expect.any(Number)
        );
        expect(result.status).toBe("down");
    });

    it("retries failed handshakes before returning a successful result", async () => {
        const certificate = createCertificate(
            new Date(Date.now() + 120 * 86_400_000)
        );
        let attempt = 0;
        connectMock.mockImplementation(() => {
            attempt += 1;
            const socket = new MockTlsSocket(certificate);
            setImmediate(() => {
                if (attempt < 3) {
                    socket.emit("error", new Error(`ECONNRESET ${attempt}`));
                    return;
                }

                socket.emit("secureConnect");
            });
            return socket;
        });
        vi.mocked(createMonitorConfig).mockReturnValue({
            retryAttempts: 2,
            timeout: 5000,
            checkInterval: 30_000,
        });

        const result = await sslMonitor.check({
            ...monitor,
            retryAttempts: 2,
        });

        expect(result.status).toBe("up");
        expect(result.details).toContain("valid until");
        expect(connectMock).toHaveBeenCalledTimes(3);
        expect(createMonitorErrorResult).not.toHaveBeenCalled();
    });

    it("reports request cancellation when an in-flight handshake is aborted", async () => {
        let socket: MockTlsSocket | undefined;
        connectMock.mockImplementation(() => {
            socket = new MockTlsSocket(
                createCertificate(new Date(Date.now() + 60 * 86_400_000))
            );
            return socket;
        });
        const abortController = new AbortController();

        const resultPromise = sslMonitor.check(
            {
                ...monitor,
                retryAttempts: 2,
            },
            abortController.signal
        );

        expect(socket).toBeDefined();
        abortController.abort("Monitor cancelled");

        const result = await resultPromise;

        expect(createMonitorErrorResult).toHaveBeenCalledWith(
            "Request canceled",
            0
        );
        expect(result.status).toBe("down");
        expect(result.error).toBe("Request canceled");
        expect(connectMock).toHaveBeenCalledTimes(1);
        expect(socket?.destroy).toHaveBeenCalledTimes(1);
    });

    it("treats unauthorized certificates as failure", async () => {
        const certificate = createCertificate(
            new Date(Date.now() + 60 * 86_400_000)
        );
        mockSuccessfulHandshake(certificate, {
            authorized: false,
            authorizationError: new Error("self signed certificate"),
        });

        const result = await sslMonitor.check(monitor);

        expect(createMonitorErrorResult).toHaveBeenCalledWith(
            "TLS authorization failed: self signed certificate",
            expect.any(Number)
        );
        expect(result.status).toBe("down");
    });

    it("defaults warning threshold when undefined", async () => {
        const certificate = createCertificate(
            new Date(Date.now() + 10 * 86_400_000)
        );
        mockSuccessfulHandshake(certificate);

        const monitorWithoutWarning = {
            ...monitor,
        };
        delete (monitorWithoutWarning as Partial<typeof monitor>)
            .certificateWarningDays;

        const result = await sslMonitor.check(monitorWithoutWarning);

        expect(result.status).toBe("degraded");
    });
});

/* eslint-enable unicorn/prefer-event-target */

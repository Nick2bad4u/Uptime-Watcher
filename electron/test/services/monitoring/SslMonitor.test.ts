/* eslint-disable unicorn/prefer-event-target */
/**
 * Comprehensive unit tests for the SSL monitor implementation.
 */

import { EventEmitter } from "node:events";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Site } from "@shared/types";

vi.mock("../../../services/monitoring/shared/monitorServiceHelpers", () => ({
    createMonitorErrorResult: vi.fn(),
    extractMonitorConfig: vi.fn(),
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

import type { PeerCertificate } from "node:tls";

import { SslMonitor } from "../../../services/monitoring/SslMonitor";
import {
    createMonitorErrorResult,
    extractMonitorConfig,
    validateMonitorHostAndPort,
} from "../../../services/monitoring/shared/monitorServiceHelpers";

class MockTlsSocket extends EventEmitter {
    public authorized: boolean;

    public authorizationError?: Error | string;

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
        private readonly certificate: PeerCertificate,
        options: {
            authorized?: boolean;
            authorizationError?: Error | string;
        } = {}
    ) {
        super();
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
        authorized?: boolean;
        authorizationError?: Error | string;
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
        } as Site["monitors"][0];

        vi.mocked(validateMonitorHostAndPort).mockReturnValue(null);
        vi.mocked(extractMonitorConfig).mockReturnValue({
            retryAttempts: 0,
            timeout: 5000,
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

        const result = await sslMonitor.check(
            monitorWithoutWarning as Site["monitors"][0]
        );

        expect(result.status).toBe("degraded");
    });
});

/* eslint-enable unicorn/prefer-event-target */

import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Monitor } from "@shared/types";

vi.mock("@shared/utils/abortUtils", async () => {
    const actual = await vi.importActual<
        typeof import("@shared/utils/abortUtils")
    >("@shared/utils/abortUtils");

    return {
        ...actual,
        sleepUnref: vi.fn().mockResolvedValue(undefined),
    };
});

// Use a simpler mock approach
vi.mock("node:dns/promises", () => ({
    resolve4: vi.fn(() => Promise.resolve(["192.168.1.1"])),
    resolve6: vi.fn(() => Promise.resolve(["2001:db8::1"])),
    resolveCname: vi.fn(() => Promise.resolve(["canonical.example.com"])),
    resolveMx: vi.fn(() =>
        Promise.resolve([{ exchange: "mail.example.com", priority: 10 }])
    ),
    resolveTxt: vi.fn(() =>
        Promise.resolve([["v=spf1 include:_spf.example.com ~all"]])
    ),
    resolveNs: vi.fn(() => Promise.resolve(["ns1.example.com"])),
    resolveSrv: vi.fn(() =>
        Promise.resolve([
            {
                name: "service.example.com",
                port: 443,
                priority: 10,
                weight: 5,
            },
        ])
    ),
    resolvePtr: vi.fn(() => Promise.resolve(["example.com"])),
    resolveSoa: vi.fn(() =>
        Promise.resolve({
            nsname: "ns1.example.com",
            hostmaster: "admin.example.com",
            serial: 2_023_010_101,
            refresh: 86_400,
            retry: 7200,
            expire: 3_600_000,
            minttl: 300,
        })
    ),
    resolveAny: vi.fn(() =>
        Promise.resolve([{ type: "A", address: "192.168.1.1", ttl: 300 }])
    ),
    resolveTlsa: vi.fn(() =>
        Promise.resolve([
            {
                usage: 3,
                selector: 1,
                matchingType: 1,
                certificate: "abc123",
            },
        ])
    ),
    resolveCaa: vi.fn(() =>
        Promise.resolve([{ critical: 0, issue: "letsencrypt.org" }])
    ),
    resolveNaptr: vi.fn(() =>
        Promise.resolve([
            {
                flags: "u",
                order: 100,
                preference: 10,
                regexp: "",
                replacement: "",
                service: "sip+d2u",
            },
        ])
    ),
}));

// Import after mocking
import { DnsMonitor } from "../services/monitoring/DnsMonitor";

import { sleepUnref } from "@shared/utils/abortUtils";
import { resolve4 } from "node:dns/promises";

function createTestMonitor(overrides: Partial<Monitor> = {}): Monitor {
    return {
        id: "test-dns",
        type: "dns",
        host: "example.com",
        recordType: "A",
        monitoring: true,
        status: "pending",
        responseTime: -1,
        history: [],
        checkInterval: 60_000,
        retryAttempts: 3,
        timeout: 30_000,
        ...overrides,
    };
}

describe(DnsMonitor, () => {
    let dnsMonitor: DnsMonitor;

    beforeEach(() => {
        dnsMonitor = new DnsMonitor();
        vi.clearAllMocks();
    });

    it("should create DnsMonitor instance", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: DnsMonitor", "component");
        await annotate("Category: Core", "category");
        await annotate("Type: Constructor", "type");

        expect(dnsMonitor).toBeInstanceOf(DnsMonitor);
    });

    it("retries transient DNS resolver failures", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: DnsMonitor", "component");
        await annotate("Category: Core", "category");
        await annotate("Type: Reliability", "type");

        const resolve4Mock = vi.mocked(resolve4);
        resolve4Mock
            .mockRejectedValueOnce(new Error("temporary dns failure"))
            .mockRejectedValueOnce(new Error("temporary dns failure"))
            .mockResolvedValueOnce(["192.168.1.1"]);

        const sleepUnrefMock = vi.mocked(sleepUnref);
        sleepUnrefMock.mockClear();

        const monitor = createTestMonitor({
            recordType: "A",
            retryAttempts: 2,
        });
        const result = await dnsMonitor.check(monitor);

        expect(result.status).toBe("up");
        expect(resolve4Mock).toHaveBeenCalledTimes(3);
        expect(sleepUnrefMock).toHaveBeenCalledTimes(2);
        // First retry delay should be the initial backoff delay.
        expect(sleepUnrefMock).toHaveBeenNthCalledWith(1, 500, undefined);
    });

    it("should check A record successfully", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: DnsMonitor", "component");
        await annotate("Category: Core", "category");
        await annotate("Type: Business Logic", "type");

        const monitor = createTestMonitor({ recordType: "A" });
        const result = await dnsMonitor.check(monitor);
        expect(result.status).toBe("up");
        expect(typeof result.responseTime).toBe("number");
        expect(result.details).toContain("A records");
    });

    it("should check AAAA record successfully", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: DnsMonitor", "component");
        await annotate("Category: Core", "category");
        await annotate("Type: Business Logic", "type");

        const monitor = createTestMonitor({ recordType: "AAAA" });
        const result = await dnsMonitor.check(monitor);
        expect(result.status).toBe("up");
        expect(result.details).toContain("AAAA records");
    });

    it("should check CNAME record successfully", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: DnsMonitor", "component");
        await annotate("Category: Core", "category");
        await annotate("Type: Business Logic", "type");

        const monitor = createTestMonitor({ recordType: "CNAME" });
        const result = await dnsMonitor.check(monitor);
        expect(result.status).toBe("up");
        expect(result.details).toContain("CNAME record"); // Changed from 'CNAME records' to 'CNAME record'
    });

    it("should check MX record successfully", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: DnsMonitor", "component");
        await annotate("Category: Core", "category");
        await annotate("Type: Business Logic", "type");

        const monitor = createTestMonitor({ recordType: "MX" });
        const result = await dnsMonitor.check(monitor);
        expect(result.status).toBe("up");
        expect(result.details).toContain("MX records");
    });

    it("should check TXT record successfully", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: DnsMonitor", "component");
        await annotate("Category: Core", "category");
        await annotate("Type: Business Logic", "type");

        const monitor = createTestMonitor({ recordType: "TXT" });
        const result = await dnsMonitor.check(monitor);
        expect(result.status).toBe("up");
        expect(result.details).toContain("TXT records");
    });

    it("should check NS record successfully", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: DnsMonitor", "component");
        await annotate("Category: Core", "category");
        await annotate("Type: Business Logic", "type");

        const monitor = createTestMonitor({ recordType: "NS" });
        const result = await dnsMonitor.check(monitor);
        expect(result.status).toBe("up");
        expect(result.details).toContain("NS records");
    });

    it("should check SRV record successfully", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: DnsMonitor", "component");
        await annotate("Category: Core", "category");
        await annotate("Type: Business Logic", "type");

        const monitor = createTestMonitor({ recordType: "SRV" });
        const result = await dnsMonitor.check(monitor);
        expect(result.status).toBe("up");
        expect(result.details).toContain("SRV records");
    });

    it("should check PTR record successfully", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: DnsMonitor", "component");
        await annotate("Category: Core", "category");
        await annotate("Type: Business Logic", "type");

        const monitor = createTestMonitor({ recordType: "PTR" });
        const result = await dnsMonitor.check(monitor);
        expect(result.status).toBe("up");
        expect(result.details).toContain("PTR records");
    });

    it("should check SOA record successfully", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: DnsMonitor", "component");
        await annotate("Category: Core", "category");
        await annotate("Type: Business Logic", "type");

        const monitor = createTestMonitor({ recordType: "SOA" });
        const result = await dnsMonitor.check(monitor);
        expect(result.status).toBe("up");
        expect(result.details).toContain("SOA:"); // Changed from 'SOA record' to 'SOA:'
    });

    it("should check ANY record successfully", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: DnsMonitor", "component");
        await annotate("Category: Core", "category");
        await annotate("Type: Business Logic", "type");

        const monitor = createTestMonitor({ recordType: "ANY" });
        const result = await dnsMonitor.check(monitor);
        expect(result.status).toBe("up");
        expect(result.details).toContain("ANY records");
    });

    it("should check TLSA record successfully", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: DnsMonitor", "component");
        await annotate("Category: Core", "category");
        await annotate("Type: Business Logic", "type");

        const monitor = createTestMonitor({ recordType: "TLSA" });
        const result = await dnsMonitor.check(monitor);
        expect(result.status).toBe("up");
        expect(result.details).toContain("TLSA records");
    });

    it("should check CAA record successfully", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: DnsMonitor", "component");
        await annotate("Category: Core", "category");
        await annotate("Type: Business Logic", "type");

        const monitor = createTestMonitor({ recordType: "CAA" });
        const result = await dnsMonitor.check(monitor);
        expect(result.status).toBe("up");
        expect(result.details).toContain("CAA records");
    });

    it("should check NAPTR record successfully", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: DnsMonitor", "component");
        await annotate("Category: Core", "category");
        await annotate("Type: Business Logic", "type");

        const monitor = createTestMonitor({ recordType: "NAPTR" });
        const result = await dnsMonitor.check(monitor);
        expect(result.status).toBe("up");
        expect(result.details).toContain("NAPTR records");
    });
});

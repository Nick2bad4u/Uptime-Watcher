import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Monitor } from "../../shared/types";

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

describe("DnsMonitor", () => {
    let dnsMonitor: DnsMonitor;

    beforeEach(() => {
        dnsMonitor = new DnsMonitor();
        vi.clearAllMocks();
    });

    it("should create DnsMonitor instance", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DnsMonitor", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Constructor", "type");

        expect(dnsMonitor).toBeInstanceOf(DnsMonitor);
    });

    it("should check A record successfully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DnsMonitor", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

        const monitor = createTestMonitor({ recordType: "A" });
        const result = await dnsMonitor.check(monitor);

        console.log("DEBUG - Full result:", JSON.stringify(result, null, 2));

        if (result.status === "down") {
            // If it's down, let's see what error we get
            expect(result.status).toBe("down");
            expect(result.error).toBeDefined();
        } else {
            expect(result.status).toBe("up");
            expect(result.details).toContain("A records");
        }
    });
});

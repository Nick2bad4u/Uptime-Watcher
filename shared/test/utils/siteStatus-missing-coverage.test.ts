import { describe, expect, test } from "vitest";
import { getSiteStatusDescription } from "@shared/utils/siteStatus";
import type { Monitor, Site } from "@shared/types";
import {
    monitorIdArbitrary,
    sampleOne,
    siteIdentifierArbitrary,
    siteNameArbitrary,
    siteUrlArbitrary,
} from "@shared/test/arbitraries/siteArbitraries";

const createHttpMonitor = (overrides: Partial<Monitor> = {}): Monitor => ({
    checkInterval: 300_000,
    history: [],
    id: sampleOne(monitorIdArbitrary),
    monitoring: true,
    responseTime: 100,
    retryAttempts: 3,
    status: "up",
    timeout: 30_000,
    type: "http",
    url: sampleOne(siteUrlArbitrary),
    ...overrides,
});

const createPortMonitor = (overrides: Partial<Monitor> = {}): Monitor => {
    const host =
        overrides.host ??
        (() => {
            try {
                return new URL(sampleOne(siteUrlArbitrary)).hostname;
            } catch {
                return "example.dev";
            }
        })();

    return createHttpMonitor({
        host,
        id: sampleOne(monitorIdArbitrary),
        port: overrides.port ?? 3000,
        type: "port",
        url: undefined,
        ...overrides,
    });
};

const createSite = (overrides: Partial<Site> = {}): Site => ({
    identifier: sampleOne(siteIdentifierArbitrary),
    monitoring: true,
    monitors: [],
    name: sampleOne(siteNameArbitrary),
    ...overrides,
});

describe("SiteStatus - Missing Coverage", () => {
    describe("getSiteStatusDescription default case", () => {
        test("should handle unknown status values (lines 199-200)", ({
            annotate,
            task,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: siteStatus-missing-coverage", "component");
            annotate("Category: Utility", "category");
            annotate("Type: Business Logic", "type");

            const siteWithUnknownStatus = createSite({
                monitors: [
                    createHttpMonitor({
                        status: "invalid-status" as Monitor["status"],
                    }),
                ],
            });

            const description = getSiteStatusDescription(siteWithUnknownStatus);
            expect(description).toBe("Unknown status");
        });

        test("should handle various invalid status values", ({
            annotate,
            task,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: siteStatus-missing-coverage", "component");
            annotate("Category: Utility", "category");
            annotate("Type: Business Logic", "type");

            const invalidStatuses = [
                "invalid",
                "random",
                "not-a-status",
                "",
                null,
                undefined,
                123,
                true,
            ];

            for (const invalidStatus of invalidStatuses) {
                const siteWithInvalidStatus = createSite({
                    monitors: [
                        createHttpMonitor({
                            status: invalidStatus as Monitor["status"],
                        }),
                    ],
                });

                const description = getSiteStatusDescription(
                    siteWithInvalidStatus
                );
                expect(description).toBe("Unknown status");
            }
        });

        test("should hit default case with mixed invalid statuses", ({
            annotate,
            task,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: siteStatus-missing-coverage", "component");
            annotate("Category: Utility", "category");
            annotate("Type: Business Logic", "type");

            const siteWithMixedInvalidStatuses = createSite({
                monitors: [
                    createHttpMonitor({
                        status: "invalid-status-1" as Monitor["status"],
                    }),
                    createPortMonitor({
                        status: "invalid-status-2" as Monitor["status"],
                    }),
                ],
            });

            const description = getSiteStatusDescription(
                siteWithMixedInvalidStatuses
            );
            expect(description).toBe("Mixed status (2/2 monitoring active)");
        });

        test("should verify the switch statement default behavior", ({
            annotate,
            task,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: siteStatus-missing-coverage", "component");
            annotate("Category: Utility", "category");
            annotate("Type: Business Logic", "type");

            const testSite = createSite({
                monitors: [
                    createHttpMonitor({
                        status: "definitely-not-a-valid-status" as Monitor["status"],
                    }),
                ],
            });

            const result = getSiteStatusDescription(testSite);
            expect(result).toBe("Unknown status");
            expect(typeof result).toBe("string");
        });
    });
});

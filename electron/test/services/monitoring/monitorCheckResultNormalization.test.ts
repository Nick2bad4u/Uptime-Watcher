import { describe, expect, it } from "vitest";

import {
    buildStatusUpdateMonitorCheckResult,
    isValidServiceResult,
    toFailure,
} from "../../../services/monitoring/utils/monitorCheckResultNormalization";

describe("monitorCheckResultNormalization", () => {
    describe(isValidServiceResult, () => {
        it.each([Number.NaN, Infinity, -Infinity])(
            "rejects non-finite response time %s",
            (responseTime) => {
                expect(
                    isValidServiceResult({
                        responseTime,
                        status: "up",
                    })
                ).toBeFalsy();
            }
        );

        it("accepts finite response times", () => {
            expect(
                isValidServiceResult({
                    responseTime: 123,
                    status: "up",
                })
            ).toBeTruthy();
        });
    });

    describe(toFailure, () => {
        it("returns a stable down result", () => {
            expect(toFailure("timeout")).toEqual({
                details: "timeout",
                responseTime: 0,
                status: "down",
            });
        });
    });

    describe(buildStatusUpdateMonitorCheckResult, () => {
        it("normalizes a service result into a status update result", () => {
            const timestamp = new Date("2024-01-01T00:00:00.000Z");

            expect(
                buildStatusUpdateMonitorCheckResult({
                    monitorId: "monitor-1",
                    operationId: "operation-1",
                    serviceResult: {
                        responseTime: 321,
                        status: "up",
                    },
                    timestamp,
                })
            ).toEqual({
                details: "Check successful",
                monitorId: "monitor-1",
                operationId: "operation-1",
                responseTime: 321,
                status: "up",
                timestamp,
            });
        });

        it("replaces invalid timestamps with a valid completion date", () => {
            const before = Date.now();
            const result = buildStatusUpdateMonitorCheckResult({
                monitorId: "monitor-1",
                operationId: "operation-1",
                serviceResult: {
                    responseTime: 321,
                    status: "up",
                },
                timestamp: new Date(Number.NaN),
            });
            const after = Date.now();

            expect(result.timestamp).toBeInstanceOf(Date);
            expect(Number.isFinite(result.timestamp.getTime())).toBeTruthy();
            expect(result.timestamp.getTime()).toBeGreaterThanOrEqual(before);
            expect(result.timestamp.getTime()).toBeLessThanOrEqual(after);
        });
    });
});

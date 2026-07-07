import { MONITOR_STATUS_VALUES, type MonitorType } from "@shared/types";
import type { ValidationResult } from "@shared/types/validation";

import { fc, test as fcTest } from "@fast-check/vitest";
import { validateMonitorField as sharedValidateMonitorField } from "@shared/validation/monitorSchemas";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
    createMonitorObject,
    validateMonitorFieldClientSide,
} from "../../utils/monitorValidation";

vi.mock(
    "@shared/validation/monitorSchemas",
    async (importOriginal): Promise<unknown> => {
        const actual =
            await importOriginal<
                typeof import("@shared/validation/monitorSchemas")
            >();

        return {
            ...actual,
            validateMonitorData: vi.fn(),
            validateMonitorField: vi.fn(),
        };
    }
);

const mockedSharedSchemas = {
    validateMonitorField: vi.mocked(sharedValidateMonitorField),
};

const resolveValidationResult = (
    overrides: Partial<ValidationResult> = {}
) => ({
    errors: [],
    metadata: {},
    success: true,
    warnings: [],
    ...overrides,
});

beforeEach(() => {
    vi.clearAllMocks();
    mockedSharedSchemas.validateMonitorField.mockReturnValue(
        resolveValidationResult()
    );
});

describe("monitorValidation error handling", () => {
    fcTest.prop([
        fc.constantFrom<MonitorType>("http", "ping", "port", "dns"),
        fc.record({
            history: fc.array(fc.anything()),
            monitoring: fc.boolean(),
            responseTime: fc.integer(),
            retryAttempts: fc.integer({ max: 5, min: 0 }),
            status: fc.constantFrom(...MONITOR_STATUS_VALUES),
            timeout: fc.integer({ max: 60_000, min: 1 }),
        }),
    ])(
        "createMonitorObject preserves provided fields and applies defaults",
        (type, overrides) => {
            const monitor = createMonitorObject(type, overrides);

            expect(monitor.type).toBe(type);
            expect(monitor.monitoring).toBe(overrides.monitoring ?? true);
            expect(monitor.retryAttempts).toBe(overrides.retryAttempts ?? 3);
            expect(monitor.status).toBe(overrides.status ?? "pending");
        }
    );

    it("normalizes client-side field validation results", async () => {
        mockedSharedSchemas.validateMonitorField.mockReturnValueOnce(
            resolveValidationResult({
                errors: ["bad"],
                metadata: { field: "url" },
                success: false,
            })
        );

        const result = await validateMonitorFieldClientSide(
            "http",
            "url",
            "value"
        );

        expect(result.metadata).toEqual({ field: "url" });
        expect(result.errors).toEqual(["bad"]);
    });
});

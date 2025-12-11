import { fc, test as fcTest } from "@fast-check/vitest";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { MonitorType } from "@shared/types";
import type { ValidationResult } from "@shared/types/validation";

import {
    createMonitorObject,
    isMonitorFormData,
    validateMonitorData,
    validateMonitorDataClientSide,
    validateMonitorField,
    validateMonitorFieldClientSide,
    validateMonitorFieldEnhanced,
} from "../../utils/monitorValidation";

vi.mock("../../stores/monitor/useMonitorTypesStore", () => {
    const getState = vi.fn();
    return {
        useMonitorTypesStore: {
            getState,
        },
    };
});

vi.mock("@shared/validation/monitorSchemas", () => ({
    validateMonitorData: vi.fn(),
    validateMonitorField: vi.fn(),
}));

import { useMonitorTypesStore } from "../../stores/monitor/useMonitorTypesStore";
import {
    validateMonitorData as sharedValidateMonitorData,
    validateMonitorField as sharedValidateMonitorField,
} from "@shared/validation/monitorSchemas";

type MonitorTypesStoreState = ReturnType<typeof useMonitorTypesStore.getState>;

const mockedMonitorTypesStore = vi.mocked(useMonitorTypesStore.getState);
const mockedSharedSchemas = {
    validateMonitorData: vi.mocked(sharedValidateMonitorData),
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

const createMockMonitorTypesStoreState = (
    overrides: Partial<MonitorTypesStoreState> = {}
): MonitorTypesStoreState => ({
    clearError: vi.fn(),
    isLoading: false,
    lastError: undefined,
    setError: vi.fn(),
    setLoading: vi.fn(),
    formatMonitorDetail: vi.fn(async () => ""),
    formatMonitorTitleSuffix: vi.fn(async () => ""),
    getFieldConfig: vi.fn(),
    loadMonitorTypes: vi.fn(async () => undefined),
    refreshMonitorTypes: vi.fn(async () => undefined),
    validateMonitorData: vi.fn().mockResolvedValue(resolveValidationResult()),
    fieldConfigs: {},
    isLoaded: true,
    monitorTypes: [],
    ...overrides,
});

beforeEach(() => {
    vi.clearAllMocks();
    mockedMonitorTypesStore.mockReturnValue(createMockMonitorTypesStoreState());
    mockedSharedSchemas.validateMonitorData.mockReturnValue(
        resolveValidationResult()
    );
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
            retryAttempts: fc.integer({ min: 0, max: 5 }),
            status: fc.constantFrom("up", "down", "degraded", "pending"),
            timeout: fc.integer({ min: 1, max: 60_000 }),
        }),
    ])("createMonitorObject preserves provided fields and applies defaults", (
        type,
        overrides
    ) => {
        const monitor = createMonitorObject(type, overrides);

        expect(monitor.type).toBe(type);
        expect(monitor.monitoring).toBe(overrides.monitoring ?? true);
        expect(monitor.retryAttempts).toBe(overrides.retryAttempts ?? 3);
        expect(monitor.status).toBe(overrides.status ?? "pending");
    });

    it("returns fallback result when monitor type store is unavailable", async () => {
        mockedMonitorTypesStore.mockReturnValueOnce(
            undefined as unknown as MonitorTypesStoreState
        );

        const result = await validateMonitorData("http", {});
        expect(result.success).toBeFalsy();
        expect(result.errors[0]).toContain(
            "Validation failed - unable to connect to backend"
        );
    });

    it("surfaces monitor type store validation results", async () => {
        const expected = resolveValidationResult({ warnings: ["note"] });
        const validateSpy = vi.fn().mockResolvedValue(expected);
        mockedMonitorTypesStore.mockReturnValue(
            createMockMonitorTypesStoreState({
                validateMonitorData: validateSpy,
            })
        );

        const result = await validateMonitorData("ping", { host: "host" });
        expect(validateSpy).toHaveBeenCalledWith("ping", {
            host: "host",
            type: "ping",
        });
        expect(result).toStrictEqual(expected);
    });

    it("hydrates client-side validation results", async () => {
        mockedSharedSchemas.validateMonitorData.mockReturnValueOnce(
            resolveValidationResult({
                errors: ["client error"],
                warnings: ["warn"],
                success: false,
            })
        );

        const result = await validateMonitorDataClientSide("http", {});
        expect(result.success).toBeFalsy();
        expect(result.errors).toContain("client error");
        expect(result.warnings).toContain("warn");
    });

    it("returns fallback when client-side validation throws", async () => {
        mockedSharedSchemas.validateMonitorData.mockImplementationOnce(() => {
            throw new Error("schema offline");
        });

        const result = await validateMonitorDataClientSide("http", {});
        expect(result.success).toBeFalsy();
        expect(result.errors[0]).toContain("Client-side validation failed");
    });

    it("filters errors per field when enhancing validation", async () => {
        const validateSpy = vi.fn().mockResolvedValue(
            resolveValidationResult({
                errors: ["url must be https", "host missing"],
                success: false,
                warnings: ["url might redirect"],
            })
        );
        mockedMonitorTypesStore.mockReturnValue(
            createMockMonitorTypesStoreState({
                validateMonitorData: validateSpy,
            })
        );

        const result = await validateMonitorFieldEnhanced(
            "http",
            "url",
            "http://example.com"
        );

        expect(result.errors).toEqual(["url must be https"]);
        expect(result.warnings).toEqual(["url might redirect"]);
    });

    it("falls back to generic error when validation returns unrelated errors", async () => {
        const validateSpy = vi.fn().mockResolvedValue(
            resolveValidationResult({
                errors: ["unexpected issue"],
                success: false,
            })
        );
        mockedMonitorTypesStore.mockReturnValue(
            createMockMonitorTypesStoreState({
                validateMonitorData: validateSpy,
            })
        );

        const result = await validateMonitorFieldEnhanced(
            "http",
            "url",
            "value"
        );

        expect(result.errors).toEqual(["Failed to validate field: url"]);
    });

    it("returns enhanced errors from validateMonitorField", async () => {
        const validateSpy = vi.fn().mockResolvedValue(
            resolveValidationResult({
                errors: ["host missing"],
                success: false,
            })
        );
        mockedMonitorTypesStore.mockReturnValue(
            createMockMonitorTypesStoreState({
                validateMonitorData: validateSpy,
            })
        );

        const errors = await validateMonitorField("ping", "host", "");
        expect(errors).toEqual(["host missing"]);
    });

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

    it("reports false when isMonitorFormData fails shared schema validation", () => {
        mockedSharedSchemas.validateMonitorData.mockReturnValueOnce(
            resolveValidationResult({ success: false })
        );

        expect(isMonitorFormData({})).toBeFalsy();
    });
});

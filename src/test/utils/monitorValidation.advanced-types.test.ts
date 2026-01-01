/**
 * Additional monitor validation coverage focused on advanced monitor types.
 *
 * @remarks
 * These tests follow the workflows described in `docs/Testing/README.md` and
 * the repository-specific guidance outlined in
 * `docs/Guides/TOOLS_AND_COMMANDS_GUIDE.md`. The suite combines conventional
 * assertions with property-based tests (per the fast-check guidance) to ensure
 * that `validateMonitorFormData` correctly handles every monitor subtype,
 * including those that previously lacked direct coverage such as CDN edge
 * consistency, replication, and WebSocket keepalive monitors.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { test } from "@fast-check/vitest";
import * as fc from "fast-check";

import type { MonitorType } from "@shared/types";
import type { ValidationResult } from "@shared/types/validation";

vi.mock("@shared/utils/errorHandling", () => ({
    withUtilityErrorHandling: vi.fn(),
}));

vi.mock(
    "@shared/validation/monitorSchemas",
    async (importOriginal): Promise<unknown> => {
        const actual =
            (await importOriginal()) as typeof import("@shared/validation/monitorSchemas");

        return {
            ...actual,
            validateMonitorData: vi.fn(),
            validateMonitorField: vi.fn(),
        };
    }
);

import {
    validateMonitorFormData,
    type PartialMonitorFormDataByType,
} from "../../utils/monitorValidation";
import { withUtilityErrorHandling } from "@shared/utils/errorHandling";
import {
    validateMonitorData as sharedValidateMonitorData,
    validateMonitorField as sharedValidateMonitorField,
} from "@shared/validation/monitorSchemas";

/**
 * Base validation result reused across tests to keep mocks deterministic.
 */
const baseValidationResult: ValidationResult = {
    errors: [],
    metadata: {},
    success: true,
    warnings: [],
};

/**
 * Definition of a monitor scenario for table-driven tests.
 */
interface MonitorTypeScenario<TType extends MonitorType = MonitorType> {
    readonly type: TType;
    readonly validData: PartialMonitorFormDataByType<TType>;
    readonly requiredFields: readonly {
        readonly field: string;
        readonly missingMessage: string;
        readonly invalidValue?: unknown;
    }[];
}

const advancedMonitorScenarios = [
    {
        requiredFields: [
            {
                field: "url",
                invalidValue: undefined,
                missingMessage: "URL is required for HTTP header monitors",
            },
            {
                field: "headerName",
                invalidValue: "",
                missingMessage:
                    "Header name is required for HTTP header monitors",
            },
            {
                field: "expectedHeaderValue",
                invalidValue: "",
                missingMessage:
                    "Expected header value is required for HTTP header monitors",
            },
        ],
        type: "http-header",
        validData: {
            expectedHeaderValue: "MISS",
            headerName: "x-cache",
            url: "https://headers.example.com/inspect",
        } satisfies PartialMonitorFormDataByType<"http-header">,
    },
    {
        requiredFields: [
            {
                field: "url",
                invalidValue: undefined,
                missingMessage: "URL is required for HTTP JSON monitors",
            },
            {
                field: "jsonPath",
                invalidValue: "",
                missingMessage: "JSON path is required for HTTP JSON monitors",
            },
            {
                field: "expectedJsonValue",
                invalidValue: "",
                missingMessage:
                    "Expected JSON value is required for HTTP JSON monitors",
            },
        ],
        type: "http-json",
        validData: {
            expectedJsonValue: "ok",
            jsonPath: "$.status",
            url: "https://json.example.com/health",
        } satisfies PartialMonitorFormDataByType<"http-json">,
    },
    {
        requiredFields: [
            {
                field: "url",
                invalidValue: undefined,
                missingMessage: "URL is required for HTTP latency monitors",
            },
            {
                field: "maxResponseTime",
                invalidValue: undefined,
                missingMessage:
                    "Maximum response time is required for HTTP latency monitors",
            },
        ],
        type: "http-latency",
        validData: {
            maxResponseTime: 1500,
            url: "https://latency.example.com/api",
        } satisfies PartialMonitorFormDataByType<"http-latency">,
    },
    {
        requiredFields: [
            {
                field: "host",
                invalidValue: undefined,
                missingMessage: "Host is required for DNS monitors",
            },
            {
                field: "recordType",
                invalidValue: "",
                missingMessage: "Record type is required for DNS monitors",
            },
        ],
        type: "dns",
        validData: {
            expectedValue: "93.184.216.34",
            host: "example.com",
            recordType: "A",
        } satisfies PartialMonitorFormDataByType<"dns">,
    },
    {
        requiredFields: [
            {
                field: "host",
                invalidValue: undefined,
                missingMessage: "Host is required for SSL monitors",
            },
            {
                field: "port",
                invalidValue: undefined,
                missingMessage: "Port is required for SSL monitors",
            },
            {
                field: "certificateWarningDays",
                invalidValue: undefined,
                missingMessage:
                    "Certificate warning threshold is required for SSL monitors",
            },
        ],
        type: "ssl",
        validData: {
            certificateWarningDays: 30,
            host: "secure.example.com",
            port: 443,
        } satisfies PartialMonitorFormDataByType<"ssl">,
    },
    {
        requiredFields: [
            {
                field: "baselineUrl",
                invalidValue: undefined,
                missingMessage:
                    "Baseline URL is required for CDN edge consistency monitors",
            },
            {
                field: "edgeLocations",
                invalidValue: "",
                missingMessage:
                    "Edge endpoints are required for CDN edge consistency monitors",
            },
        ],
        type: "cdn-edge-consistency",
        validData: {
            baselineUrl: "https://origin.example.com/status",
            edgeLocations:
                "https://edge-1.example.com,https://edge-2.example.com",
        } satisfies PartialMonitorFormDataByType<"cdn-edge-consistency">,
    },
    {
        requiredFields: [
            {
                field: "primaryStatusUrl",
                invalidValue: undefined,
                missingMessage:
                    "Primary status URL is required for replication monitors",
            },
            {
                field: "replicaStatusUrl",
                invalidValue: undefined,
                missingMessage:
                    "Replica status URL is required for replication monitors",
            },
            {
                field: "replicationTimestampField",
                invalidValue: "",
                missingMessage:
                    "Replication timestamp field is required for replication monitors",
            },
            {
                field: "maxReplicationLagSeconds",
                invalidValue: undefined,
                missingMessage:
                    "Maximum replication lag is required for replication monitors",
            },
        ],
        type: "replication",
        validData: {
            maxReplicationLagSeconds: 90,
            primaryStatusUrl: "https://primary.example.com/status",
            replicaStatusUrl: "https://replica.example.com/status",
            replicationTimestampField: "data.replicationTimestamp",
        } satisfies PartialMonitorFormDataByType<"replication">,
    },
    {
        requiredFields: [
            {
                field: "url",
                invalidValue: undefined,
                missingMessage:
                    "Heartbeat URL is required for server heartbeat monitors",
            },
            {
                field: "heartbeatStatusField",
                invalidValue: "",
                missingMessage:
                    "Heartbeat status field is required for server heartbeat monitors",
            },
            {
                field: "heartbeatTimestampField",
                invalidValue: "",
                missingMessage:
                    "Heartbeat timestamp field is required for server heartbeat monitors",
            },
            {
                field: "heartbeatExpectedStatus",
                invalidValue: "",
                missingMessage:
                    "Expected heartbeat status is required for server heartbeat monitors",
            },
            {
                field: "heartbeatMaxDriftSeconds",
                invalidValue: undefined,
                missingMessage:
                    "Heartbeat drift tolerance is required for server heartbeat monitors",
            },
        ],
        type: "server-heartbeat",
        validData: {
            heartbeatExpectedStatus: "running",
            heartbeatMaxDriftSeconds: 45,
            heartbeatStatusField: "payload.status",
            heartbeatTimestampField: "payload.timestamp",
            url: "https://heartbeat.example.com/api",
        } satisfies PartialMonitorFormDataByType<"server-heartbeat">,
    },
    {
        requiredFields: [
            {
                field: "url",
                invalidValue: undefined,
                missingMessage:
                    "WebSocket URL is required for keepalive monitors",
            },
            {
                field: "maxPongDelayMs",
                invalidValue: undefined,
                missingMessage:
                    "Maximum pong delay is required for WebSocket keepalive monitors",
            },
        ],
        type: "websocket-keepalive",
        validData: {
            maxPongDelayMs: 5000,
            url: "wss://socket.example.com/keepalive",
        } satisfies PartialMonitorFormDataByType<"websocket-keepalive">,
    },
] as const satisfies readonly MonitorTypeScenario[];

const scenarioFieldPairs = advancedMonitorScenarios.flatMap((scenario) =>
    scenario.requiredFields.map((field) => ({
        field,
        scenario,
    }))
);

const missingFieldCases = advancedMonitorScenarios.flatMap((scenario) =>
    scenario.requiredFields.map(
        (field) =>
            [
                field.field,
                scenario.type,
                field,
                scenario,
            ] as const
    )
);

beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(withUtilityErrorHandling).mockImplementation(
        async (operation, _description, fallback) => {
            try {
                return await operation();
            } catch (error) {
                if (fallback !== undefined) {
                    return fallback;
                }
                throw error;
            }
        }
    );

    vi.mocked(sharedValidateMonitorField).mockReturnValue(baseValidationResult);
    vi.mocked(sharedValidateMonitorData).mockReturnValue(baseValidationResult);
});

describe("validateMonitorFormData advanced monitor coverage", () => {
    it.each(advancedMonitorScenarios)(
        "accepts valid $type payloads and delegates to shared schemas",
        async ({ type, validData, requiredFields }) => {
            const result = await validateMonitorFormData(type, validData);

            expect(result).toEqual({ errors: [], success: true, warnings: [] });

            for (const { field } of requiredFields) {
                const fieldValue = (validData as Record<string, unknown>)[
                    field
                ];
                expect(sharedValidateMonitorField).toHaveBeenCalledWith(
                    type,
                    field,
                    fieldValue
                );
            }
        }
    );

    it.each(missingFieldCases)(
        "returns explicit error when %s is missing for %s monitors",
        async (_fieldName, _monitorType, field, scenario) => {
            let invalidData: PartialMonitorFormDataByType<
                typeof scenario.type
            > = {
                ...scenario.validData,
            };

            if (field.invalidValue === undefined) {
                const { [field.field]: removedValue, ...remainingData } =
                    invalidData as Record<string, unknown>;
                void removedValue;
                invalidData = remainingData as PartialMonitorFormDataByType<
                    typeof scenario.type
                >;
            } else {
                invalidData = {
                    ...invalidData,
                    [field.field]: field.invalidValue,
                } as PartialMonitorFormDataByType<typeof scenario.type>;
            }

            const result = await validateMonitorFormData(
                scenario.type,
                invalidData
            );

            expect(result).toEqual({
                errors: [field.missingMessage],
                success: false,
                warnings: [],
            });
        }
    );

    it("validates DNS expectedValue only when it contains content", async () => {
        const whitespaceData = {
            expectedValue: "   ",
            host: "dns.example.com",
            recordType: "A",
        } satisfies PartialMonitorFormDataByType<"dns">;

        await validateMonitorFormData("dns", whitespaceData);
        const expectedValueCalls = vi
            .mocked(sharedValidateMonitorField)
            .mock.calls.filter(
                ([, fieldName]) => fieldName === "expectedValue"
            );
        expect(expectedValueCalls).toHaveLength(0);

        vi.mocked(sharedValidateMonitorField).mockClear();

        const populatedData = {
            expectedValue: "1.1.1.1",
            host: "dns.example.com",
            recordType: "A",
        } satisfies PartialMonitorFormDataByType<"dns">;

        await validateMonitorFormData("dns", populatedData);
        const populatedCalls = vi
            .mocked(sharedValidateMonitorField)
            .mock.calls.filter(
                ([, fieldName]) => fieldName === "expectedValue"
            );
        expect(populatedCalls).toHaveLength(1);
    });

    it("returns an unsupported type error when the monitor type is unknown", async () => {
        const result = await validateMonitorFormData(
            "custom-monitor" as MonitorType,
            {}
        );

        expect(result).toEqual({
            errors: ["Unsupported monitor type: custom-monitor"],
            success: false,
            warnings: [],
        });
    });
});

test.prop([
    fc.constantFrom(...scenarioFieldPairs),
    fc
        .string({ minLength: 5, maxLength: 40 })
        .filter((message) => /\S/.test(message)),
])(
    "propagates shared schema errors for advanced monitor fields",
    async ({ field, scenario }, schemaErrorMessage) => {
        vi.mocked(sharedValidateMonitorField).mockImplementation(
            (monitorType, fieldName) => {
                if (
                    monitorType === scenario.type &&
                    fieldName === field.field
                ) {
                    return {
                        ...baseValidationResult,
                        errors: [schemaErrorMessage],
                        success: false,
                    } satisfies ValidationResult;
                }
                return baseValidationResult;
            }
        );

        const result = await validateMonitorFormData(
            scenario.type,
            scenario.validData
        );

        expect(result.errors).toContain(schemaErrorMessage);
        expect(result.success).toBeFalsy();

        vi.mocked(sharedValidateMonitorField).mockReturnValue(
            baseValidationResult
        );
    }
);

/**
 * Enhanced monitor validation utilities with shared schemas. Provides both
 * client-side and server-side validation support.
 *
 * @public
 */

import type { ValidationResult } from "@shared/types/validation";
import type { Simplify, UnknownRecord } from "type-fest";

import {
    BASE_MONITOR_TYPES,
    type Monitor,
    type MonitorType,
} from "@shared/types";
import { withUtilityErrorHandling } from "@shared/utils/errorHandling";
import {
    validateMonitorData as sharedValidateMonitorData,
    validateMonitorField as sharedValidateMonitorField,
} from "@shared/validation/monitorSchemas";

import type {
    CdnEdgeConsistencyFormData,
    DnsFormData,
    HttpFormData,
    HttpHeaderFormData,
    HttpJsonFormData,
    HttpKeywordFormData,
    HttpLatencyFormData,
    HttpStatusFormData,
    MonitorFormData,
    PingFormData,
    PortFormData,
    ReplicationFormData,
    ServerHeartbeatFormData,
    SslFormData,
    WebsocketKeepaliveFormData,
} from "../types/monitorFormData";

import { useMonitorTypesStore } from "../stores/monitor/useMonitorTypesStore";

/**
 * Runtime set of all supported monitor type discriminants.
 */
const MONITOR_TYPE_SET = new Set<string>(BASE_MONITOR_TYPES);

const isKnownMonitorType = (value: string): value is MonitorType =>
    MONITOR_TYPE_SET.has(value);

/**
 * Maps each monitor type to the specific renderer form data variant.
 *
 * @internal
 */
type MonitorFormDataByType = {
    [Type in MonitorType]: Extract<MonitorFormData, { type: Type }>;
};

/**
 * Convenience alias that exposes the concrete form data shape for the provided
 * monitor type.
 *
 * @internal
 */
type TypedMonitorFormData<TType extends MonitorType> =
    MonitorFormDataByType[TType];

/**
 * Partial view of monitor form data for a specific monitor type.
 *
 * @internal
 */
export type PartialMonitorFormDataByType<TType extends MonitorType> = Partial<
    TypedMonitorFormData<TType>
>;

/**
 * Extracts the allowed field names for a specific monitor type.
 *
 * @internal
 */
type MonitorFieldName<TType extends MonitorType> = Extract<
    keyof TypedMonitorFormData<TType>,
    string
>;

/**
 * Resolves the runtime value type for a monitor field.
 *
 * @internal
 */
type MonitorFieldValue<
    TType extends MonitorType,
    TField extends MonitorFieldName<TType>,
> = TypedMonitorFormData<TType>[TField];

type MaybeUndefined<TValue> = undefined extends TValue
    ? TValue
    : TValue | undefined;

type OptionalMonitorFieldValue<
    TType extends MonitorType,
    TField extends MonitorFieldName<TType>,
> = MaybeUndefined<MonitorFieldValue<TType, TField>>;

/**
 * Utility type that returns the subset of field names whose value type matches
 * {@link TValue}.
 *
 * @internal
 */
type FieldNamesOfType<TType extends MonitorType, TValue> = {
    [Key in MonitorFieldName<TType>]: Extract<
        MonitorFieldValue<TType, Key>,
        TValue
    > extends never
        ? never
        : Key;
}[MonitorFieldName<TType>];

/**
 * All field names whose runtime value resolves to a string (optionally
 * undefined).
 *
 * @internal
 */
type StringFieldName<TType extends MonitorType> = FieldNamesOfType<
    TType,
    string
>;

/**
 * All field names whose runtime value resolves to a number (optionally
 * undefined).
 *
 * @internal
 */
type NumberFieldName<TType extends MonitorType> = FieldNamesOfType<
    TType,
    number
>;

/**
 * Signature for monitor form validation helpers keyed by monitor type.
 *
 * @internal
 */
type MonitorFormValidatorMap = {
    [Type in MonitorType]: (
        data: PartialMonitorFormDataByType<Type>
    ) => string[];
};

// ValidationResult type available via direct import from
// @shared/types/validation

/**
 * Enhanced validation result with additional type information using
 * {@link Simplify}.
 *
 * @internal
 */
type EnhancedValidationResult = Simplify<
    ValidationResult & {
        /** Field that was validated (if applicable) */
        fieldName?: string;
        /** Type information about the validation */
        validationType: "field" | "full" | "partial";
    }
>;

/**
 * Required fields for monitor creation, ensuring type safety. Prevents runtime
 * errors by guaranteeing essential properties are present.
 *
 * @public
 */
export interface MonitorCreationData
    extends
        Pick<
            Monitor,
            | "history"
            | "monitoring"
            | "responseTime"
            | "retryAttempts"
            | "status"
            | "timeout"
            | "type"
        >,
        UnknownRecord {}
/**
 * Create monitor object with proper field mapping and type safety.
 *
 * @typeParam TType - Monitor type literal for the monitor being constructed.
 *
 * @param type - Monitor type.
 * @param fields - Field values to merge with defaults.
 *
 * @returns Monitor creation data with type-specific fields and guaranteed
 *   required fields.
 *
 * @public
 */
export function createMonitorObject<TType extends MonitorType>(
    type: TType,
    fields: PartialMonitorFormDataByType<TType>
): MonitorCreationData & PartialMonitorFormDataByType<TType> {
    return {
        history: [],
        monitoring: true,
        responseTime: -1,
        retryAttempts: 3,
        status: "pending",
        timeout: 10_000,
        ...fields,
        type,
    };
}

/**
 * Executes a monitor validation helper with standardized error handling.
 *
 * @typeParam TResult - Result produced by the validation operation.
 *
 * @param description - Context string describing the operation for logging.
 * @param fallback - Value returned when the validation operation fails.
 * @param operation - Callback encapsulating the validation logic.
 *
 * @returns Result of the validation operation or the fallback when errors
 *   occur.
 */
async function runMonitorValidationOperation<TResult>(
    description: string,
    fallback: TResult,
    operation: () => Promise<TResult> | TResult
): Promise<TResult> {
    return withUtilityErrorHandling(
        async () => operation(),
        description,
        fallback
    );
}

/**
 * Builds a typed partial monitor form data object for single-field validation.
 *
 * @typeParam TType - Monitor type discriminator.
 * @typeParam TField - Field name belonging to the specified monitor type.
 */
function toPartialMonitorFormData<
    TType extends MonitorType,
    TField extends MonitorFieldName<TType>,
>(
    fieldName: TField,
    value: OptionalMonitorFieldValue<TType, TField>
): PartialMonitorFormDataByType<TType> {
    // The computed property name tied to the generic field name cannot be
    // expressed without a type assertion, but the resulting object is safely
    // assignable to PartialMonitorFormDataByType<TType>.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Narrowing computed generic field name to PartialMonitorFormDataByType<TType> is safe here
    return {
        [fieldName]: value,
    } as PartialMonitorFormDataByType<TType>;
}

/**
 * Validate monitor data using backend registry.
 *
 * @typeParam TType - Monitor type discriminator to validate against.
 *
 * @param type - Monitor type.
 * @param data - Monitor data to validate.
 *
 * @returns Promise resolving to validation result.
 *
 * @public
 */
export async function validateMonitorData<TType extends MonitorType>(
    type: TType,
    data?: PartialMonitorFormDataByType<TType>
): Promise<ValidationResult> {
    const basePayload: PartialMonitorFormDataByType<TType> = data ?? {};
    // Always include the monitor type in the payload so that downstream
    // validators (monitor types store and backend Zod schemas) receive a
    // consistent discriminator field alongside the typed argument.
    const payload: PartialMonitorFormDataByType<TType> & { type: TType } = {
        ...basePayload,
        type,
    };
    if (!isKnownMonitorType(type)) {
        return {
            errors: [`Unsupported monitor type: ${String(type)}`],
            success: false,
            warnings: [],
        };
    }
    return runMonitorValidationOperation(
        "Monitor data validation",
        {
            errors: ["Validation failed - unable to connect to backend"],
            metadata: {},
            success: false,
            warnings: [],
        },
        async () => {
            const store = useMonitorTypesStore.getState();
            return store.validateMonitorData(type, payload);
        }
    );
}

/**
 * Perform client-side validation using shared Zod schemas. Provides immediate
 * feedback without IPC round-trip.
 *
 * @typeParam TType - Monitor type discriminator to validate against.
 *
 * @param type - Monitor type.
 * @param data - Monitor data to validate.
 *
 * @returns Promise resolving to validation result.
 *
 * @public
 */
export async function validateMonitorDataClientSide<TType extends MonitorType>(
    type: TType,
    data: PartialMonitorFormDataByType<TType>
): Promise<ValidationResult> {
    return runMonitorValidationOperation(
        "Client-side monitor data validation",
        {
            errors: ["Client-side validation failed"],
            success: false,
            warnings: [],
        },
        () => {
            const result = sharedValidateMonitorData(type, data);
            return {
                errors: result.errors,
                success: result.success,
                warnings: result.warnings ?? [],
            };
        }
    );
}

/**
 * Enhanced field validation with type information and better error handling.
 *
 * @typeParam TType - Monitor type being validated.
 * @typeParam TField - Field identifier belonging to the monitor form.
 *
 * @param type - Monitor type.
 * @param fieldName - Field name to validate.
 * @param value - Field value.
 *
 * @returns Promise resolving to enhanced validation result.
 *
 * @public
 */
export async function validateMonitorFieldEnhanced<
    TType extends MonitorType,
    TField extends MonitorFieldName<TType>,
>(
    type: TType,
    fieldName: TField,
    value: OptionalMonitorFieldValue<TType, TField>
): Promise<EnhancedValidationResult> {
    return runMonitorValidationOperation(
        "Enhanced field validation",
        {
            errors: [`Failed to validate field: ${fieldName}`],
            fieldName,
            success: false,
            validationType: "field" as const,
            warnings: [],
        },
        async () => {
            const partialPayload = toPartialMonitorFormData(fieldName, value);
            const result = await validateMonitorData(type, partialPayload);

            const filteredErrors = result.errors.filter((error) =>
                error.toLowerCase().includes(fieldName.toLowerCase())
            );

            const finalErrors =
                result.errors.length > 0 &&
                filteredErrors.length === 0 &&
                !result.success
                    ? [`Failed to validate field: ${fieldName}`]
                    : filteredErrors;

            return {
                errors: finalErrors,
                fieldName,
                success: result.success,
                validationType: "field" as const,
                warnings:
                    result.warnings?.filter((warning) =>
                        warning.toLowerCase().includes(fieldName.toLowerCase())
                    ) ?? [],
            };
        }
    );
}

/**
 * Validate individual monitor field with improved error filtering.
 *
 * @typeParam TType - Monitor type under validation.
 * @typeParam TField - Field identifier belonging to the monitor form.
 *
 * @param type - Monitor type.
 * @param fieldName - Field name to validate.
 * @param value - Field value.
 *
 * @returns Promise resolving to validation errors (empty when valid).
 *
 * @public
 */
export async function validateMonitorField<
    TType extends MonitorType,
    TField extends MonitorFieldName<TType>,
>(
    type: TType,
    fieldName: TField,
    value: OptionalMonitorFieldValue<TType, TField>
): Promise<readonly string[]> {
    return runMonitorValidationOperation(
        "Field validation",
        [`Failed to validate field: ${fieldName}`],
        async () => {
            const result = await validateMonitorFieldEnhanced(
                type,
                fieldName,
                value
            );
            return result.errors;
        }
    );
}

/**
 * Validate a specific monitor field for real-time feedback using shared
 * schemas. Provides immediate validation without IPC round-trip.
 *
 * @typeParam TType - Monitor type under validation.
 * @typeParam TField - Field identifier belonging to the monitor form.
 *
 * @param type - Monitor type.
 * @param fieldName - Field name to validate.
 * @param value - Field value to validate.
 *
 * @returns Promise resolving to validation result.
 *
 * @public
 */
export async function validateMonitorFieldClientSide<
    TType extends MonitorType,
    TField extends MonitorFieldName<TType>,
>(
    type: TType,
    fieldName: TField,
    value: OptionalMonitorFieldValue<TType, TField>
): Promise<ValidationResult> {
    return runMonitorValidationOperation(
        `Client-side field validation for ${fieldName}`,
        {
            errors: [`Failed to validate ${fieldName} on client-side`],
            metadata: {},
            success: false,
            warnings: [],
        },
        () => sharedValidateMonitorField(type, fieldName, value)
    );
}

const validateRequiredStringField = <
    TType extends MonitorType,
    TField extends StringFieldName<TType>,
>(
    type: TType,
    fieldName: TField,
    value: OptionalMonitorFieldValue<TType, TField>,
    missingMessage: string
): string[] => {
    if (typeof value !== "string") {
        return [missingMessage];
    }

    const result = sharedValidateMonitorField(type, fieldName, value);
    const errors = Array.from(result.errors);

    if (value.trim().length === 0 && errors.length === 0) {
        errors.push(missingMessage);
    }

    return errors;
};

const validateRequiredNumberField = <
    TType extends MonitorType,
    TField extends NumberFieldName<TType>,
>(
    type: TType,
    fieldName: TField,
    value: OptionalMonitorFieldValue<TType, TField>,
    missingMessage: string
): string[] => {
    if (typeof value !== "number" || Number.isNaN(value)) {
        return [missingMessage];
    }

    const result = sharedValidateMonitorField(type, fieldName, value);
    return Array.from(result.errors);
};

// Helper functions for monitor form validation (reduces complexity by
// composition)
const validateHttpMonitorFormData = (data: Partial<HttpFormData>): string[] =>
    validateRequiredStringField(
        "http",
        "url",
        data.url,
        "URL is required for HTTP monitors"
    );

const validateHttpKeywordMonitorFormData = (
    data: Partial<HttpKeywordFormData>
): string[] => {
    const errors: string[] = [];

    if (!data.url || typeof data.url !== "string") {
        errors.push("URL is required for HTTP keyword monitors");
    } else {
        const urlResult = sharedValidateMonitorField(
            "http-keyword",
            "url",
            data.url
        );
        errors.push(...urlResult.errors);
    }

    if (!data.bodyKeyword || typeof data.bodyKeyword !== "string") {
        errors.push("Keyword is required for HTTP keyword monitors");
    } else {
        const keywordResult = sharedValidateMonitorField(
            "http-keyword",
            "bodyKeyword",
            data.bodyKeyword
        );
        errors.push(...keywordResult.errors);
    }

    return errors;
};

const validateHttpHeaderMonitorFormData = (
    data: Partial<HttpHeaderFormData>
): string[] => [
    ...validateRequiredStringField(
        "http-header",
        "url",
        data.url,
        "URL is required for HTTP header monitors"
    ),
    ...validateRequiredStringField(
        "http-header",
        "headerName",
        data.headerName,
        "Header name is required for HTTP header monitors"
    ),
    ...validateRequiredStringField(
        "http-header",
        "expectedHeaderValue",
        data.expectedHeaderValue,
        "Expected header value is required for HTTP header monitors"
    ),
];

const validateHttpJsonMonitorFormData = (
    data: Partial<HttpJsonFormData>
): string[] => [
    ...validateRequiredStringField(
        "http-json",
        "url",
        data.url,
        "URL is required for HTTP JSON monitors"
    ),
    ...validateRequiredStringField(
        "http-json",
        "jsonPath",
        data.jsonPath,
        "JSON path is required for HTTP JSON monitors"
    ),
    ...validateRequiredStringField(
        "http-json",
        "expectedJsonValue",
        data.expectedJsonValue,
        "Expected JSON value is required for HTTP JSON monitors"
    ),
];

const validateHttpStatusMonitorFormData = (
    data: Partial<HttpStatusFormData>
): string[] => {
    const errors: string[] = [];

    if (!data.url || typeof data.url !== "string") {
        errors.push("URL is required for HTTP status monitors");
    } else {
        const urlResult = sharedValidateMonitorField(
            "http-status",
            "url",
            data.url
        );
        errors.push(...urlResult.errors);
    }

    if (
        !Number.isInteger(data.expectedStatusCode) ||
        typeof data.expectedStatusCode !== "number"
    ) {
        errors.push(
            "Expected status code is required for HTTP status monitors"
        );
    } else {
        const statusResult = sharedValidateMonitorField(
            "http-status",
            "expectedStatusCode",
            data.expectedStatusCode
        );
        errors.push(...statusResult.errors);
    }

    return errors;
};

const validateHttpLatencyMonitorFormData = (
    data: Partial<HttpLatencyFormData>
): string[] => [
    ...validateRequiredStringField(
        "http-latency",
        "url",
        data.url,
        "URL is required for HTTP latency monitors"
    ),
    ...validateRequiredNumberField(
        "http-latency",
        "maxResponseTime",
        data.maxResponseTime,
        "Maximum response time is required for HTTP latency monitors"
    ),
];

/**
 * Validates DNS monitor form data by checking required host and recordType
 * fields, with optional expectedValue field.
 *
 * @remarks
 * DNS monitors require host and recordType fields. The expectedValue field is
 * optional and only validated if provided. Uses shared validation to ensure
 * consistency with backend validation rules.
 *
 * @param data - Form data to validate
 *
 * @returns Array of validation error messages
 */
const validateDnsMonitorFormData = (data: Partial<DnsFormData>): string[] => {
    const errors: string[] = [];

    if (!data.host || typeof data.host !== "string") {
        errors.push("Host is required for DNS monitors");
    } else {
        // Validate host field specifically
        const hostResult = sharedValidateMonitorField("dns", "host", data.host);
        errors.push(...hostResult.errors);
    }

    if (!data.recordType || typeof data.recordType !== "string") {
        errors.push("Record type is required for DNS monitors");
    } else {
        // Validate recordType field specifically
        const recordTypeResult = sharedValidateMonitorField(
            "dns",
            "recordType",
            data.recordType
        );
        errors.push(...recordTypeResult.errors);
    }

    // Optional expectedValue validation
    if (
        data.expectedValue &&
        typeof data.expectedValue === "string" &&
        data.expectedValue.trim()
    ) {
        const expectedValueResult = sharedValidateMonitorField(
            "dns",
            "expectedValue",
            data.expectedValue
        );
        errors.push(...expectedValueResult.errors);
    }

    return errors;
};

const validatePortMonitorFormData = (data: Partial<PortFormData>): string[] => {
    const errors: string[] = [];

    if (!data.host || typeof data.host !== "string") {
        errors.push("Host is required for port monitors");
    } else {
        // Validate host field specifically
        const hostResult = sharedValidateMonitorField(
            "port",
            "host",
            data.host
        );
        errors.push(...hostResult.errors);
    }

    if (!data.port || typeof data.port !== "number") {
        errors.push("Port is required for port monitors");
    } else {
        // Validate port field specifically
        const portResult = sharedValidateMonitorField(
            "port",
            "port",
            data.port
        );
        errors.push(...portResult.errors);
    }

    return errors;
};

const validateSslMonitorFormData = (data: Partial<SslFormData>): string[] => {
    const errors: string[] = [];

    if (!data.host || typeof data.host !== "string") {
        errors.push("Host is required for SSL monitors");
    } else {
        const hostResult = sharedValidateMonitorField("ssl", "host", data.host);
        errors.push(...hostResult.errors);
    }

    if (!data.port || typeof data.port !== "number") {
        errors.push("Port is required for SSL monitors");
    } else {
        const portResult = sharedValidateMonitorField("ssl", "port", data.port);
        errors.push(...portResult.errors);
    }

    if (
        !data.certificateWarningDays ||
        typeof data.certificateWarningDays !== "number"
    ) {
        errors.push(
            "Certificate warning threshold is required for SSL monitors"
        );
    } else {
        const warningResult = sharedValidateMonitorField(
            "ssl",
            "certificateWarningDays",
            data.certificateWarningDays
        );
        errors.push(...warningResult.errors);
    }

    return errors;
};

const validateCdnEdgeConsistencyMonitorFormData = (
    data: Partial<CdnEdgeConsistencyFormData>
): string[] => [
    ...validateRequiredStringField(
        "cdn-edge-consistency",
        "baselineUrl",
        data.baselineUrl,
        "Baseline URL is required for CDN edge consistency monitors"
    ),
    ...validateRequiredStringField(
        "cdn-edge-consistency",
        "edgeLocations",
        data.edgeLocations,
        "Edge endpoints are required for CDN edge consistency monitors"
    ),
];

const validateReplicationMonitorFormData = (
    data: Partial<ReplicationFormData>
): string[] => [
    ...validateRequiredStringField(
        "replication",
        "primaryStatusUrl",
        data.primaryStatusUrl,
        "Primary status URL is required for replication monitors"
    ),
    ...validateRequiredStringField(
        "replication",
        "replicaStatusUrl",
        data.replicaStatusUrl,
        "Replica status URL is required for replication monitors"
    ),
    ...validateRequiredStringField(
        "replication",
        "replicationTimestampField",
        data.replicationTimestampField,
        "Replication timestamp field is required for replication monitors"
    ),
    ...validateRequiredNumberField(
        "replication",
        "maxReplicationLagSeconds",
        data.maxReplicationLagSeconds,
        "Maximum replication lag is required for replication monitors"
    ),
];

const validateServerHeartbeatMonitorFormData = (
    data: Partial<ServerHeartbeatFormData>
): string[] => [
    ...validateRequiredStringField(
        "server-heartbeat",
        "url",
        data.url,
        "Heartbeat URL is required for server heartbeat monitors"
    ),
    ...validateRequiredStringField(
        "server-heartbeat",
        "heartbeatStatusField",
        data.heartbeatStatusField,
        "Heartbeat status field is required for server heartbeat monitors"
    ),
    ...validateRequiredStringField(
        "server-heartbeat",
        "heartbeatTimestampField",
        data.heartbeatTimestampField,
        "Heartbeat timestamp field is required for server heartbeat monitors"
    ),
    ...validateRequiredStringField(
        "server-heartbeat",
        "heartbeatExpectedStatus",
        data.heartbeatExpectedStatus,
        "Expected heartbeat status is required for server heartbeat monitors"
    ),
    ...validateRequiredNumberField(
        "server-heartbeat",
        "heartbeatMaxDriftSeconds",
        data.heartbeatMaxDriftSeconds,
        "Heartbeat drift tolerance is required for server heartbeat monitors"
    ),
];

const validateWebsocketKeepaliveMonitorFormData = (
    data: Partial<WebsocketKeepaliveFormData>
): string[] => [
    ...validateRequiredStringField(
        "websocket-keepalive",
        "url",
        data.url,
        "WebSocket URL is required for keepalive monitors"
    ),
    ...validateRequiredNumberField(
        "websocket-keepalive",
        "maxPongDelayMs",
        data.maxPongDelayMs,
        "Maximum pong delay is required for WebSocket keepalive monitors"
    ),
];

const validatePingMonitorFormData = (data: Partial<PingFormData>): string[] => {
    const errors: string[] = [];

    if (!data.host || typeof data.host !== "string") {
        errors.push("Host is required for ping monitors");
    } else {
        const hostResult = sharedValidateMonitorField(
            "ping",
            "host",
            data.host
        );
        errors.push(...hostResult.errors);
    }

    return errors;
};

const monitorFormValidators: MonitorFormValidatorMap = {
    "cdn-edge-consistency": validateCdnEdgeConsistencyMonitorFormData,
    dns: validateDnsMonitorFormData,
    http: validateHttpMonitorFormData,
    "http-header": validateHttpHeaderMonitorFormData,
    "http-json": validateHttpJsonMonitorFormData,
    "http-keyword": validateHttpKeywordMonitorFormData,
    "http-latency": validateHttpLatencyMonitorFormData,
    "http-status": validateHttpStatusMonitorFormData,
    ping: validatePingMonitorFormData,
    port: validatePortMonitorFormData,
    replication: validateReplicationMonitorFormData,
    "server-heartbeat": validateServerHeartbeatMonitorFormData,
    ssl: validateSslMonitorFormData,
    "websocket-keepalive": validateWebsocketKeepaliveMonitorFormData,
};

const validateMonitorFormDataByType = <TType extends MonitorType>(
    type: TType,
    data: PartialMonitorFormDataByType<TType>
): string[] => {
    const validator = monitorFormValidators[type];
    return validator(data);
};

/**
 * Validate monitor form data with only the fields that are provided. Used for
 * form validation where not all monitor fields are available yet.
 *
 * @typeParam TType - Monitor type discriminator used for schema lookup.
 *
 * @param type - Monitor type.
 * @param data - Partial monitor data from form.
 *
 * @returns Promise resolving to validation result.
 *
 * @public
 */
export async function validateMonitorFormData<TType extends MonitorType>(
    type: TType,
    data: PartialMonitorFormDataByType<TType>
): Promise<ValidationResult> {
    if (!isKnownMonitorType(type)) {
        return {
            errors: [`Unsupported monitor type: ${String(type)}`],
            success: false,
            warnings: [],
        };
    }
    return runMonitorValidationOperation(
        "Form data validation",
        {
            errors: ["Form validation failed"],
            success: false,
            warnings: [],
        },
        () => {
            const manualErrors = validateMonitorFormDataByType(type, data);

            // Form-level validation is intentionally lightweight: it focuses
            // on fields the user can edit in the current form rather than the
            // full monitor schema used by the backend. Shared Zod schemas are
            // exercised via validateMonitorDataClientSide and backend
            // validation flows.
            if (manualErrors.length > 0) {
                return {
                    errors: manualErrors,
                    success: false,
                    warnings: [],
                } satisfies ValidationResult;
            }

            return {
                errors: [],
                success: true,
                warnings: [],
            } satisfies ValidationResult;
        }
    );
}

/**
 * Type guard to check if form data is valid and complete.
 *
 * @param data - Form data to validate.
 *
 * @returns `true` if form data is valid and complete; otherwise `false`.
 *
 * @public
 */
export function isMonitorFormData(data: unknown): data is MonitorFormData {
    if (typeof data !== "object" || data === null) {
        return false;
    }

    const candidate = data as { type?: unknown };

    if (typeof candidate.type !== "string") {
        return false;
    }

    if (!isKnownMonitorType(candidate.type)) {
        return false;
    }

    const result = sharedValidateMonitorData(candidate.type, data);

    return result.success;
}

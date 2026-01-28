/**
 * Form submission handling utilities for the AddSiteForm component.
 */

import type { Monitor, MonitorType } from "@shared/types";
import type { SyntheticEvent } from "react";
import type { Simplify, UnknownRecord } from "type-fest";

import { DEFAULT_SITE_NAME } from "@shared/constants/sites";
import { withUtilityErrorHandling } from "@shared/utils/errorHandling";

import type { Logger } from "../../services/logger";
import type {
    AddSiteFormActions,
    AddSiteFormState,
} from "../SiteDetails/useAddSiteForm";

import { truncateForLogging } from "../../utils/fallbacks";
import {
    createMonitorObject,
    type PartialMonitorFormDataByType,
    validateMonitorFieldClientSide,
    validateMonitorFormData,
} from "../../utils/monitorValidation";
import {
    buildMonitorValidationFieldValues,
    type MonitorValidationFieldValues,
} from "../../utils/monitorValidationFields";

/**
 * Safely trims a string value. Returns empty string for non-strings.
 */
function safeTrim(value: unknown): string {
    return typeof value === "string" ? value.trim() : "";
}

/**
 * Store actions interface for form submission operations.
 *
 * Decouples the submission logic from specific store implementations, making
 * the code more testable and flexible.
 *
 * @public
 */
export interface StoreActions {
    /** Add a monitor to an existing site */
    addMonitorToSite: (
        siteIdentifier: string,
        monitor: Monitor
    ) => Promise<void>;
    /** Clear any existing error state */
    clearError: () => void;
    /** Create a new site with monitors */
    createSite: (siteData: {
        identifier: string;
        monitoring?: boolean;
        monitors?: Monitor[];
        name?: string;
    }) => Promise<void>;
}

/**
 * Properties interface for form submission handling.
 *
 * @remarks
 * Combines form state, actions, and store methods for the submission handler.
 *
 * @public
 */
export type FormSubmitProperties = Simplify<
    AddSiteFormState &
        Pick<AddSiteFormActions, "setFormError"> &
        StoreActions & {
            /** Precomputed monitor validation field map. */
            dynamicFieldValues?: MonitorValidationFieldValues;
            /** UUID generator function for creating unique identifiers */
            generateUuid: () => string;
            /** Logger instance for debugging and error tracking */
            logger: Logger;
            /** Optional callback executed after successful submission */
            onSuccess?: () => void;
        }
>;

const toOptionalString = (value?: string): string | undefined => {
    const trimmedValue = safeTrim(value);
    return trimmedValue.length > 0 ? trimmedValue : undefined;
};

const parseOptionalInteger = (value?: string): number | undefined => {
    const trimmedValue = safeTrim(value);
    if (trimmedValue.length === 0) {
        return undefined;
    }

    const parsed = Number.parseInt(trimmedValue, 10);
    return Number.isNaN(parsed) ? undefined : parsed;
};

type MonitorValidationBuilderMap = {
    [K in MonitorType]: (
        fields: MonitorValidationFieldValues
    ) => PartialMonitorFormDataByType<K>;
};

// NOTE: The builders below intentionally mirror the field-mapping logic in
// `buildMonitorFormData`. When adding new monitor types or fields, update both
// the validation builders and the form-data builder so that client-side
// validation and monitor creation stay in sync.
const monitorValidationBuilders: MonitorValidationBuilderMap = {
    "cdn-edge-consistency": ({
        baselineUrl,
        edgeLocations,
    }): UnknownRecord => ({
        baselineUrl: toOptionalString(baselineUrl),
        edgeLocations: toOptionalString(edgeLocations),
    }),
    dns: ({ expectedValue, host, recordType }): UnknownRecord => {
        const trimmedRecordType = safeTrim(recordType);
        const candidate = toOptionalString(expectedValue);
        const basePayload: UnknownRecord = {
            host: toOptionalString(host),
            recordType: trimmedRecordType || undefined,
        };

        if (
            trimmedRecordType.length > 0 &&
            trimmedRecordType.toUpperCase() !== "ANY" &&
            candidate !== undefined
        ) {
            return {
                ...basePayload,
                expectedValue: candidate,
            } satisfies UnknownRecord;
        }

        return basePayload;
    },
    http: ({ url }): UnknownRecord => ({
        url: toOptionalString(url),
    }),
    "http-header": ({
        expectedHeaderValue,
        headerName,
        url,
    }): UnknownRecord => ({
        expectedHeaderValue: toOptionalString(expectedHeaderValue),
        headerName: toOptionalString(headerName),
        url: toOptionalString(url),
    }),
    "http-json": ({ expectedJsonValue, jsonPath, url }): UnknownRecord => ({
        expectedJsonValue: toOptionalString(expectedJsonValue),
        jsonPath: toOptionalString(jsonPath),
        url: toOptionalString(url),
    }),
    "http-keyword": ({ bodyKeyword, url }): UnknownRecord => ({
        bodyKeyword: toOptionalString(bodyKeyword),
        url: toOptionalString(url),
    }),
    "http-latency": ({ maxResponseTime, url }): UnknownRecord => ({
        maxResponseTime: parseOptionalInteger(maxResponseTime),
        url: toOptionalString(url),
    }),
    "http-status": ({ expectedStatusCode, url }): UnknownRecord => ({
        expectedStatusCode: parseOptionalInteger(expectedStatusCode),
        url: toOptionalString(url),
    }),
    ping: ({ host }): UnknownRecord => ({
        host: toOptionalString(host),
    }),
    port: ({ host, port }): UnknownRecord => ({
        host: toOptionalString(host),
        port: parseOptionalInteger(port),
    }),
    replication: ({
        maxReplicationLagSeconds,
        primaryStatusUrl,
        replicaStatusUrl,
        replicationTimestampField,
    }): UnknownRecord => ({
        maxReplicationLagSeconds: parseOptionalInteger(
            maxReplicationLagSeconds
        ),
        primaryStatusUrl: toOptionalString(primaryStatusUrl),
        replicaStatusUrl: toOptionalString(replicaStatusUrl),
        replicationTimestampField: toOptionalString(replicationTimestampField),
    }),
    "server-heartbeat": ({
        heartbeatExpectedStatus,
        heartbeatMaxDriftSeconds,
        heartbeatStatusField,
        heartbeatTimestampField,
        url,
    }): UnknownRecord => ({
        heartbeatExpectedStatus: toOptionalString(heartbeatExpectedStatus),
        heartbeatMaxDriftSeconds: parseOptionalInteger(
            heartbeatMaxDriftSeconds
        ),
        heartbeatStatusField: toOptionalString(heartbeatStatusField),
        heartbeatTimestampField: toOptionalString(heartbeatTimestampField),
        url: toOptionalString(url),
    }),
    ssl: ({ certificateWarningDays, host, port }): UnknownRecord => ({
        certificateWarningDays: parseOptionalInteger(certificateWarningDays),
        host: toOptionalString(host),
        port: parseOptionalInteger(port),
    }),
    "websocket-keepalive": ({ maxPongDelayMs, url }): UnknownRecord => ({
        maxPongDelayMs: parseOptionalInteger(maxPongDelayMs),
        url: toOptionalString(url),
    }),
};

const monitorValidationBuilderLookup: MonitorValidationBuilderMap =
    monitorValidationBuilders;

const resolveMonitorValidationBuilder = <K extends MonitorType>(
    monitorType: K
): MonitorValidationBuilderMap[K] => {
    const candidate = monitorValidationBuilderLookup[monitorType];

    if (typeof candidate !== "function") {
        throw new TypeError(`Unsupported monitor type: ${monitorType}`);
    }

    return candidate;
};

const determineDnsExpectedValue = (
    trimmedRecordType: string,
    expectedValue?: string
): string | undefined => {
    if (trimmedRecordType.length === 0) {
        return undefined;
    }

    if (trimmedRecordType.toUpperCase() === "ANY") {
        return undefined;
    }

    return toOptionalString(expectedValue);
};

const buildMonitorFormData = (
    properties: FormSubmitProperties
): UnknownRecord => {
    const trimmedRecordType = safeTrim(properties.recordType);
    const formData: UnknownRecord = {
        baselineUrl: toOptionalString(properties.baselineUrl),
        bodyKeyword: toOptionalString(properties.bodyKeyword),
        certificateWarningDays: parseOptionalInteger(
            properties.certificateWarningDays
        ),
        checkInterval: properties.checkIntervalMs,
        edgeLocations: toOptionalString(properties.edgeLocations),
        expectedHeaderValue: toOptionalString(properties.expectedHeaderValue),
        expectedJsonValue: toOptionalString(properties.expectedJsonValue),
        expectedStatusCode: parseOptionalInteger(properties.expectedStatusCode),
        expectedValue: determineDnsExpectedValue(
            trimmedRecordType,
            properties.expectedValue
        ),
        headerName: toOptionalString(properties.headerName),
        heartbeatExpectedStatus: toOptionalString(
            properties.heartbeatExpectedStatus
        ),
        heartbeatMaxDriftSeconds: parseOptionalInteger(
            properties.heartbeatMaxDriftSeconds
        ),
        heartbeatStatusField: toOptionalString(properties.heartbeatStatusField),
        heartbeatTimestampField: toOptionalString(
            properties.heartbeatTimestampField
        ),
        host: toOptionalString(properties.host),
        jsonPath: toOptionalString(properties.jsonPath),
        maxPongDelayMs: parseOptionalInteger(properties.maxPongDelayMs),
        maxReplicationLagSeconds: parseOptionalInteger(
            properties.maxReplicationLagSeconds
        ),
        maxResponseTime: parseOptionalInteger(properties.maxResponseTimeMs),
        port: parseOptionalInteger(properties.port),
        primaryStatusUrl: toOptionalString(properties.primaryStatusUrl),
        recordType: trimmedRecordType || undefined,
        replicaStatusUrl: toOptionalString(properties.replicaStatusUrl),
        replicationTimestampField: toOptionalString(
            properties.replicationTimestampField
        ),
    };

    const sanitizedUrl = toOptionalString(properties.url);
    if (sanitizedUrl !== undefined) {
        formData["url"] = sanitizedUrl;
    }

    if (formData["expectedValue"] === undefined) {
        delete formData["expectedValue"];
    }

    return formData;
};

/**
 * Creates a monitor object based on the form data using the shared utility.
 * This ensures consistent monitor defaults and validation across the app.
 */
function createMonitor(properties: FormSubmitProperties): Monitor {
    const { checkIntervalMs, generateUuid, monitorType } = properties;
    const formData = buildMonitorFormData(properties);
    const baseMonitor = createMonitorObject(monitorType, formData);

    return {
        ...baseMonitor,
        activeOperations: [],
        checkInterval: checkIntervalMs,
        id: generateUuid(),
    };
}

/**
 * Validates the add mode selection and site information.
 *
 * @remarks
 * The {@link AddSiteForm} component performs an immediate UI-level check for a
 * missing site name when `addMode === "new"` and will block submission before
 * calling this function. This helper remains as a defensive guard for other
 * potential callers of {@link handleSubmit} (including tests) and to ensure
 * consistent error messaging when the submission utility is reused outside the
 * primary form.
 *
 * @param addMode - Mode of adding ("existing" or "new").
 * @param name - Site name for new sites.
 * @param selectedExistingSite - Selected existing site identifier.
 *
 * @returns Array of validation error messages.
 */
function validateAddMode(
    addMode: "existing" | "new",
    name: string,
    selectedExistingSite: string
): string[] {
    const errors: string[] = [];

    if (addMode === "new" && !safeTrim(name)) {
        errors.push("Site name is required");
    }

    if (addMode === "existing" && !selectedExistingSite) {
        errors.push("Please select a site to add the monitor to");
    }

    return errors;
}

/**
 * Adds monitor to existing site.
 */
async function addToExistingSite(
    properties: FormSubmitProperties,
    monitor: Monitor
): Promise<void> {
    const { addMonitorToSite, logger, selectedExistingSite } = properties;

    await addMonitorToSite(selectedExistingSite, monitor);

    logger.info("Monitor added to site successfully", {
        identifier: selectedExistingSite,
        monitorId: monitor.id,
        monitorType: monitor.type,
    });
}

/**
 * Submits a new site with monitor.
 */
async function submitNewSite(
    properties: FormSubmitProperties,
    monitor: Monitor
): Promise<void> {
    const { createSite, logger, name, siteIdentifier } = properties;

    const trimmedName = safeTrim(name);
    const siteData = {
        identifier: siteIdentifier,
        monitors: [monitor],
        name: trimmedName || DEFAULT_SITE_NAME,
    };

    await createSite(siteData);

    logger.info("Site created successfully", {
        identifier: siteIdentifier,
        monitorId: monitor.id,
        monitorType: monitor.type,
        name: trimmedName,
    });
}

/**
 * Performs the actual submission based on add mode.
 */
async function performSubmission(
    properties: FormSubmitProperties,
    monitor: Monitor
): Promise<void> {
    const { addMode, logger } = properties;

    if (addMode === "new") {
        await submitNewSite(properties, monitor);
    } else {
        await addToExistingSite(properties, monitor);
    }

    const { selectedExistingSite, siteIdentifier } = properties;
    const identifier =
        addMode === "new" ? siteIdentifier : selectedExistingSite;
    logger.info(
        `Successfully ${addMode === "new" ? "created site" : "added monitor"}: ${identifier}`
    );
}

/**
 * Validates check interval configuration using shared schema.
 *
 * @param checkIntervalMs - Check interval in milliseconds
 *
 * @returns Promise resolving to array of validation error messages
 */
async function validateCheckInterval(
    monitorType: MonitorType,
    checkIntervalMs: number
): Promise<readonly string[]> {
    return withUtilityErrorHandling(
        async () => {
            const validationResult = await validateMonitorFieldClientSide(
                monitorType,
                "checkInterval",
                checkIntervalMs
            );
            return validationResult.success ? [] : validationResult.errors;
        },
        "Validate check interval",
        [`Check interval validation failed`]
    );
}

/**
 * Validates monitor type-specific configuration using form validation.
 *
 * @param monitorType - Type of monitor
 * @param fields - Raw form field values required for validation
 *
 * @returns Promise resolving to array of validation error messages
 */
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters -- Generic preserves precise builder-to-schema linkage for each monitor type.
async function validateMonitorType<TType extends MonitorType>(
    monitorType: TType,
    fields: MonitorValidationFieldValues
): Promise<readonly string[]> {
    const builderCandidate = resolveMonitorValidationBuilder(monitorType);
    const partialData = builderCandidate(fields);
    const formData: PartialMonitorFormDataByType<TType> = {
        ...partialData,
        type: monitorType,
    };

    const result = await validateMonitorFormData(monitorType, formData);
    return result.errors;
}

/**
 * Handles form submission for adding sites or monitors.
 *
 * Performs comprehensive validation based on add mode and monitor type:
 *
 * - For new sites: validates site name and monitor configuration
 * - For existing sites: validates site selection and monitor configuration
 * - For HTTP monitors: validates URL format and protocol
 * - For port monitors: validates host and port number
 *
 * @example
 *
 * ```tsx
 * const handleFormSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
 *     handleSubmit(e, {
 *         ...formState,
 *         ...formActions,
 *         ...storeActions,
 *         generateUuid,
 *         logger,
 *         onSuccess: () => setIsVisible(false),
 *     });
 * };
 * ```
 *
 * @param event - Form submission event
 * @param properties - Form state, actions, and dependencies
 *
 * @returns Promise that resolves when submission is complete
 */
export async function handleSubmit(
    event: SyntheticEvent<HTMLFormElement>,
    properties: FormSubmitProperties
): Promise<void> {
    const {
        addMode,
        baselineUrl,
        bodyKeyword,
        certificateWarningDays,
        checkIntervalMs,
        clearError,
        dynamicFieldValues,
        edgeLocations,
        expectedHeaderValue,
        expectedJsonValue,
        expectedStatusCode,
        expectedValue,
        headerName,
        heartbeatExpectedStatus,
        heartbeatMaxDriftSeconds,
        heartbeatStatusField,
        heartbeatTimestampField,
        host,
        jsonPath,
        logger,
        maxPongDelayMs,
        maxReplicationLagSeconds,
        maxResponseTimeMs,
        monitorType,
        name,
        onSuccess,
        port,
        primaryStatusUrl,
        recordType,
        replicaStatusUrl,
        replicationTimestampField,
        selectedExistingSite,
        setFormError,
        url,
    } = properties;

    const monitorValidationFields: MonitorValidationFieldValues =
        dynamicFieldValues ?? buildMonitorValidationFieldValues(properties);

    event.preventDefault();
    setFormError("");

    // Log submission start
    logger.debug("Form submission started", {
        addMode,
        hasBaselineUrl: Boolean(safeTrim(baselineUrl)),
        hasBodyKeyword: Boolean(safeTrim(bodyKeyword)),
        hasCertificateWarningDays: Boolean(safeTrim(certificateWarningDays)),
        hasEdgeLocations: Boolean(safeTrim(edgeLocations)),
        hasExpectedHeaderValue: Boolean(safeTrim(expectedHeaderValue)),
        hasExpectedJsonValue: Boolean(safeTrim(expectedJsonValue)),
        hasExpectedStatusCode: Boolean(safeTrim(expectedStatusCode)),
        hasHeaderName: Boolean(safeTrim(headerName)),
        hasHeartbeatExpectedStatus: Boolean(safeTrim(heartbeatExpectedStatus)),
        hasHeartbeatMaxDriftSeconds: Boolean(
            safeTrim(heartbeatMaxDriftSeconds)
        ),
        hasHeartbeatStatusField: Boolean(safeTrim(heartbeatStatusField)),
        hasHeartbeatTimestampField: Boolean(safeTrim(heartbeatTimestampField)),
        hasHost: Boolean(safeTrim(host)),
        hasJsonPath: Boolean(safeTrim(jsonPath)),
        hasMaxPongDelayMs: Boolean(safeTrim(maxPongDelayMs)),
        hasMaxReplicationLagSeconds: Boolean(
            safeTrim(maxReplicationLagSeconds)
        ),
        hasMaxResponseTime: Boolean(safeTrim(maxResponseTimeMs)),
        hasName: Boolean(safeTrim(name)),
        hasPort: Boolean(safeTrim(port)),
        hasPrimaryStatusUrl: Boolean(safeTrim(primaryStatusUrl)),
        hasRecordType: Boolean(safeTrim(recordType)),
        hasReplicaStatusUrl: Boolean(safeTrim(replicaStatusUrl)),
        hasReplicationTimestampField: Boolean(
            safeTrim(replicationTimestampField)
        ),
        hasUrl: Boolean(safeTrim(url)),
        monitorType,
        selectedExistingSite: Boolean(selectedExistingSite),
    });

    const synchronousValidationErrors = validateAddMode(
        addMode,
        name,
        selectedExistingSite
    );

    if (synchronousValidationErrors.length > 0) {
        logger.debug("Form validation failed (synchronous phase)", {
            errors: synchronousValidationErrors,
            formData: {
                addMode,
                name: truncateForLogging(name),
                selectedExistingSite,
            },
        });

        setFormError(synchronousValidationErrors[0]);
        return;
    }

    // Collect asynchronous validation errors
    const validationErrors: string[] = [
        ...(await validateMonitorType(monitorType, monitorValidationFields)),
        ...(await validateCheckInterval(monitorType, checkIntervalMs)),
    ];
    logger.debug("AddSiteForm validation results", {
        addMode,
        name,
        selectedExistingSite,
        validationErrors,
    });

    // Handle validation failures
    if (validationErrors.length > 0) {
        logger.debug("Form validation failed", {
            errors: validationErrors,
            formData: {
                addMode,
                baselineUrl: truncateForLogging(baselineUrl),
                bodyKeyword: truncateForLogging(bodyKeyword),
                certificateWarningDays: truncateForLogging(
                    certificateWarningDays
                ),
                checkIntervalMs,
                edgeLocations: truncateForLogging(edgeLocations),
                expectedHeaderValue: truncateForLogging(expectedHeaderValue),
                expectedJsonValue: truncateForLogging(expectedJsonValue),
                expectedStatusCode: truncateForLogging(expectedStatusCode),
                expectedValue: truncateForLogging(expectedValue),
                headerName: truncateForLogging(headerName),
                host: truncateForLogging(host),
                jsonPath: truncateForLogging(jsonPath),
                maxResponseTimeMs: truncateForLogging(maxResponseTimeMs),
                monitorType,
                name: truncateForLogging(name),
                port,
                primaryStatusUrl: truncateForLogging(primaryStatusUrl),
                recordType: truncateForLogging(recordType),
                url: truncateForLogging(url),
            },
        });

        setFormError(validationErrors[0]); // Show first error

        return;
    }

    clearError();

    const result = await withUtilityErrorHandling(
        async () => {
            const monitor = createMonitor(properties);
            await performSubmission(properties, monitor);
            onSuccess?.();
            return true; // Success indicator
        },
        "Add site/monitor from form",
        false // Return false on failure
    );

    if (!result) {
        setFormError("Failed to add site/monitor. Please try again.");
    }
}

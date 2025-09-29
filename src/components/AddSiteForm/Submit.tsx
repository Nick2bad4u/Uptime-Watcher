/**
 * Form submission handling utilities for the AddSiteForm component.
 */

import type { Monitor, MonitorType } from "@shared/types";
import type { FormEvent } from "react";
import type { Simplify, UnknownRecord } from "type-fest";

import { withUtilityErrorHandling } from "@shared/utils/errorHandling";

import type { Logger } from "../../services/logger";
import type {
    AddSiteFormActions,
    AddSiteFormState,
} from "../SiteDetails/useAddSiteForm";

import { truncateForLogging } from "../../utils/fallbacks";
import {
    createMonitorObject,
    validateMonitorFieldClientSide,
    validateMonitorFormData,
} from "../../utils/monitorValidation";

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
    addMonitorToSite: (siteId: string, monitor: Monitor) => Promise<void>;
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
            /** UUID generator function for creating unique identifiers */
            generateUuid: () => string;
            /** Logger instance for debugging and error tracking */
            logger: Logger;
            /** Optional callback executed after successful submission */
            onSuccess?: () => void;
        }
>;

/**
 * Creates a monitor object based on the form data using the shared utility.
 * This ensures consistent monitor defaults and validation across the app.
 */
function createMonitor(properties: FormSubmitProperties): Monitor {
    const {
        baselineUrl,
        bodyKeyword,
        certificateWarningDays,
        checkInterval,
        edgeLocations,
        expectedHeaderValue,
        expectedJsonValue,
        expectedStatusCode,
        expectedValue,
        generateUuid,
        headerName,
        heartbeatExpectedStatus,
        heartbeatMaxDriftSeconds,
        heartbeatStatusField,
        heartbeatTimestampField,
        host,
        jsonPath,
        maxPongDelayMs,
        maxReplicationLagSeconds,
        maxResponseTime,
        monitorType,
        port,
        primaryStatusUrl,
        recordType,
        replicaStatusUrl,
        replicationTimestampField,
    } = properties;

    const trimmedHeaderName = safeTrim(headerName);
    const trimmedBaselineUrl = safeTrim(baselineUrl);
    const trimmedEdgeLocations = safeTrim(edgeLocations);
    const trimmedExpectedHeaderValue = safeTrim(expectedHeaderValue);
    const trimmedJsonPath = safeTrim(jsonPath);
    const trimmedExpectedJsonValue = safeTrim(expectedJsonValue);
    const trimmedMaxResponseTime = safeTrim(maxResponseTime);
    const trimmedPrimaryStatusUrl = safeTrim(primaryStatusUrl);
    const trimmedReplicaStatusUrl = safeTrim(replicaStatusUrl);
    const trimmedReplicationTimestampField = safeTrim(
        replicationTimestampField
    );
    const trimmedMaxReplicationLagSeconds = safeTrim(maxReplicationLagSeconds);
    const trimmedMaxPongDelayMs = safeTrim(maxPongDelayMs);
    const trimmedHeartbeatStatusField = safeTrim(heartbeatStatusField);
    const trimmedHeartbeatTimestampField = safeTrim(heartbeatTimestampField);
    const trimmedHeartbeatExpectedStatus = safeTrim(heartbeatExpectedStatus);
    const trimmedHeartbeatMaxDriftSeconds = safeTrim(heartbeatMaxDriftSeconds);

    const parsedMaxResponseTime = Number.parseInt(trimmedMaxResponseTime, 10);
    const maxResponseTimeValue = Number.isNaN(parsedMaxResponseTime)
        ? undefined
        : parsedMaxResponseTime;
    const parsedMaxReplicationLagSeconds = Number.parseInt(
        trimmedMaxReplicationLagSeconds || "NaN",
        10
    );
    const maxReplicationLagSecondsValue = Number.isNaN(
        parsedMaxReplicationLagSeconds
    )
        ? undefined
        : parsedMaxReplicationLagSeconds;

    const parsedMaxPongDelayMs = Number.parseInt(
        trimmedMaxPongDelayMs || "NaN",
        10
    );
    const maxPongDelayMsValue = Number.isNaN(parsedMaxPongDelayMs)
        ? undefined
        : parsedMaxPongDelayMs;
    const parsedHeartbeatMaxDriftSeconds = Number.parseInt(
        trimmedHeartbeatMaxDriftSeconds || "NaN",
        10
    );
    const heartbeatMaxDriftSecondsValue = Number.isNaN(
        parsedHeartbeatMaxDriftSeconds
    )
        ? undefined
        : parsedHeartbeatMaxDriftSeconds;

    const formData = {
        baselineUrl: trimmedBaselineUrl || undefined,
        bodyKeyword: safeTrim(bodyKeyword) || undefined,
        certificateWarningDays: certificateWarningDays
            ? Number.parseInt(certificateWarningDays, 10)
            : undefined,
        checkInterval,
        edgeLocations: trimmedEdgeLocations || undefined,
        expectedHeaderValue:
            trimmedExpectedHeaderValue.length > 0
                ? trimmedExpectedHeaderValue
                : undefined,
        expectedJsonValue:
            trimmedExpectedJsonValue.length > 0
                ? trimmedExpectedJsonValue
                : undefined,
        expectedStatusCode: expectedStatusCode
            ? Number.parseInt(expectedStatusCode, 10)
            : undefined,
        expectedValue,
        headerName:
            trimmedHeaderName.length > 0 ? trimmedHeaderName : undefined,
        heartbeatExpectedStatus:
            trimmedHeartbeatExpectedStatus.length > 0
                ? trimmedHeartbeatExpectedStatus
                : undefined,
        heartbeatMaxDriftSeconds: heartbeatMaxDriftSecondsValue,
        heartbeatStatusField:
            trimmedHeartbeatStatusField.length > 0
                ? trimmedHeartbeatStatusField
                : undefined,
        heartbeatTimestampField:
            trimmedHeartbeatTimestampField.length > 0
                ? trimmedHeartbeatTimestampField
                : undefined,
        host,
        jsonPath: trimmedJsonPath.length > 0 ? trimmedJsonPath : undefined,
        maxPongDelayMs: maxPongDelayMsValue,
        maxReplicationLagSeconds: maxReplicationLagSecondsValue,
        maxResponseTime: maxResponseTimeValue,
        port: port ? Number.parseInt(port, 10) : undefined,
        primaryStatusUrl:
            trimmedPrimaryStatusUrl.length > 0
                ? trimmedPrimaryStatusUrl
                : undefined,
        recordType,
        replicaStatusUrl:
            trimmedReplicaStatusUrl.length > 0
                ? trimmedReplicaStatusUrl
                : undefined,
        replicationTimestampField:
            trimmedReplicationTimestampField.length > 0
                ? trimmedReplicationTimestampField
                : undefined,
    };

    const baseMonitor = createMonitorObject(monitorType, formData);

    return {
        ...baseMonitor,
        activeOperations: [],
        checkInterval,
        id: generateUuid(),
    };
}

/**
 * Validates the add mode selection and site information.
 *
 * @param addMode - Mode of adding ("existing" or "new")
 * @param name - Site name for new sites
 * @param selectedExistingSite - Selected existing site identifier
 *
 * @returns Array of validation error messages
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
    const { createSite, logger, name, siteId } = properties;

    const trimmedName = safeTrim(name);
    const siteData = {
        identifier: siteId,
        monitors: [monitor],
        name: trimmedName || "Unnamed Site", // Provide default name
    };

    await createSite(siteData);

    logger.info("Site created successfully", {
        identifier: siteId,
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

    const { selectedExistingSite, siteId } = properties;
    const identifier = addMode === "new" ? siteId : selectedExistingSite;
    logger.info(
        `Successfully ${addMode === "new" ? "created site" : "added monitor"}: ${identifier}`
    );
}

/**
 * Validates check interval configuration using shared schema.
 *
 * @param checkInterval - Check interval in milliseconds
 *
 * @returns Promise resolving to array of validation error messages
 */
async function validateCheckInterval(
    checkInterval: number
): Promise<readonly string[]> {
    return withUtilityErrorHandling(
        async () => {
            const validationResult = await validateMonitorFieldClientSide(
                "http",
                "checkInterval",
                checkInterval
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
async function validateMonitorType(
    monitorType: MonitorType,
    fields: {
        baselineUrl: string;
        bodyKeyword: string;
        certificateWarningDays: string;
        edgeLocations: string;
        expectedHeaderValue: string;
        expectedJsonValue: string;
        expectedStatusCode: string;
        expectedValue: string;
        headerName: string;
        heartbeatExpectedStatus: string;
        heartbeatMaxDriftSeconds: string;
        heartbeatStatusField: string;
        heartbeatTimestampField: string;
        host: string;
        jsonPath: string;
        maxPongDelayMs: string;
        maxReplicationLagSeconds: string;
        maxResponseTime: string;
        port: string;
        primaryStatusUrl: string;
        recordType: string;
        replicaStatusUrl: string;
        replicationTimestampField: string;
        url: string;
    }
): Promise<readonly string[]> {
    const {
        baselineUrl,
        bodyKeyword,
        certificateWarningDays,
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
        maxPongDelayMs,
        maxReplicationLagSeconds,
        maxResponseTime,
        port,
        primaryStatusUrl,
        recordType,
        replicaStatusUrl,
        replicationTimestampField,
        url,
    } = fields;

    // Build form data object with only the relevant fields
    const formData: UnknownRecord = {
        type: monitorType,
    };

    // Add type-specific fields
    switch (monitorType) {
        case "cdn-edge-consistency": {
            formData["baselineUrl"] = safeTrim(baselineUrl);
            formData["edgeLocations"] = safeTrim(edgeLocations);
            break;
        }
        case "dns": {
            formData["host"] = safeTrim(host);
            formData["recordType"] = safeTrim(recordType);
            if (
                safeTrim(recordType).toUpperCase() !== "ANY" &&
                safeTrim(expectedValue)
            ) {
                formData["expectedValue"] = safeTrim(expectedValue);
            }
            break;
        }
        case "http": {
            formData["url"] = safeTrim(url);
            break;
        }
        case "http-header": {
            formData["url"] = safeTrim(url);
            formData["headerName"] = safeTrim(headerName);
            formData["expectedHeaderValue"] = safeTrim(expectedHeaderValue);
            break;
        }
        case "http-json": {
            formData["url"] = safeTrim(url);
            formData["jsonPath"] = safeTrim(jsonPath);
            formData["expectedJsonValue"] = safeTrim(expectedJsonValue);
            break;
        }
        case "http-keyword": {
            formData["url"] = safeTrim(url);
            formData["bodyKeyword"] = safeTrim(bodyKeyword);
            break;
        }
        case "http-latency": {
            formData["url"] = safeTrim(url);
            formData["maxResponseTime"] = Number.parseInt(
                safeTrim(maxResponseTime) || "NaN",
                10
            );
            break;
        }
        case "http-status": {
            formData["url"] = safeTrim(url);
            formData["expectedStatusCode"] = Number.parseInt(
                safeTrim(expectedStatusCode) || "NaN",
                10
            );
            break;
        }
        case "ping": {
            formData["host"] = safeTrim(host);
            break;
        }
        case "port": {
            formData["host"] = safeTrim(host);
            formData["port"] = Number(port);
            break;
        }
        case "replication": {
            formData["primaryStatusUrl"] = safeTrim(primaryStatusUrl);
            formData["replicaStatusUrl"] = safeTrim(replicaStatusUrl);
            formData["replicationTimestampField"] = safeTrim(
                replicationTimestampField
            );
            formData["maxReplicationLagSeconds"] = Number.parseInt(
                safeTrim(maxReplicationLagSeconds) || "NaN",
                10
            );
            break;
        }
        case "server-heartbeat": {
            formData["url"] = safeTrim(url);
            formData["heartbeatStatusField"] = safeTrim(heartbeatStatusField);
            formData["heartbeatTimestampField"] = safeTrim(
                heartbeatTimestampField
            );
            formData["heartbeatExpectedStatus"] = safeTrim(
                heartbeatExpectedStatus
            );
            formData["heartbeatMaxDriftSeconds"] = Number.parseInt(
                safeTrim(heartbeatMaxDriftSeconds) || "NaN",
                10
            );
            break;
        }
        case "ssl": {
            formData["host"] = safeTrim(host);
            formData["port"] = Number(port);
            formData["certificateWarningDays"] = Number(certificateWarningDays);
            break;
        }
        case "websocket-keepalive": {
            formData["url"] = safeTrim(url);
            formData["maxPongDelayMs"] = Number.parseInt(
                safeTrim(maxPongDelayMs) || "NaN",
                10
            );
            break;
        }
        default: {
            throw new Error(
                `Unsupported monitor type: ${monitorType as string}`
            );
        }
    }

    // Use form validation that only validates provided fields
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
 * const handleFormSubmit = (e: FormEvent) => {
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
    event: FormEvent,
    properties: FormSubmitProperties
): Promise<void> {
    const {
        addMode,
        baselineUrl,
        bodyKeyword,
        certificateWarningDays,
        checkInterval,
        clearError,
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
        maxResponseTime,
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
        hasMaxResponseTime: Boolean(safeTrim(maxResponseTime)),
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

    // Collect all validation errors
    const validationErrors: string[] = [
        ...validateAddMode(addMode, name, selectedExistingSite),
        ...(await validateMonitorType(monitorType, {
            baselineUrl,
            bodyKeyword,
            certificateWarningDays,
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
            maxPongDelayMs,
            maxReplicationLagSeconds,
            maxResponseTime,
            port,
            primaryStatusUrl,
            recordType,
            replicaStatusUrl,
            replicationTimestampField,
            url,
        })),
        ...(await validateCheckInterval(checkInterval)),
    ];

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
                checkInterval,
                edgeLocations: truncateForLogging(edgeLocations),
                expectedHeaderValue: truncateForLogging(expectedHeaderValue),
                expectedJsonValue: truncateForLogging(expectedJsonValue),
                expectedStatusCode: truncateForLogging(expectedStatusCode),
                expectedValue: truncateForLogging(expectedValue),
                headerName: truncateForLogging(headerName),
                host: truncateForLogging(host),
                jsonPath: truncateForLogging(jsonPath),
                maxResponseTime: truncateForLogging(maxResponseTime),
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

/**
 * Form submission handling utilities for the AddSiteForm component.
 */

import type { Monitor, MonitorType } from "@shared/types";
import type { SyntheticEvent } from "react";
import type { Simplify } from "type-fest";

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
import { validateAddModeSelection } from "./utils/addModeValidation";
import { resolveMonitorValidationBuilder } from "./utils/monitorValidationBuilders";
import { safeTrim } from "./utils/valueNormalization";

function withUrlField<TPayload extends object>(
    payload: TPayload,
    url: string
): TPayload & { url: string } {
    return {
        ...payload,
        url,
    };
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

/**
 * Creates a monitor object based on the form data using the shared utility.
 * This ensures consistent monitor defaults and validation across the app.
 */
function createMonitor(
    properties: FormSubmitProperties,
    fields: MonitorValidationFieldValues
): Monitor {
    const { checkIntervalMs, generateUuid, monitorType } = properties;
    const builder = resolveMonitorValidationBuilder(monitorType);
    const formData = builder(fields);

    // Historical behavior: the form always forwards the URL field into the
    // monitor creation payload, even for monitor types that primarily use
    // host/port fields. Several tests (and some UI flows) rely on this
    // consistent presence.
    const urlCandidate = safeTrim(fields.url);
    const baseMonitor = createMonitorObject(
        monitorType,
        urlCandidate.length > 0
            ? withUrlField(formData, urlCandidate)
            : formData
    );

    return {
        ...baseMonitor,
        activeOperations: [],
        checkInterval: checkIntervalMs,
        id: generateUuid(),
    };
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
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters -- Generic needed to keep `type` narrowed for exactOptionalPropertyTypes and schema typing.
async function validateMonitorType<TType extends MonitorType>(
    monitorType: TType,
    fields: MonitorValidationFieldValues
): Promise<readonly string[]> {
    const builderCandidate = resolveMonitorValidationBuilder(monitorType);
    const partialData = builderCandidate(fields);
    const formData = {
        ...partialData,
        type: monitorType,
    } as PartialMonitorFormDataByType<TType>;

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

    const synchronousValidationErrors = validateAddModeSelection({
        addMode,
        name,
        selectedExistingSite,
    });

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
            const monitor = createMonitor(properties, monitorValidationFields);
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

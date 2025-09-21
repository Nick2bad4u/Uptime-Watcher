/**
 * Form submission handling utilities for the AddSiteForm component.
 *
 * @remarks
 * Provides validation and submission logic for creating new sites or adding
 * monitors to existing sites. Supports HTTP and port monitor types with
 * comprehensive validation and error handling.
 *
 * @packageDocumentation
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
 * @remarks
 * Defines the required store methods needed for form submission. This interface
 * decouples the submission logic from specific store implementations, making
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
 * Builds monitor data object dynamically based on monitor type configuration.
 *
 * @param monitorType - Type of monitor
 * @param formData - Form data containing field values
 *
 * @returns Monitor data object with type-specific fields
 */
/**
 * Builds monitor data object with type-specific fields.
 *
 * @param monitorType - Type of monitor
 * @param formData - Form data containing field values
 *
 * @returns Monitor data object with type-specific fields
 */
/**
 * Creates a monitor object based on the form data using the shared utility.
 * This ensures consistent monitor defaults and validation across the app.
 */
function createMonitor(properties: FormSubmitProperties): Monitor {
    const {
        checkInterval,
        expectedValue,
        generateUuid,
        host,
        monitorType,
        port,
        recordType,
        url,
    } = properties;

    // Convert form data to proper types for the shared utility
    const formData = {
        checkInterval,
        expectedValue,
        host,
        port: port ? Number.parseInt(port, 10) : undefined,
        recordType,
        url,
    };

    // Use shared monitor creation utility for consistency
    const baseMonitor = createMonitorObject(monitorType, formData);

    // Add required fields that aren't included in MonitorCreationData
    return {
        ...baseMonitor,
        activeOperations: [],
        checkInterval, // Add back the checkInterval from form data
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
 * @param url - URL for HTTP monitors
 * @param host - Hostname for monitors
 * @param port - Port for port monitors
 * @param hostname - Hostname for DNS monitors
 * @param recordType - Record type for DNS monitors
 * @param expectedValue - Expected value for DNS monitors
 *
 * @returns Promise resolving to array of validation error messages
 */
async function validateMonitorType(
    monitorType: MonitorType,
    url: string,
    host: string,
    port: string,
    recordType: string,
    expectedValue: string
): Promise<readonly string[]> {
    // Build form data object with only the relevant fields
    const formData: UnknownRecord = {
        type: monitorType,
    };

    // Add type-specific fields
    switch (monitorType) {
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
        case "ping": {
            formData["host"] = safeTrim(host);
            break;
        }
        case "port": {
            formData["host"] = safeTrim(host);
            formData["port"] = Number(port);
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
        checkInterval,
        clearError,
        expectedValue,
        host,
        logger,
        monitorType,
        name,
        onSuccess,
        port,
        recordType,
        selectedExistingSite,
        setFormError,
        url,
    } = properties;

    event.preventDefault();
    setFormError("");

    // Log submission start
    logger.debug("Form submission started", {
        addMode,
        hasHost: Boolean(safeTrim(host)),
        hasName: Boolean(safeTrim(name)),
        hasPort: Boolean(safeTrim(port)),
        hasRecordType: Boolean(safeTrim(recordType)),
        hasUrl: Boolean(safeTrim(url)),
        monitorType,
        selectedExistingSite: Boolean(selectedExistingSite),
    });

    // Collect all validation errors
    const validationErrors: string[] = [
        ...validateAddMode(addMode, name, selectedExistingSite),
        ...(await validateMonitorType(
            monitorType,
            url,
            host,
            port,
            recordType,
            expectedValue
        )),
        ...(await validateCheckInterval(checkInterval)),
    ];

    // Handle validation failures
    if (validationErrors.length > 0) {
        logger.debug("Form validation failed", {
            errors: validationErrors,
            formData: {
                addMode,
                checkInterval,
                expectedValue: truncateForLogging(expectedValue),
                host: truncateForLogging(host),
                monitorType,
                name: truncateForLogging(name),
                port,
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

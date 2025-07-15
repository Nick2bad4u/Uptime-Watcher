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

import type { Logger } from "../../services/logger";
import type { Monitor, MonitorType } from "../../types";
import type { AddSiteFormState, AddSiteFormActions } from "../SiteDetails/useAddSiteForm";

import { DEFAULT_REQUEST_TIMEOUT, RETRY_CONSTRAINTS } from "../../constants";
import { logger } from "../../services";
import { validateMonitorData, getMonitorTypeConfig } from "../../utils";

/**
 * Store actions interface for form submission operations.
 *
 * @remarks
 * Defines the required store methods needed for form submission. This interface
 * decouples the submission logic from specific store implementations, making
 * the code more testable and flexible.
 */
interface StoreActions {
    /** Add a monitor to an existing site */
    addMonitorToSite: (siteId: string, monitor: Monitor) => Promise<void>;
    /** Clear any existing error state */
    clearError: () => void;
    /** Create a new site with monitors */
    createSite: (siteData: { identifier: string; monitors: Monitor[]; name?: string }) => Promise<void>;
}

/**
 * Properties interface for form submission handling.
 *
 * @remarks
 * Combines form state, actions, and store methods for the submission handler.
 */
type FormSubmitProperties = AddSiteFormState &
    Pick<AddSiteFormActions, "setFormError"> &
    StoreActions & {
        /** UUID generator function for creating unique identifiers */
        generateUuid: () => string;
        /** Logger instance for debugging and error tracking */
        logger: Logger;
        /** Optional callback executed after successful submission */
        onSuccess?: () => void;
    };

/**
 * Validates the add mode selection and site information.
 *
 * @param addMode - Mode of adding ("new" or "existing")
 * @param name - Site name for new sites
 * @param selectedExistingSite - Selected existing site identifier
 * @returns Array of validation error messages
 */
function validateAddMode(addMode: string, name: string, selectedExistingSite: string): string[] {
    const errors: string[] = [];

    if (addMode === "new" && !name.trim()) {
        errors.push("Site name is required");
    }

    if (addMode === "existing" && !selectedExistingSite) {
        errors.push("Please select a site to add the monitor to");
    }

    return errors;
}

/**
 * Builds monitor data object dynamically based on monitor type configuration.
 *
 * @param monitorType - Type of monitor
 * @param formData - Form data containing field values
 * @returns Monitor data object with type-specific fields
 */
async function buildMonitorData(
    monitorType: MonitorType,
    formData: { url: string; host: string; port: string }
): Promise<Record<string, unknown>> {
    const monitorData: Record<string, unknown> = { type: monitorType };

    try {
        const config = await getMonitorTypeConfig(monitorType);
        if (config?.fields) {
            return buildMonitorDataFromConfig(config, formData, monitorData);
        } else {
            return buildMonitorDataFallback(monitorType, formData, monitorData);
        }
    } catch (error) {
        logger.warn("Failed to get monitor config, using fallback mapping", error as Error);
        return buildMonitorDataFallback(monitorType, formData, monitorData);
    }
}

/**
 * Builds monitor data using dynamic configuration.
 */
function buildMonitorDataFromConfig(
    config: { fields: { name: string; type: string }[] },
    formData: { url: string; host: string; port: string },
    monitorData: Record<string, unknown>
): Record<string, unknown> {
    for (const field of config.fields) {
        const fieldName = field.name;
        if (fieldName in formData) {
            const value = formData[fieldName as keyof typeof formData];
            const trimmedValue = value.trim();
            if (trimmedValue) {
                // Convert value based on field type
                if (field.type === "number") {
                    // eslint-disable-next-line security/detect-object-injection -- fieldName comes from trusted monitor config
                    monitorData[fieldName] = Number(trimmedValue);
                } else {
                    // eslint-disable-next-line security/detect-object-injection -- fieldName comes from trusted monitor config
                    monitorData[fieldName] = trimmedValue;
                }
            }
        }
    }
    return monitorData;
}

/**
 * Builds monitor data using fallback hardcoded mapping.
 */
function buildMonitorDataFallback(
    monitorType: MonitorType,
    formData: { url: string; host: string; port: string },
    monitorData: Record<string, unknown>
): Record<string, unknown> {
    // Fallback to hardcoded mapping for backward compatibility and error recovery
    // This ensures the form continues to work even if the registry is unavailable
    if (monitorType === "http") {
        monitorData.url = formData.url.trim();
    }
    if (monitorType === "port") {
        monitorData.host = formData.host.trim();
        monitorData.port = Number(formData.port);
    }
    return monitorData;
}

/**
 * Validates monitor type-specific configuration using backend registry.
 *
 * @param monitorType - Type of monitor
 * @param url - URL for HTTP monitors
 * @param host - Host for port monitors
 * @param port - Port for port monitors
 * @returns Promise resolving to array of validation error messages
 */
async function validateMonitorType(monitorType: string, url: string, host: string, port: string): Promise<string[]> {
    // Build monitor data object dynamically
    const monitorData = await buildMonitorData(monitorType, { url, host, port });

    // Use backend registry validation
    const result = await validateMonitorData(monitorType, monitorData);
    return result.errors;
}

/**
 * Validates check interval configuration.
 *
 * @param checkInterval - Check interval in milliseconds
 * @returns Array of validation error messages
 */
function validateCheckInterval(checkInterval: number): string[] {
    const errors: string[] = [];

    if (!checkInterval || checkInterval <= 0) {
        errors.push("Check interval must be a positive number");
    }

    return errors;
}

/**
 * Creates a monitor object based on the form data.
 */
async function createMonitor(properties: FormSubmitProperties): Promise<Monitor> {
    const { checkInterval, generateUuid, host, monitorType, port, url } = properties;

    const monitor: Monitor = {
        checkInterval,
        history: [] as Monitor["history"],
        id: generateUuid(),
        monitoring: true, // Default to monitoring enabled
        responseTime: -1, // Sentinel value for never checked
        retryAttempts: RETRY_CONSTRAINTS.DEFAULT, // Explicit default retry attempts
        status: "pending" as const,
        timeout: DEFAULT_REQUEST_TIMEOUT, // Explicit default timeout
        type: monitorType,
    };

    // Add type-specific fields dynamically using monitor config
    const monitorData = await buildMonitorData(monitorType, { url, host, port });

    // Copy the type-specific fields to the monitor object
    for (const [key, value] of Object.entries(monitorData)) {
        if (key !== "type") {
            // Skip the type field as it's already set
            // eslint-disable-next-line security/detect-object-injection -- key comes from trusted monitor config
            (monitor as unknown as Record<string, unknown>)[key] = value;
        }
    }

    return monitor;
}

/**
 * Submits a new site with monitor.
 */
async function submitNewSite(properties: FormSubmitProperties, monitor: Monitor): Promise<void> {
    const { createSite, logger, name, siteId } = properties;

    const trimmedName = name.trim();
    const siteData = {
        identifier: siteId,
        monitors: [monitor],
        monitoring: true, // Default to monitoring enabled
        name: trimmedName || "Unnamed Site", // Provide default name
    };

    await createSite(siteData);

    logger.info("Site created successfully", {
        identifier: siteId,
        monitorId: monitor.id,
        monitorType: monitor.type,
        name: name.trim(),
    });
}

/**
 * Adds monitor to existing site.
 */
async function addToExistingSite(properties: FormSubmitProperties, monitor: Monitor): Promise<void> {
    const { addMonitorToSite, logger, selectedExistingSite } = properties;

    await addMonitorToSite(selectedExistingSite, monitor);

    logger.info("Monitor added to site successfully", {
        identifier: selectedExistingSite,
        monitorId: monitor.id,
        monitorType: monitor.type,
    });
}

/**
 * Performs the actual submission based on add mode.
 */
async function performSubmission(properties: FormSubmitProperties, monitor: Monitor): Promise<void> {
    const { addMode, logger } = properties;

    await (addMode === "new" ? submitNewSite(properties, monitor) : addToExistingSite(properties, monitor));

    const { selectedExistingSite, siteId } = properties;
    const identifier = addMode === "new" ? siteId : selectedExistingSite;
    logger.info(`Successfully ${addMode === "new" ? "created site" : "added monitor"}: ${identifier}`);
}

/**
 * Handles form submission for adding sites or monitors.
 *
 * Performs comprehensive validation based on add mode and monitor type:
 * - For new sites: validates site name and monitor configuration
 * - For existing sites: validates site selection and monitor configuration
 * - For HTTP monitors: validates URL format and protocol
 * - For port monitors: validates host and port number
 *
 * @param e - Form submission event
 * @param props - Form state, actions, and dependencies
 * @returns Promise that resolves when submission is complete
 *
 * @example
 * ```tsx
 * const handleFormSubmit = (e: React.FormEvent) => {
 *   handleSubmit(e, {
 *     ...formState,
 *     ...formActions,
 *     ...storeActions,
 *     generateUuid,
 *     logger,
 *     onSuccess: () => setIsVisible(false)
 *   });
 * };
 * ```
 */
export async function handleSubmit(event: React.FormEvent, properties: FormSubmitProperties) {
    const {
        addMode,
        checkInterval,
        clearError,
        host,
        logger,
        monitorType,
        name,
        onSuccess,
        port,
        selectedExistingSite,
        setFormError,
        url,
    } = properties;

    event.preventDefault();
    setFormError(undefined);

    // Log submission start
    logger.debug("Form submission started", {
        addMode,
        hasHost: !!host.trim(),
        hasName: !!name.trim(),
        hasPort: !!port.trim(),
        hasUrl: !!url.trim(),
        monitorType,
        selectedExistingSite: !!selectedExistingSite,
    });

    // Collect all validation errors
    const validationErrors: string[] = [
        ...validateAddMode(addMode, name, selectedExistingSite),
        ...(await validateMonitorType(monitorType, url, host, port)),
        ...validateCheckInterval(checkInterval),
    ];

    // Handle validation failures
    if (validationErrors.length > 0) {
        logger.debug("Form validation failed", {
            errors: validationErrors,
            formData: {
                addMode,
                checkInterval,
                host: host.slice(0, 50), // Truncate for privacy
                monitorType,
                name: name.slice(0, 50), // Truncate for privacy
                port,
                url: url.slice(0, 50), // Truncate for privacy
            },
        });

        setFormError(validationErrors[0]); // Show first error

        return;
    }

    clearError();

    try {
        const monitor = await createMonitor(properties);
        await performSubmission(properties, monitor);
        onSuccess?.();
    } catch (error) {
        logger.error("Failed to add site/monitor from form", error instanceof Error ? error : new Error(String(error)));
        setFormError("Failed to add site/monitor. Please try again.");
    }
}

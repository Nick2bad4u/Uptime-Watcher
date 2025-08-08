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

import { type Monitor, type MonitorType } from "@shared/types";

import { DEFAULT_REQUEST_TIMEOUT, RETRY_CONSTRAINTS } from "../../constants";
import { type Logger } from "../../services/logger";
import { withUtilityErrorHandling } from "../../utils/errorHandling";
import { truncateForLogging } from "../../utils/fallbacks";
import {
    validateMonitorFieldClientSide,
    validateMonitorFormData,
} from "../../utils/monitorValidation";
import {
    type AddSiteFormActions,
    type AddSiteFormState,
} from "../SiteDetails/useAddSiteForm";

/**
 * Properties interface for form submission handling.
 *
 * @remarks
 * Combines form state, actions, and store methods for the submission handler.
 *
 * @public
 */
export type FormSubmitProperties = AddSiteFormState &
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
 * Handles form submission for adding sites or monitors.
 *
 * Performs comprehensive validation based on add mode and monitor type:
 * - For new sites: validates site name and monitor configuration
 * - For existing sites: validates site selection and monitor configuration
 * - For HTTP monitors: validates URL format and protocol
 * - For port monitors: validates host and port number
 *
 * @param event - Form submission event
 * @param properties - Form state, actions, and dependencies
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
export async function handleSubmit(
    event: React.FormEvent,
    properties: FormSubmitProperties
): Promise<void> {
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
    setFormError("");

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
        ...(await validateCheckInterval(checkInterval)),
    ];

    // Handle validation failures
    if (validationErrors.length > 0) {
        logger.debug("Form validation failed", {
            errors: validationErrors,
            formData: {
                addMode,
                checkInterval,
                host: truncateForLogging(host),
                monitorType,
                name: truncateForLogging(name),
                port,
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
 * Builds monitor data object dynamically based on monitor type configuration.
 *
 * @param monitorType - Type of monitor
 * @param formData - Form data containing field values
 * @returns Monitor data object with type-specific fields
 */
/**
 * Builds monitor data object with type-specific fields.
 *
 * @param monitorType - Type of monitor
 * @param formData - Form data containing field values
 * @returns Monitor data object with type-specific fields
 */
/**
 * Creates monitor-specific data based on the monitor type.
 * Uses type-safe object construction instead of dynamic property assignment.
 */
function buildMonitorData(
    monitorType: MonitorType,
    formData: { host: string; port: string; url: string }
): Partial<Monitor> {
    const baseData = {
        type: monitorType,
    };

    // Build type-specific fields using discriminated unions
    switch (monitorType) {
        case "http": {
            return {
                ...baseData,
                url: formData.url.trim(),
            };
        }
        case "ping": {
            return {
                ...baseData,
                host: formData.host.trim(),
            };
        }
        case "port": {
            return {
                ...baseData,
                host: formData.host.trim(),
                port: Number(formData.port),
            };
        }
        default: {
            return baseData;
        }
    }
}

/**
 * Creates a monitor object based on the form data.
 * Uses type-safe property assignment instead of dynamic field copying.
 */
function createMonitor(properties: FormSubmitProperties): Monitor {
    const { checkInterval, generateUuid, host, monitorType, port, url } =
        properties;

    // Get type-specific monitor data
    const specificData = buildMonitorData(monitorType, { host, port, url });

    // Create monitor with all required fields and type-specific data
    const monitor: Monitor = {
        activeOperations: [],
        checkInterval,
        history: [] as Monitor["history"],
        id: generateUuid(),
        monitoring: true, // Default to monitoring enabled
        responseTime: -1, // Sentinel value for never checked
        retryAttempts: RETRY_CONSTRAINTS.DEFAULT, // Explicit default retry attempts
        status: "pending" as const,
        timeout: DEFAULT_REQUEST_TIMEOUT, // Explicit default timeout
        type: monitorType,
        // Type-safe spread of monitor-specific properties
        ...specificData,
    };

    return monitor;
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
 * Submits a new site with monitor.
 */
async function submitNewSite(
    properties: FormSubmitProperties,
    monitor: Monitor
): Promise<void> {
    const { createSite, logger, name, siteId } = properties;

    const trimmedName = name.trim();
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
        name: name.trim(),
    });
}

/**
 * Validates the add mode selection and site information.
 *
 * @param addMode - Mode of adding ("existing" or "new")
 * @param name - Site name for new sites
 * @param selectedExistingSite - Selected existing site identifier
 * @returns Array of validation error messages
 */
function validateAddMode(
    addMode: "existing" | "new",
    name: string,
    selectedExistingSite: string
): string[] {
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
 * Validates check interval configuration using shared schema.
 *
 * @param checkInterval - Check interval in milliseconds
 * @returns Promise resolving to array of validation error messages
 */
async function validateCheckInterval(checkInterval: number): Promise<string[]> {
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
 * @returns Promise resolving to array of validation error messages
 */
async function validateMonitorType(
    monitorType: MonitorType,
    url: string,
    host: string,
    port: string
): Promise<string[]> {
    // Build form data object with only the relevant fields
    const formData: Record<string, unknown> = {
        type: monitorType,
    };

    // Add type-specific fields
    switch (monitorType) {
        case "http": {
            formData["url"] = url.trim();
            break;
        }
        case "ping": {
            formData["host"] = host.trim();
            break;
        }
        case "port": {
            formData["host"] = host.trim();
            formData["port"] = Number(port);
            break;
        }
    }

    // Use form validation that only validates provided fields
    const result = await validateMonitorFormData(monitorType, formData);
    return result.errors;
}

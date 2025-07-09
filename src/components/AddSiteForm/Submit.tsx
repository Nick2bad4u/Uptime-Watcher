/**
 * Form submission handling utilities for the AddSiteForm component.
 * Provides validation and submission logic for creating new sites or adding monitors to existing sites.
 */

import validator from "validator";

import type { Logger } from "../../services/logger";
import type { Monitor } from "../../types";
import type { AddSiteFormState, AddSiteFormActions } from "./useAddSiteForm";

import { DEFAULT_REQUEST_TIMEOUT, RETRY_CONSTRAINTS } from "../../constants";

/**
 * Store actions interface for form submission.
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
 * Props interface for form submission handling.
 * Combines form state, actions, and store methods.
 */
type FormSubmitProperties = AddSiteFormState &
    Pick<AddSiteFormActions, "setFormError"> &
    StoreActions & {
        /** UUID generator function */
        generateUuid: () => string;
        /** Logger instance for debugging */
        logger: Logger;
        /** Optional callback executed after successful submission */
        onSuccess?: () => void;
    };

/**
 * Validates the add mode selection and site information.
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
 * Validates HTTP monitor configuration.
 */
function validateHttpMonitor(url: string): string[] {
    const errors: string[] = [];

    if (!url.trim()) {
        errors.push("Website URL is required for HTTP monitor");
        return errors;
    }

    const trimmedUrl = url.trim();

    if (!/^https?:\/\//i.test(trimmedUrl)) {
        errors.push("HTTP monitor requires a URL starting with http:// or https://");
        return errors;
    }

    if (
        !validator.isURL(trimmedUrl, {
            allow_protocol_relative_urls: false,
            allow_trailing_dot: false,
            allow_underscores: false,
            disallow_auth: false,
            protocols: ["http", "https"],
            require_protocol: true,
            require_valid_protocol: true,
        })
    ) {
        errors.push("Please enter a valid URL with a proper domain");
    }

    return errors;
}

/**
 * Validates port monitor configuration.
 */
function validatePortMonitor(host: string, port: string): string[] {
    const errors: string[] = [];

    if (host.trim()) {
        const trimmedHost = host.trim();
        const isValidIP = validator.isIP(trimmedHost);
        const isValidDomain = validator.isFQDN(trimmedHost, {
            allow_trailing_dot: false,
            allow_underscores: false,
        });

        if (!isValidIP && !isValidDomain) {
            errors.push("Host must be a valid IP address or domain name");
        }
    } else {
        errors.push("Host is required for port monitor");
    }

    if (!port.trim()) {
        errors.push("Port is required for port monitor");
    } else if (!validator.isPort(port.trim())) {
        errors.push("Port must be a valid port number (1-65535)");
    }

    return errors;
}

/**
 * Validates monitor type-specific configuration.
 */
function validateMonitorType(monitorType: string, url: string, host: string, port: string): string[] {
    if (monitorType === "http") {
        return validateHttpMonitor(url);
    }

    if (monitorType === "port") {
        return validatePortMonitor(host, port);
    }

    return [];
}

/**
 * Validates check interval configuration.
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
function createMonitor(properties: FormSubmitProperties): Monitor {
    const { checkInterval, generateUuid, host, monitorType, port, url } = properties;

    const monitor: Monitor = {
        checkInterval,
        history: [] as Monitor["history"],
        id: generateUuid(),
        retryAttempts: RETRY_CONSTRAINTS.DEFAULT, // Explicit default retry attempts
        status: "pending" as const,
        timeout: DEFAULT_REQUEST_TIMEOUT, // Explicit default timeout
        type: monitorType,
    };

    if (monitorType === "http") {
        monitor.url = url.trim();
        /* eslint-disable @typescript-eslint/no-unnecessary-condition -- will be adding multiple monitor types soon */
    } else if (monitorType === "port") {
        monitor.host = host.trim();
        monitor.port = Number(port);
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
        ...(trimmedName && { name: trimmedName }),
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
        ...validateMonitorType(monitorType, url, host, port),
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
        const monitor = createMonitor(properties);
        await performSubmission(properties, monitor);
        onSuccess?.();
    } catch (error) {
        logger.error("Failed to add site/monitor from form", error instanceof Error ? error : new Error(String(error)));
        setFormError("Failed to add site/monitor. Please try again.");
    }
}

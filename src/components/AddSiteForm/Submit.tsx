/**
 * Form submission handling utilities for the AddSiteForm component.
 * Provides validation and submission logic for creating new sites or adding monitors to existing sites.
 */

import validator from "validator";

import type { Logger } from "../../services/logger";
import type { Monitor } from "../../types";
import type { AddSiteFormState, AddSiteFormActions } from "./useAddSiteForm";

/**
 * Store actions interface for form submission.
 */
type StoreActions = {
    /** Add a monitor to an existing site */
    addMonitorToSite: (siteId: string, monitor: Monitor) => Promise<void>;
    /** Clear any existing error state */
    clearError: () => void;
    /** Create a new site with monitors */
    createSite: (siteData: { identifier: string; monitors: Monitor[]; name?: string }) => Promise<void>;
};

/**
 * Props interface for form submission handling.
 * Combines form state, actions, and store methods.
 */
type FormSubmitProps = AddSiteFormState &
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

export async function handleSubmit(e: React.FormEvent, props: FormSubmitProps) {
    const {
        addMode,
        addMonitorToSite,
        checkInterval,
        clearError,
        createSite,
        generateUuid,
        host,
        logger,
        monitorType,
        name,
        onSuccess,
        port,
        selectedExistingSite,
        setFormError,
        siteId,
        url,
    } = props;

    e.preventDefault();
    setFormError(undefined);

    // Comprehensive validation with logging
    const validationErrors: string[] = [];

    logger.debug("Form submission started", {
        addMode,
        hasHost: !!host.trim(),
        hasName: !!name.trim(),
        hasPort: !!port.trim(),
        hasUrl: !!url.trim(),
        monitorType,
        selectedExistingSite: !!selectedExistingSite,
    });

    // Validate based on add mode
    if (addMode === "new") {
        if (!name.trim()) {
            validationErrors.push("Site name is required");
        }
    } else if (addMode === "existing") {
        if (!selectedExistingSite) {
            validationErrors.push("Please select a site to add the monitor to");
        }
    }

    // Validate based on monitor type
    if (monitorType === "http") {
        if (!url.trim()) {
            validationErrors.push("Website URL is required for HTTP monitor");
        } else {
            const trimmedUrl = url.trim();
            if (!/^https?:\/\//i.test(trimmedUrl)) {
                validationErrors.push("HTTP monitor requires a URL starting with http:// or https://");
            } else if (
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
                validationErrors.push("Please enter a valid URL with a proper domain");
            }
        }
    } else if (monitorType === "port") {
        if (!host.trim()) {
            validationErrors.push("Host is required for port monitor");
        } else {
            const trimmedHost = host.trim();
            // Check if it's a valid IP address or domain name
            const isValidIP = validator.isIP(trimmedHost);
            const isValidDomain = validator.isFQDN(trimmedHost, {
                allow_trailing_dot: false,
                allow_underscores: false,
            });

            if (!isValidIP && !isValidDomain) {
                validationErrors.push("Host must be a valid IP address or domain name");
            }
        }

        if (!port.trim()) {
            validationErrors.push("Port is required for port monitor");
        } else if (!validator.isPort(port.trim())) {
            validationErrors.push("Port must be a valid port number (1-65535)");
        }
    }

    // Validate check interval
    if (!checkInterval || checkInterval <= 0) {
        validationErrors.push("Check interval must be a positive number");
    }

    // If validation fails, log and show errors
    if (validationErrors.length > 0) {
        logger.debug("Form validation failed", {
            errors: validationErrors,
            formData: {
                addMode,
                checkInterval,
                host: host.substring(0, 50), // Truncate for privacy
                monitorType,
                name: name.substring(0, 50), // Truncate for privacy
                port,
                url: url.substring(0, 50), // Truncate for privacy
            },
        });

        setFormError(validationErrors[0]); // Show first error
        return;
    }

    clearError();

    try {
        const identifier = addMode === "new" ? siteId : selectedExistingSite;
        const monitor: Monitor = {
            checkInterval,
            history: [] as Monitor["history"],
            id: generateUuid(),
            status: "pending" as const,
            type: monitorType,
        };

        if (monitorType === "http") {
            monitor.url = url.trim();
        } else if (monitorType === "port") {
            monitor.host = host.trim();
            monitor.port = Number(port);
        }

        if (addMode === "new") {
            const siteData = {
                identifier,
                monitors: [monitor],
                name: name.trim() || undefined,
            };

            await createSite(siteData);
            logger.info("Site created successfully", {
                identifier,
                monitorId: monitor.id,
                monitorType,
                name: name.trim(),
            });
        } else {
            await addMonitorToSite(identifier, monitor);
            logger.info("Monitor added to site successfully", {
                identifier,
                monitorId: monitor.id,
                monitorType,
            });
        }

        logger.info(`Successfully ${addMode === "new" ? "created site" : "added monitor"}: ${identifier}`);

        // Call success callback if provided (e.g., to reset form)
        onSuccess?.();
    } catch (error) {
        logger.error("Failed to add site/monitor from form", error);
        setFormError("Failed to add site/monitor. Please try again.");
    }
}

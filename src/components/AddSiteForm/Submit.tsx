import type { Logger } from "../../services/logger";
import type { Monitor } from "../../types";
import type { AddSiteFormState, AddSiteFormActions } from "./useAddSiteForm";

// Better typed form props using our hook interfaces
type StoreActions = {
    addMonitorToSite: (siteId: string, monitor: Monitor) => Promise<void>;
    clearError: () => void;
    createSite: (siteData: { identifier: string; monitors: Monitor[]; name?: string }) => Promise<void>;
};

type FormSubmitProps = AddSiteFormState &
    Pick<AddSiteFormActions, "setFormError"> &
    StoreActions & {
        generateUuid: () => string;
        logger: Logger; // Now properly typed!
        onSuccess?: () => void; // Optional callback after successful submission
    };

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
            } else {
                try {
                    new URL(trimmedUrl);
                } catch {
                    validationErrors.push("Please enter a valid URL");
                }
            }
        }
    } else if (monitorType === "port") {
        if (!host.trim()) {
            validationErrors.push("Host is required for port monitor");
        }
        if (!port.trim()) {
            validationErrors.push("Port is required for port monitor");
        } else {
            const portNum = Number(port);
            if (!Number.isInteger(portNum) || portNum < 1 || portNum > 65535) {
                validationErrors.push("Port must be a number between 1 and 65535");
            }
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
            logger.site.added(identifier);
            logger.user.action("Added site", {
                identifier,
                monitorId: monitor.id,
                monitorType,
                name: name.trim(),
            });
        } else {
            await addMonitorToSite(identifier, monitor);
            logger.user.action("Added monitor to site", {
                identifier,
                monitorId: monitor.id,
                monitorType,
            });
        }

        logger.info(`Successfully ${addMode === "new" ? "created site" : "added monitor"}: ${identifier}`);

        // Call success callback if provided (e.g., to reset form)
        onSuccess?.();
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error("Failed to add site/monitor from form", error);
        logger.user.action("Form submission failed", {
            addMode,
            error: errorMessage,
            monitorType,
        });
        setFormError("Failed to add site/monitor. Please try again.");
    }
}

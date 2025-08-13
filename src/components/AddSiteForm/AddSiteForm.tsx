/**
 * AddSiteForm component for creating new sites and adding monitors to existing
 * sites.
 *
 * @remarks
 * - Provides a comprehensive form with validation and flexible configuration
 * options. - Supports both HTTP and port monitoring types, with customizable
 * check intervals. - Uses domain-specific Zustand stores for state management.
 * - Loads monitor types dynamically from the backend.
 * - Handles errors via a centralized error store and logger.
 * - All form state is managed via the {@link useAddSiteForm} custom hook.
 *
 * @packageDocumentation
 */

import { BASE_MONITOR_TYPES, type MonitorType } from "@shared/types";
import React, { useCallback } from "react";

import { CHECK_INTERVALS } from "../../constants";
import { useDelayedButtonLoading } from "../../hooks/useDelayedButtonLoading";
import { useDynamicHelpText } from "../../hooks/useDynamicHelpText";
import { useMonitorTypes } from "../../hooks/useMonitorTypes";
import logger from "../../services/logger";
import { useErrorStore } from "../../stores/error/useErrorStore";
import { useSitesStore } from "../../stores/sites/useSitesStore";
import ThemedBox from "../../theme/components/ThemedBox";
import ThemedButton from "../../theme/components/ThemedButton";
import ThemedText from "../../theme/components/ThemedText";
import { generateUuid } from "../../utils/data/generateUuid";
import { ErrorAlert } from "../common/ErrorAlert/ErrorAlert";
import { useAddSiteForm } from "../SiteDetails/useAddSiteForm";
import DynamicMonitorFields from "./DynamicMonitorFields";
import RadioGroup from "./RadioGroup";
import SelectField from "./SelectField";
import { handleSubmit } from "./Submit";
import TextField from "./TextField";

/**
 * Props for the AddSiteForm component.
 * @public
 */
export interface AddSiteFormProperties {
    /** Optional callback to execute on successful form submission */
    readonly onSuccess?: () => void;
}

/**
 * Supported add modes for the form.
 * @public
 */
type AddMode = "existing" | "new";

/**
 * Type-safe validation for add mode values.
 *
 * @param value - The value to validate as an add mode.
 * @returns True if the value is a valid {@link AddMode}, otherwise false.
 *
 * @example
 * ```typescript
 * isValidAddMode("new"); // true
 * isValidAddMode("invalid"); // false
 * ```
 */
function isValidAddMode(value: string): value is AddMode {
    return value === "existing" || value === "new";
}

/**
 * Type-safe validation for monitor type values.
 *
 * @param value - The value to validate as a monitor type.
 * @returns True if the value is a valid {@link MonitorType}, otherwise false.
 *
 * @remarks
 * Checks against {@link BASE_MONITOR_TYPES} for allowed types.
 */
function isValidMonitorType(value: string): value is MonitorType {
    return BASE_MONITOR_TYPES.includes(value as MonitorType);
}

/**
 * Main form component for adding new monitoring sites or monitors.
 *
 * @remarks
 * - Allows creation of new sites with monitors, or adding monitors to existing
 * sites. - Supports HTTP and port monitoring, with dynamic fields based on
 * monitor type. - Handles form validation, error display, and loading states.
 * - Uses Zustand stores for state and error management.
 * - Loads monitor types from backend and displays dynamic help text.
 *
 * @param props - AddSiteForm component props
 * @returns The rendered AddSiteForm JSX element.
 *
 * @example
 * ```tsx
 * <AddSiteForm onSuccess={() => console.log('Site added!')} />
 * ```
 */
export const AddSiteForm: React.NamedExoticComponent<AddSiteFormProperties> =
    React.memo(function AddSiteForm({ onSuccess }: AddSiteFormProperties) {
        // Combine store calls to avoid duplicates and improve performance
        const { clearError, isLoading, lastError } = useErrorStore();
        const { addMonitorToSite, createSite, sites } = useSitesStore();

        // Load monitor types from backend
        const {
            isLoading: isLoadingMonitorTypes,
            options: monitorTypeOptions,
        } = useMonitorTypes();

        // Use our custom hook for form state management
        const formState = useAddSiteForm();
        const {
            addMode,
            checkInterval,
            formError,
            host,
            monitorType,
            name,
            port,
            resetForm,
            selectedExistingSite,
            setAddMode,
            setCheckInterval,
            setFormError,
            setHost,
            setMonitorType,
            setName,
            setPort,
            setSelectedExistingSite,
            setUrl,
            siteId,
            url,
        } = formState;

        // Get dynamic help text for the current monitor type
        const helpTexts = useDynamicHelpText(monitorType);

        // Memoized handlers for form field changes
        const handleMonitorTypeChange = useCallback(
            (value: string) => {
                if (isValidMonitorType(value)) {
                    setMonitorType(value);
                } else {
                    logger.error(`Invalid monitor type value: ${value}`);
                }
            },
            [setMonitorType]
        );

        const handleCheckIntervalChange = useCallback(
            (value: string) => {
                const numericValue = Number(value);
                if (Number.isNaN(numericValue)) {
                    logger.error(`Invalid check interval value: ${value}`);
                } else {
                    setCheckInterval(numericValue);
                }
            },
            [setCheckInterval]
        );

        // Combined success callback that resets form and calls prop callback
        const handleSuccess = useCallback(() => {
            resetForm();
            onSuccess?.();
        }, [onSuccess, resetForm]);

        // Delayed loading state for button spinner (managed by custom hook)
        const showButtonLoading = useDelayedButtonLoading(isLoading);

        /**
         * Handles form submission for adding a site or monitor.
         *
         * @param event - The form submission event.
         * @remarks
         * Delegates to {@link handleSubmit} with all relevant form state and
         * handlers.
         */
        const onSubmit = useCallback(
            async (event: React.FormEvent) => {
                try {
                    await handleSubmit(event, {
                        addMode,
                        addMonitorToSite,
                        checkInterval,
                        clearError,
                        createSite,
                        formError,
                        generateUuid,
                        host,
                        logger,
                        monitorType,
                        name,
                        onSuccess: handleSuccess,
                        port,
                        selectedExistingSite,
                        setFormError,
                        siteId,
                        url,
                    });
                } catch (error) {
                    console.error("Form submission failed:", error);
                    // Form error handling is already managed by handleSubmit
                }
            },
            [
                addMode,
                addMonitorToSite,
                checkInterval,
                clearError,
                createSite,
                formError,
                handleSuccess,
                host,
                monitorType,
                name,
                port,
                selectedExistingSite,
                setFormError,
                siteId,
                url,
            ]
        );

        /**
         * Handles form submission events for the form element.
         *
         * @param e - The form submission event
         */
        const handleFormSubmit = useCallback(
            (e: React.FormEvent) => {
                e.preventDefault();
                void onSubmit(e);
            },
            [onSubmit]
        );
        const onClearError = useCallback(() => {
            clearError();
            setFormError(undefined);
        }, [clearError, setFormError]);

        // Memoized callbacks for form components to optimize re-renders
        const handleAddModeChange = useCallback(
            (value: string) => {
                if (isValidAddMode(value)) {
                    setAddMode(value);
                } else {
                    logger.error(`Invalid add mode value: ${value}`);
                }
            },
            [setAddMode]
        );

        // Memoized options arrays to prevent unnecessary re-renders
        const addModeOptions = React.useMemo(
            () => [
                { label: "Create New Site", value: "new" },
                { label: "Add to Existing Site", value: "existing" },
            ],
            []
        );

        const checkIntervalOptions = React.useMemo(
            () =>
                CHECK_INTERVALS.map((interval) => ({
                    label: interval.label,
                    value: interval.value,
                })),
            []
        );

        return (
            <ThemedBox
                className="mx-auto max-w-md"
                padding="lg"
                rounded="lg"
                surface="base"
            >
                <form className="space-y-4" onSubmit={handleFormSubmit}>
                    {/* Add mode toggle */}
                    <RadioGroup
                        disabled={isLoading}
                        id="addMode"
                        label="Add Mode"
                        name="addMode"
                        onChange={handleAddModeChange}
                        options={addModeOptions}
                        value={addMode}
                    />

                    {/* Existing site selector */}
                    {addMode === "existing" && (
                        <SelectField
                            disabled={isLoading}
                            id="selectedSite"
                            label="Select Site"
                            onChange={setSelectedExistingSite}
                            options={sites.map((site) => ({
                                label: site.name,
                                value: site.identifier,
                            }))}
                            placeholder="-- Select a site --"
                            required
                            value={selectedExistingSite}
                        />
                    )}

                    {/* Site Name (only for new site) */}
                    {addMode === "new" && (
                        <TextField
                            disabled={isLoading}
                            id="siteName"
                            label="Site Name"
                            onChange={setName}
                            placeholder="My Website"
                            required
                            type="text"
                            value={name}
                        />
                    )}

                    {/* Show generated UUID (for new site) */}
                    {addMode === "new" && (
                        <div>
                            <ThemedText
                                className="block select-all"
                                size="xs"
                                variant="tertiary"
                            >
                                Site Identifier:{" "}
                                <span className="font-mono">{siteId}</span>
                            </ThemedText>
                        </div>
                    )}

                    {/* Monitor Type Selector */}
                    <SelectField
                        disabled={isLoading || isLoadingMonitorTypes}
                        id="monitorType"
                        label="Monitor Type"
                        onChange={handleMonitorTypeChange}
                        options={monitorTypeOptions}
                        value={monitorType}
                    />

                    {/* Dynamic Monitor Fields */}
                    <DynamicMonitorFields
                        isLoading={isLoading}
                        monitorType={monitorType}
                        onChange={{
                            host: (value: number | string) => {
                                setHost(String(value));
                            },
                            port: (value: number | string) => {
                                setPort(String(value));
                            },
                            url: (value: number | string) => {
                                setUrl(String(value));
                            },
                        }}
                        values={{
                            host: host,
                            port: port,
                            url: url,
                        }}
                    />

                    <SelectField
                        disabled={isLoading}
                        id="checkInterval"
                        label="Check Interval"
                        onChange={handleCheckIntervalChange}
                        options={checkIntervalOptions}
                        value={checkInterval}
                    />

                    <ThemedButton
                        disabled={isLoading}
                        fullWidth
                        loading={showButtonLoading}
                        type="submit"
                        variant="primary"
                    >
                        {addMode === "new" ? "Add Site" : "Add Monitor"}
                    </ThemedButton>

                    {/* Error Message */}
                    {(lastError ?? formError) ? (
                        <ErrorAlert
                            message={formError ?? lastError ?? ""}
                            onDismiss={onClearError}
                            variant="error"
                        />
                    ) : null}

                    <div className="space-y-1">
                        <ThemedText size="xs" variant="tertiary">
                            •{" "}
                            {addMode === "new"
                                ? "Site name is required"
                                : "Select a site to add the monitor to"}
                        </ThemedText>
                        {helpTexts.primary ? (
                            <ThemedText size="xs" variant="tertiary">
                                • {helpTexts.primary}
                            </ThemedText>
                        ) : null}
                        {helpTexts.secondary ? (
                            <ThemedText size="xs" variant="tertiary">
                                • {helpTexts.secondary}
                            </ThemedText>
                        ) : null}
                        <ThemedText size="xs" variant="tertiary">
                            • The monitor will be checked according to your
                            monitoring interval
                        </ThemedText>
                    </div>
                </form>
            </ThemedBox>
        );
    });

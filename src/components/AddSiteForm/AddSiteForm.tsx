/**
 * AddSiteForm component for creating new sites and adding monitors to existing sites.
 * Provides a comprehensive form with validation and flexible configuration options.
 * Supports both HTTP and port monitoring types, with customizable check intervals.
 */

import React, { useState, useEffect, useCallback } from "react";

import { UI_DELAYS, CHECK_INTERVALS } from "../../constants";
import { logger } from "../../services";
import { useErrorStore, useSitesStore } from "../../stores";
import { ThemedBox, ThemedText, ThemedButton, useTheme } from "../../theme";
import { generateUuid } from "../../utils/data/generateUuid";
import { TextField, SelectField, RadioGroup } from "./FormFields";
import { useDynamicHelpText } from "../common/MonitorUiComponents";
import { DynamicMonitorFields } from "./DynamicMonitorFields";
import { handleSubmit } from "./Submit";
import { useAddSiteForm } from "../SiteDetails/useAddSiteForm";
import { useMonitorTypes } from "../../hooks/useMonitorTypes";

/**
 * Main form component for adding new monitoring sites or monitors.
 *
 * Features:
 * - Create new sites with monitors
 * - Add monitors to existing sites
 * - Support for HTTP and port monitoring
 * - Form validation and error handling
 * - Configurable check intervals
 * - Responsive design with loading states
 *
 * The component uses a custom hook (useAddSiteForm) for state management
 * and modular sub-components for form fields and submission handling.
 *
 * @returns JSX element containing the complete add site form
 */
export const AddSiteForm = React.memo(function AddSiteForm() {
    const { clearError, lastError } = useErrorStore();
    const { addMonitorToSite, createSite, sites } = useSitesStore();
    const { isLoading } = useErrorStore();
    const { isDark } = useTheme();

    // Load monitor types from backend
    const { options: monitorTypeOptions, isLoading: isLoadingMonitorTypes } = useMonitorTypes();

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

    // Delayed loading state for button spinner (100ms delay)
    const [showButtonLoading, setShowButtonLoading] = useState(false);

    useEffect(() => {
        if (!isLoading) {
            setShowButtonLoading(false);
            return () => {}; // Return empty cleanup function for consistency
        }

        const timeoutId = setTimeout(() => {
            setShowButtonLoading(true);
        }, UI_DELAYS.LOADING_BUTTON);

        return () => clearTimeout(timeoutId);
    }, [isLoading]);

    // Memoized submit handler
    const onSubmit = useCallback(
        (event: React.FormEvent) =>
            handleSubmit(event, {
                ...formState,
                addMonitorToSite,
                clearError,
                createSite,
                generateUuid,
                logger,
                onSuccess: resetForm, // Reset form on successful submission
            }),
        [formState, addMonitorToSite, clearError, createSite, resetForm]
    );

    // Memoized error clear handler
    const onClearError = useCallback(() => {
        clearError();
        setFormError(undefined);
    }, [clearError, setFormError]);

    return (
        <ThemedBox className="max-w-md mx-auto" padding="lg" rounded="lg" surface="base">
            <form
                className="space-y-4"
                onSubmit={(e) => {
                    e.preventDefault();
                    void onSubmit(e);
                }}
            >
                {/* Add mode toggle */}
                <RadioGroup
                    disabled={isLoading}
                    id="addMode"
                    label="Add Mode"
                    name="addMode"
                    onChange={(value) => setAddMode(value as "new" | "existing")}
                    options={[
                        { label: "Create New Site", value: "new" },
                        { label: "Add to Existing Site", value: "existing" },
                    ]}
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
                        <ThemedText className="block select-all" size="xs" variant="tertiary">
                            Site Identifier: <span className="font-mono">{siteId}</span>
                        </ThemedText>
                    </div>
                )}

                {/* Monitor Type Selector */}
                <SelectField
                    disabled={isLoading || isLoadingMonitorTypes}
                    id="monitorType"
                    label="Monitor Type"
                    onChange={(value) => setMonitorType(value)}
                    options={monitorTypeOptions}
                    value={monitorType}
                />

                {/* Dynamic Monitor Fields */}
                <DynamicMonitorFields
                    monitorType={monitorType}
                    values={{
                        url: url,
                        host: host,
                        port: port,
                    }}
                    onChange={{
                        url: (value: string | number) => setUrl(String(value)),
                        host: (value: string | number) => setHost(String(value)),
                        port: (value: string | number) => setPort(String(value)),
                    }}
                    isLoading={isLoading}
                />

                <SelectField
                    disabled={isLoading}
                    id="checkInterval"
                    label="Check Interval"
                    onChange={(value) => setCheckInterval(Number(value))}
                    options={CHECK_INTERVALS.map((interval) => ({
                        label: interval.label,
                        value: interval.value,
                    }))}
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
                {(lastError ?? formError) && (
                    <ThemedBox
                        className={`error-alert ${isDark ? "dark" : ""}`}
                        padding="md"
                        rounded="md"
                        surface="base"
                    >
                        <div className="flex items-center">
                            <ThemedText className={`error-alert__text ${isDark ? "dark" : ""}`} size="sm">
                                ❌ {formError ?? lastError}
                            </ThemedText>
                            <ThemedButton
                                className={`error-alert__close ${isDark ? "dark" : ""}`}
                                onClick={onClearError}
                                size="xs"
                                variant="secondary"
                            >
                                ✕
                            </ThemedButton>
                        </div>
                    </ThemedBox>
                )}

                <div className="space-y-1">
                    <ThemedText size="xs" variant="tertiary">
                        • {addMode === "new" ? "Site name is required" : "Select a site to add the monitor to"}
                    </ThemedText>
                    {helpTexts.primary && (
                        <ThemedText size="xs" variant="tertiary">
                            • {helpTexts.primary}
                        </ThemedText>
                    )}
                    {helpTexts.secondary && (
                        <ThemedText size="xs" variant="tertiary">
                            • {helpTexts.secondary}
                        </ThemedText>
                    )}
                    <ThemedText size="xs" variant="tertiary">
                        • The monitor will be checked according to your monitoring interval
                    </ThemedText>
                </div>
            </form>
        </ThemedBox>
    );
});

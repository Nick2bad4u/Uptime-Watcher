import { useState, useEffect, useCallback } from "react";

import { UI_DELAYS, CHECK_INTERVALS } from "../../constants";
import logger from "../../services/logger";
import { useStore } from "../../store";
import { ThemedBox, ThemedText, ThemedButton } from "../../theme/components";
import { useTheme } from "../../theme/useTheme";
import { generateUuid } from "../../utils/data/generateUuid";
import { TextField, SelectField, RadioGroup } from "./FormFields";
import { handleSubmit } from "./Submit";
import { useAddSiteForm } from "./useAddSiteForm";

export function AddSiteForm() {
    const { addMonitorToSite, clearError, createSite, isLoading, lastError, sites } = useStore();
    const { isDark } = useTheme();

    // Use our custom hook for form state management
    const formState = useAddSiteForm();
    const {
        addMode,
        checkInterval,
        formError,
        host,
        isFormValid,
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

    // Delayed loading state for button spinner (100ms delay)
    const [showButtonLoading, setShowButtonLoading] = useState(false);

    useEffect(() => {
        if (isLoading) {
            const timeoutId = setTimeout(() => {
                setShowButtonLoading(true);
            }, UI_DELAYS.LOADING_BUTTON);
            return () => clearTimeout(timeoutId);
        } else {
            setShowButtonLoading(false);
        }
    }, [isLoading]);

    // Memoized submit handler
    const onSubmit = useCallback(
        (e: React.FormEvent) =>
            handleSubmit(e, {
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

    return (
        <ThemedBox className="max-w-md mx-auto" padding="lg" rounded="lg" surface="base">
            <form className="space-y-4" onSubmit={onSubmit}>
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
                            label: site.name || site.identifier,
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
                    disabled={isLoading}
                    id="monitorType"
                    label="Monitor Type"
                    onChange={(value) => setMonitorType(value as "http" | "port")}
                    options={[
                        { label: "HTTP (Website/API)", value: "http" },
                        { label: "Port (Host/Port)", value: "port" },
                    ]}
                    value={monitorType}
                />

                {/* HTTP Monitor Fields */}
                {monitorType === "http" && (
                    <TextField
                        disabled={isLoading}
                        helpText="Enter the full URL including http:// or https://"
                        id="websiteUrl"
                        label="Website URL"
                        onChange={setUrl}
                        placeholder="https://example.com"
                        required
                        type="url"
                        value={url}
                    />
                )}

                {/* Port Monitor Fields */}
                {monitorType === "port" && (
                    <div className="flex flex-col gap-2">
                        <TextField
                            disabled={isLoading}
                            helpText="Enter a valid host (domain or IP)"
                            id="host"
                            label="Host"
                            onChange={setHost}
                            placeholder="example.com or 192.168.1.1"
                            required
                            type="text"
                            value={host}
                        />
                        <TextField
                            disabled={isLoading}
                            helpText="Enter a port number (1-65535)"
                            id="port"
                            label="Port"
                            max={65535}
                            min={1}
                            onChange={setPort}
                            placeholder="80"
                            required
                            type="number"
                            value={port}
                        />
                    </div>
                )}

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
                    disabled={!isFormValid || isLoading}
                    fullWidth
                    loading={showButtonLoading}
                    type="submit"
                    variant="primary"
                >
                    {addMode === "new" ? "Add Site" : "Add Monitor"}
                </ThemedButton>

                {/* Error Message */}
                {(lastError || formError) && (
                    <ThemedBox
                        className={`error-alert ${isDark ? "dark" : ""}`}
                        padding="md"
                        rounded="md"
                        surface="base"
                    >
                        <div className="flex items-center">
                            <ThemedText className={`error-alert__text ${isDark ? "dark" : ""}`} size="sm">
                                ❌ {formError || lastError}
                            </ThemedText>
                            <ThemedButton
                                className={`error-alert__close ${isDark ? "dark" : ""}`}
                                onClick={() => {
                                    clearError();
                                    setFormError(undefined);
                                }}
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
                    {monitorType === "http" && (
                        <ThemedText size="xs" variant="tertiary">
                            • Enter the full URL including http:// or https://
                        </ThemedText>
                    )}
                    {monitorType === "port" && (
                        <>
                            <ThemedText size="xs" variant="tertiary">
                                • Enter a valid host (domain or IP)
                            </ThemedText>
                            <ThemedText size="xs" variant="tertiary">
                                • Enter a port number (1-65535)
                            </ThemedText>
                        </>
                    )}
                    <ThemedText size="xs" variant="tertiary">
                        • The monitor will be checked according to your monitoring interval
                    </ThemedText>
                </div>
            </form>
        </ThemedBox>
    );
}

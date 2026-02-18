import type { NamedExoticComponent, SyntheticEvent } from "react";

import { BASE_MONITOR_TYPES, type MonitorType } from "@shared/types";
import { ensureError } from "@shared/utils/errorHandling";
import { memo, useCallback, useMemo, useState } from "react";

import { CHECK_INTERVALS } from "../../constants";
import { useDelayedButtonLoading } from "../../hooks/useDelayedButtonLoading";
import { useDynamicHelpText } from "../../hooks/useDynamicHelpText";
import { useMonitorTypes } from "../../hooks/useMonitorTypes";
import { logger } from "../../services/logger";
import {
    selectClearError,
    selectErrorIsLoading,
    selectLastError,
} from "../../stores/error/selectors";
import { useErrorStore } from "../../stores/error/useErrorStore";
import {
    selectAddMonitorToSite,
    selectCreateSite,
    selectSites,
} from "../../stores/sites/selectors";
import { useSitesStore } from "../../stores/sites/useSitesStore";
import { ThemedButton } from "../../theme/components/ThemedButton";
import { ThemedText } from "../../theme/components/ThemedText";
import { generateUuid } from "../../utils/data/generateUuid";
import { AppIcons } from "../../utils/icons";
import { buildMonitorValidationFieldValues } from "../../utils/monitorValidationFields";
import { ErrorAlert } from "../common/ErrorAlert/ErrorAlert";
import { SurfaceContainer } from "../shared/SurfaceContainer";
import { type FormMode, useAddSiteForm } from "../SiteDetails/useAddSiteForm";
import { DynamicMonitorFields } from "./DynamicMonitorFields";
import { RadioGroup } from "./RadioGroup";
import { SelectField } from "./SelectField";
import { handleSubmit } from "./Submit";
import { TextField } from "./TextField";
import "./AddSiteForm.css";
import { createDynamicFieldChangeHandlers } from "./utils/dynamicFieldChangeHandlers";
import {
    buildAddSiteFormHelperBullets,
    type HelperBullet,
} from "./utils/helperBullets";

/**
 * Props accepted by the {@link AddSiteForm} component.
 *
 * @public
 */
export interface AddSiteFormProperties {
    /** Optional callback invoked after a successful submission. */
    readonly onSuccess?: () => void;
}

const MONITOR_TYPE_SET = new Set<string>(BASE_MONITOR_TYPES);
const SITE_NAME_REQUIRED_MESSAGE = "Site name is required";

/**
 * Type guard that validates whether a candidate string is a supported monitor
 * type.
 *
 * @param value - Candidate value provided by the user.
 *
 * @returns True if the value is a valid {@link MonitorType}.
 */
const isValidMonitorType = (value: string): value is MonitorType =>
    MONITOR_TYPE_SET.has(value);

/**
 * Type guard verifying whether the provided string matches a supported form
 * mode.
 *
 * @param value - Candidate form mode.
 *
 * @returns True when the value is "existing" or "new".
 */
const isValidAddMode = (value: string): value is FormMode =>
    value === "existing" || value === "new";

const SiteTargetIcon = AppIcons.ui.link;
const MonitorConfigIcon = AppIcons.metrics.monitor;
const HelperInfoIcon = AppIcons.ui.info;

/**
 * AddSiteForm component for creating new sites and adding monitors to existing
 * sites.
 *
 * @remarks
 * -
 *
 * Provides a comprehensive form with validation and flexible configuration
 * options.
 *
 * - Supports both HTTP and port monitoring types with customizable intervals.
 * - Uses domain-specific Zustand stores for state management.
 * - Loads monitor types dynamically from the backend.
 * - Handles errors via a centralized error store and logger.
 * - All form state is managed via the {@link useAddSiteForm} custom hook.
 *
 * @example Basic usage
 *
 * ```tsx
 * import { logger } from "@app/services/logger";
 *
 * useEffect(
 *     function clearSiteNameErrorOnInput() {
 *         if (formError === SITE_NAME_REQUIRED_MESSAGE && !isNameMissing) {
 *             setFormError(undefined);
 *         }
 *     },
 *     [formError, isNameMissing, setFormError]
 * );
 * <AddSiteForm onSuccess={() => logger.info("Site added")} />;
 * ```
 *
 * @example Layout structure
 *
 * ```tsx
 * <div className="add-site-form__layout">
 *     <section className="add-site-form__section">
 *         <header className="add-site-form__section-header">
 *             <ThemedText size="md" weight="semibold">
 *                 Site Target
 *             </ThemedText>
 *             <ThemedText size="xs" variant="secondary">
 *                 Configure monitoring for a new property or link
 *                 additional monitors to an existing site.
 *             </ThemedText>
 *         </header>
 *     </section>
 * </div>;
 * ```
 *
 * @param props - AddSiteForm component props
 *
 * @returns The rendered AddSiteForm JSX element.
 */

export const AddSiteForm: NamedExoticComponent<AddSiteFormProperties> = memo(
    function AddSiteFormComponent({ onSuccess }: AddSiteFormProperties) {
        // Subscribe only to the fields we actually use, otherwise this form
        // rerenders on unrelated store updates.
        const clearError = useErrorStore(selectClearError);
        const isLoading = useErrorStore(selectErrorIsLoading);
        const lastError = useErrorStore(selectLastError);

        const addMonitorToSite = useSitesStore(selectAddMonitorToSite);
        const createSite = useSitesStore(selectCreateSite);
        const sites = useSitesStore(selectSites);

        // Load monitor types from backend
        const {
            isLoading: isLoadingMonitorTypes,
            options: monitorTypeOptions,
        } = useMonitorTypes();

        const formState = useAddSiteForm();
        const {
            addMode,
            baselineUrl,
            bodyKeyword,
            certificateWarningDays,
            checkIntervalMs,
            edgeLocations,
            expectedHeaderValue,
            expectedJsonValue,
            expectedStatusCode,
            expectedValue,
            formError,
            headerName,
            heartbeatExpectedStatus,
            heartbeatMaxDriftSeconds,
            heartbeatStatusField,
            heartbeatTimestampField,
            host,
            jsonPath,
            maxPongDelayMs,
            maxReplicationLagSeconds,
            maxResponseTimeMs,
            monitorFieldsError,
            monitorType,
            name,
            port,
            primaryStatusUrl,
            recordType,
            replicaStatusUrl,
            replicationTimestampField,
            resetForm,
            selectedExistingSite,
            setAddMode,
            setBaselineUrl,
            setBodyKeyword,
            setCertificateWarningDays,
            setCheckIntervalMs,
            setEdgeLocations,
            setExpectedHeaderValue,
            setExpectedJsonValue,
            setExpectedStatusCode,
            setExpectedValue,
            setFormError,
            setHeaderName,
            setHeartbeatExpectedStatus,
            setHeartbeatMaxDriftSeconds,
            setHeartbeatStatusField,
            setHeartbeatTimestampField,
            setHost,
            setJsonPath,
            setMaxPongDelayMs,
            setMaxReplicationLagSeconds,
            setMaxResponseTimeMs,
            setMonitorType,
            setName,
            setPort,
            setPrimaryStatusUrl,
            setRecordType,
            setReplicaStatusUrl,
            setReplicationTimestampField,
            setSelectedExistingSite,
            setUrl,
            siteIdentifier,
            url,
        } = formState;

        const [hasSubmitted, setHasSubmitted] = useState(false);

        // Get dynamic help text for the current monitor type
        const helpTexts = useDynamicHelpText(monitorType);

        const checkIntervalLabel = useMemo(() => {
            const match = CHECK_INTERVALS.find(
                (interval) => interval.value === checkIntervalMs
            );
            return (
                match?.label ?? `${Math.round(checkIntervalMs / 60_000)} min`
            );
        }, [checkIntervalMs]);

        const helperBullets = useMemo<HelperBullet[]>(
            () =>
                buildAddSiteFormHelperBullets({
                    addMode,
                    checkIntervalLabel,
                    helpTexts: {
                        primary: helpTexts.primary ?? "",
                        secondary: helpTexts.secondary ?? "",
                    },
                }),
            [
                addMode,
                checkIntervalLabel,
                helpTexts.primary,
                helpTexts.secondary,
            ]
        );

        // Normalize potential undefined values from the store for robust
        // tests and edge cases.
        const normalizedName = typeof name === "string" ? name : "";
        const isNameMissing = normalizedName.trim().length === 0;
        const shouldShowNameError =
            addMode === "new" &&
            (formError === SITE_NAME_REQUIRED_MESSAGE ||
                (hasSubmitted && isNameMissing));

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
                    setCheckIntervalMs(numericValue);
                }
            },
            [setCheckIntervalMs]
        );

        // Combined success callback that resets form and calls prop callback
        const handleSuccess = useCallback(() => {
            resetForm();
            setHasSubmitted(false);
            onSuccess?.();
        }, [
            onSuccess,
            resetForm,
            setHasSubmitted,
        ]);

        // Dynamic monitor field change handlers
        const handleDynamicFieldChange = useMemo(
            () =>
                createDynamicFieldChangeHandlers({
                    setBaselineUrl,
                    setBodyKeyword,
                    setCertificateWarningDays,
                    setEdgeLocations,
                    setExpectedHeaderValue,
                    setExpectedJsonValue,
                    setExpectedStatusCode,
                    setExpectedValue,
                    setHeaderName,
                    setHeartbeatExpectedStatus,
                    setHeartbeatMaxDriftSeconds,
                    setHeartbeatStatusField,
                    setHeartbeatTimestampField,
                    setHost,
                    setJsonPath,
                    setMaxPongDelayMs,
                    setMaxReplicationLagSeconds,
                    setMaxResponseTimeMs,
                    setPort,
                    setPrimaryStatusUrl,
                    setRecordType,
                    setReplicaStatusUrl,
                    setReplicationTimestampField,
                    setUrl,
                }),
            [
                setBaselineUrl,
                setBodyKeyword,
                setCertificateWarningDays,
                setEdgeLocations,
                setExpectedHeaderValue,
                setExpectedJsonValue,
                setExpectedStatusCode,
                setExpectedValue,
                setHeaderName,
                setHeartbeatExpectedStatus,
                setHeartbeatMaxDriftSeconds,
                setHeartbeatStatusField,
                setHeartbeatTimestampField,
                setHost,
                setJsonPath,
                setMaxPongDelayMs,
                setMaxReplicationLagSeconds,
                setMaxResponseTimeMs,
                setPort,
                setPrimaryStatusUrl,
                setRecordType,
                setReplicaStatusUrl,
                setReplicationTimestampField,
                setUrl,
            ]
        );

        // Dynamic monitor field values (canonical field names).
        const dynamicFieldValues = buildMonitorValidationFieldValues(formState);

        // Delayed loading state for button spinner (managed by custom hook)
        const showButtonLoading = useDelayedButtonLoading(isLoading);

        /**
         * Handles form submission for adding a site or monitor.
         *
         * @remarks
         * Delegates to {@link handleSubmit} with all relevant form state and
         * handlers.
         *
         * @param event - The form submission event.
         */
        const onSubmit = useCallback(
            async (event: SyntheticEvent<HTMLFormElement>) => {
                try {
                    await handleSubmit(event, {
                        addMode,
                        addMonitorToSite,
                        baselineUrl,
                        bodyKeyword,
                        certificateWarningDays,
                        checkIntervalMs,
                        clearError,
                        createSite,
                        dynamicFieldValues,
                        edgeLocations,
                        expectedHeaderValue,
                        expectedJsonValue,
                        expectedStatusCode,
                        expectedValue,
                        formError,
                        generateUuid,
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
                        onSuccess: handleSuccess,
                        port,
                        primaryStatusUrl,
                        recordType,
                        replicaStatusUrl,
                        replicationTimestampField,
                        selectedExistingSite,
                        setFormError,
                        siteIdentifier,
                        url,
                    });
                } catch (error) {
                    logger.error(
                        "Form submission failed:",

                        ensureError(error)
                    );
                    // Form error handling is already managed by handleSubmit
                }
            },
            [
                addMode,
                addMonitorToSite,
                baselineUrl,
                bodyKeyword,
                certificateWarningDays,
                checkIntervalMs,
                clearError,
                createSite,
                dynamicFieldValues,
                edgeLocations,
                expectedHeaderValue,
                expectedJsonValue,
                expectedStatusCode,
                expectedValue,
                formError,
                handleSuccess,
                headerName,
                heartbeatExpectedStatus,
                heartbeatMaxDriftSeconds,
                heartbeatStatusField,
                heartbeatTimestampField,
                host,
                jsonPath,
                maxPongDelayMs,
                maxReplicationLagSeconds,
                maxResponseTimeMs,
                monitorType,
                name,
                port,
                primaryStatusUrl,
                recordType,
                replicaStatusUrl,
                replicationTimestampField,
                selectedExistingSite,
                setFormError,
                siteIdentifier,
                url,
            ]
        );

        /**
         * Handles form submission events for the form element.
         *
         * @param e - The form submission event
         */
        const handleSiteNameChange = useCallback(
            (value: string) => {
                setName(value);

                if (
                    formError === SITE_NAME_REQUIRED_MESSAGE &&
                    value.trim().length > 0
                ) {
                    setFormError(undefined);
                }
            },
            [
                formError,
                setFormError,
                setName,
            ]
        );

        const handleFormSubmit = useCallback(
            (e: SyntheticEvent<HTMLFormElement>) => {
                e.preventDefault();
                setHasSubmitted(true);

                if (addMode === "new" && isNameMissing) {
                    logger.debug(
                        "[AddSiteForm] Blocking submit due to empty name"
                    );
                    return;
                }

                setFormError(undefined);
                void onSubmit(e);
            },
            [
                addMode,
                isNameMissing,
                onSubmit,
                setFormError,
            ]
        );
        const onClearError = useCallback(() => {
            clearError();
            setFormError(undefined);
        }, [clearError, setFormError]);

        // Memoized callbacks for form components to optimize re-renders
        const handleAddModeChange = useCallback(
            (value: string) => {
                if (!isValidAddMode(value)) {
                    logger.error(`Invalid add mode value: ${value}`);
                    return;
                }

                if (value !== addMode) {
                    setHasSubmitted(false);
                }

                setAddMode(value);
            },
            [
                addMode,
                setAddMode,
                setHasSubmitted,
            ]
        );

        // Memoized options arrays to prevent unnecessary re-renders
        const addModeOptions = useMemo(
            () => [
                { label: "Create New Site", value: "new" },
                { label: "Add to Existing Site", value: "existing" },
            ],
            []
        );

        const checkIntervalOptions = useMemo(
            () =>
                CHECK_INTERVALS.map((interval) => ({
                    label: interval.label,
                    value: String(interval.value),
                })),
            []
        );

        const resolvedErrorMessage =
            formError ?? monitorFieldsError ?? lastError ?? "";
        const shouldRenderErrorAlert = resolvedErrorMessage.length > 0;
        return (
            <SurfaceContainer
                className="add-site-form__container"
                data-testid="add-site-form-container"
            >
                {/* Disable native validation so custom messaging renders */}
                <form
                    aria-label="Add Site Form"
                    className="add-site-form"
                    data-testid="add-site-form"
                    noValidate
                    onSubmit={handleFormSubmit}
                >
                    <section className="add-site-form__section">
                        <header className="add-site-form__section-header">
                            <div className="add-site-form__section-icon">
                                <SiteTargetIcon size={18} />
                            </div>
                            <div>
                                <ThemedText
                                    className="add-site-form__section-title"
                                    size="md"
                                    weight="semibold"
                                >
                                    Site Target
                                </ThemedText>
                                <ThemedText
                                    className="add-site-form__section-description"
                                    size="xs"
                                    variant="secondary"
                                >
                                    Configure monitoring for a new property or
                                    link additional monitors to an existing
                                    site.
                                </ThemedText>
                            </div>
                        </header>
                        <div className="add-site-form__section-body">
                            <RadioGroup
                                disabled={isLoading}
                                id="addMode"
                                label="Add Mode"
                                name="addMode"
                                onChange={handleAddModeChange}
                                options={addModeOptions}
                                value={addMode}
                            />

                            {addMode === "existing" ? (
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
                            ) : (
                                <div className="add-site-form__field-group">
                                    <TextField
                                        disabled={isLoading}
                                        id="siteName"
                                        label="Site Name"
                                        onChange={handleSiteNameChange}
                                        placeholder="My Website"
                                        required
                                        type="text"
                                        value={name}
                                    />
                                    {shouldShowNameError ? (
                                        <ThemedText
                                            className="add-site-form__field-error"
                                            role="alert"
                                            size="xs"
                                            variant="error"
                                        >
                                            {SITE_NAME_REQUIRED_MESSAGE}
                                        </ThemedText>
                                    ) : null}
                                </div>
                            )}

                            {addMode === "new" ? (
                                <div className="add-site-form__identifier-card">
                                    <ThemedText
                                        className="add-site-form__identifier-label"
                                        size="xs"
                                        variant="secondary"
                                        weight="medium"
                                    >
                                        Site Identifier:
                                    </ThemedText>
                                    <ThemedText
                                        className="add-site-form__identifier-value"
                                        size="sm"
                                        variant="primary"
                                        weight="semibold"
                                    >
                                        {siteIdentifier}
                                    </ThemedText>
                                </div>
                            ) : null}
                        </div>
                    </section>

                    <section className="add-site-form__section">
                        <header className="add-site-form__section-header">
                            <div className="add-site-form__section-icon">
                                <MonitorConfigIcon size={18} />
                            </div>
                            <div>
                                <ThemedText
                                    className="add-site-form__section-title"
                                    size="md"
                                    weight="semibold"
                                >
                                    Monitor Configuration
                                </ThemedText>
                                <ThemedText
                                    className="add-site-form__section-description"
                                    size="xs"
                                    variant="secondary"
                                >
                                    Define what gets checked and how frequently
                                    to run each monitor.
                                </ThemedText>
                            </div>
                        </header>
                        <div className="add-site-form__section-body">
                            <SelectField
                                disabled={isLoading || isLoadingMonitorTypes}
                                id="monitorType"
                                label="Monitor Type"
                                onChange={handleMonitorTypeChange}
                                options={monitorTypeOptions}
                                value={monitorType}
                            />

                            <DynamicMonitorFields
                                isLoading={isLoading}
                                monitorType={monitorType}
                                onChange={handleDynamicFieldChange}
                                values={dynamicFieldValues}
                            />

                            <SelectField
                                disabled={isLoading}
                                id="checkInterval"
                                label="Check Interval"
                                onChange={handleCheckIntervalChange}
                                options={checkIntervalOptions}
                                value={String(checkIntervalMs)}
                            />
                        </div>
                    </section>

                    {shouldRenderErrorAlert ? (
                        <section className="add-site-form__section add-site-form__section--alert">
                            <ErrorAlert
                                message={resolvedErrorMessage}
                                onDismiss={onClearError}
                                variant="error"
                            />
                        </section>
                    ) : null}

                    <footer className="add-site-form__footer">
                        <ThemedButton
                            data-testid="add-site-submit"
                            disabled={isLoading}
                            fullWidth
                            loading={showButtonLoading}
                            type="submit"
                            variant="primary"
                        >
                            {addMode === "new" ? "Add Site" : "Add Monitor"}
                        </ThemedButton>

                        <ul className="add-site-form__helper-list">
                            {helperBullets.map((bullet) => (
                                <li key={`add-site-form-helper-${bullet.id}`}>
                                    <div className="flex items-start gap-2">
                                        <HelperInfoIcon
                                            aria-hidden="true"
                                            className="mt-0.5 size-4 shrink-0 opacity-70"
                                        />
                                        <ThemedText
                                            className="leading-snug"
                                            size="xs"
                                            variant="tertiary"
                                        >
                                            {bullet.text}
                                        </ThemedText>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </footer>
                </form>
            </SurfaceContainer>
        );
    }
);

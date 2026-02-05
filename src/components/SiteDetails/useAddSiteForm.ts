/**
 * Custom hook for managing add site form state and validation.
 *
 * @remarks
 * Provides comprehensive form state management for creating new sites and
 * adding monitors to existing sites. Supports real-time validation, automatic
 * UUID generation, and error handling. This hook uses render-time state
 * management with previous value tracking to handle state resets when the
 * selected monitor changes, following modern React patterns that avoid direct
 * setState calls in useEffect hooks.
 *
 * The hook manages two distinct operation modes:
 *
 * - "new": Creates a new site with the first monitor
 * - "existing": Adds a monitor to an existing site
 *
 * @example Basic usage in a form component:
 *
 * ```typescript
 * function AddSiteForm() {
 *   const {
 *     addMode,
 *     setAddMode,
 *     isFormValid,
 *     resetForm,
 *     // ... other properties
 *   } = useAddSiteForm();
 *
 *   const handleSubmit = () => {
 *     if (isFormValid()) {
 *       // Process form data
 *     }
 *   };
 *
 *   return (
 *     // Form JSX using the hook's state and actions
 *   );
 * }
 * ```
 *
 * @public
 */

import type { MonitorType } from "@shared/types";
import type { Simplify } from "type-fest";

import { useCallback, useEffect, useMemo, useState } from "react";

import { DEFAULT_CHECK_INTERVAL } from "../../constants";
import { useMonitorFields } from "../../hooks/useMonitorFields";
import { generateUuid } from "../../utils/data/generateUuid";
import {
    buildMonitorValidationFieldValues,
    type MonitorValidationFieldValues,
} from "../../utils/monitorValidationFields";
import { validateAddModeSelection } from "../AddSiteForm/utils/addModeValidation";
import {
    DEFAULT_ADD_SITE_MONITOR_FIELD_INPUTS,
} from "./addSiteForm/addSiteFormDefaults";
import {
    resetFieldsForModeChange,
    resetFieldsForMonitorType,
} from "./addSiteForm/addSiteFormResets";

/**
 * Form actions interface containing all form manipulation functions.
 *
 * @remarks
 * Provides a complete set of methods for manipulating form state, including
 * validation, field updates, and form lifecycle management. All setter methods
 * trigger re-renders and validation updates.
 *
 * @public
 */
export interface AddSiteFormActions {
    /** Whether the form is currently valid */
    isFormValid: () => boolean;
    /** Reset form to initial state */
    resetForm: () => void;
    /** Set form operation mode */
    setAddMode: (value: FormMode) => void;
    /** Set baseline URL for CDN edge consistency monitors */
    setBaselineUrl: (value: string) => void;
    /** Set response body keyword */
    setBodyKeyword: (value: string) => void;
    /** Set SSL certificate warning days */
    setCertificateWarningDays: (value: string) => void;
    /** Set check interval (milliseconds) */
    setCheckIntervalMs: (value: number) => void;
    /** Set CDN edge endpoint list */
    setEdgeLocations: (value: string) => void;
    /** Set expected header value */
    setExpectedHeaderValue: (value: string) => void;
    /** Set expected JSON value */
    setExpectedJsonValue: (value: string) => void;
    /** Set expected HTTP status code */
    setExpectedStatusCode: (value: string) => void;
    /** Set expected value field value */
    setExpectedValue: (value: string) => void;
    /** Set form error message */
    setFormError: (error: string | undefined) => void;
    /** Set HTTP header name */
    setHeaderName: (value: string) => void;
    /** Set heartbeat expected status */
    setHeartbeatExpectedStatus: (value: string) => void;
    /** Set heartbeat max drift */
    setHeartbeatMaxDriftSeconds: (value: string) => void;
    /** Set heartbeat status field */
    setHeartbeatStatusField: (value: string) => void;
    /** Set heartbeat timestamp field */
    setHeartbeatTimestampField: (value: string) => void;
    /** Set host field value */
    setHost: (value: string) => void;
    /** Set JSON path */
    setJsonPath: (value: string) => void;
    /** Set max pong delay for WebSocket monitors */
    setMaxPongDelayMs: (value: string) => void;
    /** Set max replication lag */
    setMaxReplicationLagSeconds: (value: string) => void;
    /** Set latency maximum response time (milliseconds) */
    setMaxResponseTimeMs: (value: string) => void;
    /** Set monitor type */
    setMonitorType: (value: MonitorType) => void;
    /** Set site name field value */
    setName: (value: string) => void;
    /** Set port field value */
    setPort: (value: string) => void;
    /** Set primary replication status URL */
    setPrimaryStatusUrl: (value: string) => void;
    /** Set DNS record type field value */
    setRecordType: (value: string) => void;
    /** Set replica status URL */
    setReplicaStatusUrl: (value: string) => void;
    /** Set replication timestamp field */
    setReplicationTimestampField: (value: string) => void;
    /** Set selected existing site identifier */
    setSelectedExistingSite: (value: string) => void;
    /** Set generated site identifier */
    setSiteIdentifier: (value: string) => void;
    /** Set URL field value */
    setUrl: (value: string) => void;
}

/**
 * Form state interface containing all form field values and UI state.
 *
 * @remarks
 * Represents the complete state of the add site form, including field values,
 * validation state, and operation mode. Field visibility and requirements
 * change based on the selected monitor type and operation mode.
 *
 * @public
 */
export interface AddSiteFormState {
    /** Form operation mode (new site vs existing site) */
    addMode: FormMode;
    /** Baseline URL for CDN edge consistency monitors */
    baselineUrl: string;
    /** Keyword to match for HTTP keyword monitors */
    bodyKeyword: string;
    /** SSL certificate warning days */
    certificateWarningDays: string;
    /** Check interval in milliseconds */
    checkIntervalMs: number;
    /** Edge endpoint list for CDN edge consistency monitors */
    edgeLocations: string;
    /** Expected HTTP header value for header monitors */
    expectedHeaderValue: string;
    /** Expected JSON value for JSON monitors */
    expectedJsonValue: string;
    /** Expected HTTP status code for status-based HTTP monitors */
    expectedStatusCode: string;
    /** Expected value for DNS record verification */
    expectedValue: string;
    /** Current form validation error */
    formError: string | undefined;
    /** Header name for HTTP header monitors */
    headerName: string;
    /** Expected heartbeat status field */
    heartbeatExpectedStatus: string;
    /** Heartbeat drift tolerance */
    heartbeatMaxDriftSeconds: string;
    /** Heartbeat status field path */
    heartbeatStatusField: string;
    /** Heartbeat timestamp field path */
    heartbeatTimestampField: string;
    /** Host/IP field for port and DNS monitors */
    host: string;
    /** JSON path for HTTP JSON monitors */
    jsonPath: string;
    /** Maximum pong delay for WebSocket monitors */
    maxPongDelayMs: string;
    /** Maximum replication lag in seconds */
    maxReplicationLagSeconds: string;
    /** Maximum response time (milliseconds) for latency monitors */
    maxResponseTimeMs: string;
    /** Selected monitor type */
    monitorType: MonitorType;
    /** Display name for the site */
    name: string;
    /** Port number field for port monitors */
    port: string;
    /** Primary replication status URL */
    primaryStatusUrl: string;
    /** DNS record type field for DNS monitors */
    recordType: string;
    /** Replica status URL */
    replicaStatusUrl: string;
    /** Replication timestamp field */
    replicationTimestampField: string;
    /** Selected existing site identifier when adding to existing */
    selectedExistingSite: string;
    /** Generated site identifier */
    siteIdentifier: string;
    /** URL field for HTTP monitors */
    url: string;
}

/**
 * Form operation mode type.
 */
export type FormMode = "existing" | "new";

/**
 * Complete form hook return type combining actions and state.
 */
export type UseAddSiteFormReturn = Simplify<
    AddSiteFormActions & AddSiteFormState
>;

/**
 * Extended return type that also exposes monitor-field load state.
 */
export type UseAddSiteFormReturnWithMonitorFields = UseAddSiteFormReturn & {
    /** Error message if monitor field configurations failed to load. */
    monitorFieldsError?: string | undefined;
    /** Whether monitor field configurations are loaded. */
    monitorFieldsLoaded: boolean;
};

type MonitorFieldValues = MonitorValidationFieldValues;

/**
 * Hook for managing add site form state and operations.
 *
 * @remarks
 * Provides comprehensive form state management with real-time validation,
 * support for both new sites and adding monitors to existing sites. Handles
 * dynamic field validation based on monitor type and maintains proper form
 * state throughout the user interaction lifecycle.
 *
 * @returns Combined form state and action handlers containing all form fields,
 *   validation state, and manipulation functions for managing the add site
 *   form.
 *
 * @public
 */
/**
 * Normalizes user-provided site names by trimming leading whitespace.
 *
 * @param value - Raw input from the text field.
 *
 * @returns The input string without leading whitespace characters.
 */
const trimLeadingWhitespace = (value: string): string => value.trimStart();

/**
 * Creates the full state and action surface for the add-site form.
 *
 * @returns The complete {@link UseAddSiteFormReturn} object consumed by
 *   AddSiteForm.
 */
export function useAddSiteForm(): UseAddSiteFormReturnWithMonitorFields {
    // Form field state
    const [url, setUrl] = useState(DEFAULT_ADD_SITE_MONITOR_FIELD_INPUTS.url);
    const [baselineUrl, setBaselineUrl] = useState(
        DEFAULT_ADD_SITE_MONITOR_FIELD_INPUTS.baselineUrl
    );
    const [host, setHost] = useState(DEFAULT_ADD_SITE_MONITOR_FIELD_INPUTS.host);
    const [port, setPort] = useState(DEFAULT_ADD_SITE_MONITOR_FIELD_INPUTS.port);
    const [recordType, setRecordType] = useState(
        DEFAULT_ADD_SITE_MONITOR_FIELD_INPUTS.recordType
    );
    const [expectedValue, setExpectedValue] = useState(
        DEFAULT_ADD_SITE_MONITOR_FIELD_INPUTS.expectedValue
    );
    const [edgeLocations, setEdgeLocations] = useState(
        DEFAULT_ADD_SITE_MONITOR_FIELD_INPUTS.edgeLocations
    );
    const [bodyKeyword, setBodyKeyword] = useState(
        DEFAULT_ADD_SITE_MONITOR_FIELD_INPUTS.bodyKeyword
    );
    const [expectedStatusCode, setExpectedStatusCode] = useState(
        DEFAULT_ADD_SITE_MONITOR_FIELD_INPUTS.expectedStatusCode
    );
    const [expectedHeaderValue, setExpectedHeaderValue] = useState(
        DEFAULT_ADD_SITE_MONITOR_FIELD_INPUTS.expectedHeaderValue
    );
    const [expectedJsonValue, setExpectedJsonValue] = useState(
        DEFAULT_ADD_SITE_MONITOR_FIELD_INPUTS.expectedJsonValue
    );
    const [headerName, setHeaderName] = useState(
        DEFAULT_ADD_SITE_MONITOR_FIELD_INPUTS.headerName
    );
    const [jsonPath, setJsonPath] = useState(
        DEFAULT_ADD_SITE_MONITOR_FIELD_INPUTS.jsonPath
    );
    const [maxResponseTimeMs, setMaxResponseTimeMs] = useState(
        DEFAULT_ADD_SITE_MONITOR_FIELD_INPUTS.maxResponseTimeMs
    );
    const [maxPongDelayMs, setMaxPongDelayMs] = useState(
        DEFAULT_ADD_SITE_MONITOR_FIELD_INPUTS.maxPongDelayMs
    );
    const [maxReplicationLagSeconds, setMaxReplicationLagSeconds] = useState(
        DEFAULT_ADD_SITE_MONITOR_FIELD_INPUTS.maxReplicationLagSeconds
    );
    const [certificateWarningDays, setCertificateWarningDays] = useState(
        DEFAULT_ADD_SITE_MONITOR_FIELD_INPUTS.certificateWarningDays
    );
    const [primaryStatusUrl, setPrimaryStatusUrl] = useState(
        DEFAULT_ADD_SITE_MONITOR_FIELD_INPUTS.primaryStatusUrl
    );
    const [replicaStatusUrl, setReplicaStatusUrl] = useState(
        DEFAULT_ADD_SITE_MONITOR_FIELD_INPUTS.replicaStatusUrl
    );
    const [replicationTimestampField, setReplicationTimestampField] = useState(
        DEFAULT_ADD_SITE_MONITOR_FIELD_INPUTS.replicationTimestampField
    );
    const [heartbeatStatusField, setHeartbeatStatusField] = useState(
        DEFAULT_ADD_SITE_MONITOR_FIELD_INPUTS.heartbeatStatusField
    );
    const [heartbeatTimestampField, setHeartbeatTimestampField] = useState(
        DEFAULT_ADD_SITE_MONITOR_FIELD_INPUTS.heartbeatTimestampField
    );
    const [heartbeatExpectedStatus, setHeartbeatExpectedStatus] = useState(
        DEFAULT_ADD_SITE_MONITOR_FIELD_INPUTS.heartbeatExpectedStatus
    );
    const [heartbeatMaxDriftSeconds, setHeartbeatMaxDriftSeconds] = useState(
        DEFAULT_ADD_SITE_MONITOR_FIELD_INPUTS.heartbeatMaxDriftSeconds
    );
    const [name, setName] = useState("");
    const [monitorType, setMonitorType] = useState<MonitorType>("http");
    const [checkIntervalMs, setCheckIntervalMs] = useState(
        DEFAULT_CHECK_INTERVAL
    );
    const [siteIdentifier, setSiteIdentifier] = useState<string>(() =>
        generateUuid()
    ); // Lazy initialization

    const setSanitizedName = useCallback(
        (value: string): void => {
            setName(trimLeadingWhitespace(value));
        },
        [setName]
    );

    const monitorFieldValues = useMemo<MonitorFieldValues>(
        () =>
            buildMonitorValidationFieldValues({
                baselineUrl,
                bodyKeyword,
                certificateWarningDays,
                edgeLocations,
                expectedHeaderValue,
                expectedJsonValue,
                expectedStatusCode,
                expectedValue,
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
                port,
                primaryStatusUrl,
                recordType,
                replicaStatusUrl,
                replicationTimestampField,
                url,
            }),
        [
            baselineUrl,
            bodyKeyword,
            certificateWarningDays,
            edgeLocations,
            expectedHeaderValue,
            expectedJsonValue,
            expectedStatusCode,
            expectedValue,
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
            port,
            primaryStatusUrl,
            recordType,
            replicaStatusUrl,
            replicationTimestampField,
            url,
        ]
    );

    // Mode and selection state
    const [addMode, setAddMode] = useState<FormMode>("new");
    const [selectedExistingSite, setSelectedExistingSite] = useState("");

    // UI state
    const [formError, setFormError] = useState<string | undefined>();

    // Use monitor fields hook for dynamic validation
    const {
        error: monitorFieldsError,
        getFields,
        isLoaded: monitorFieldsLoaded,
    } = useMonitorFields();

    // Reset fields when monitor type changes - using useEffect to avoid render-time setState
    useEffect(
        function resetFieldsOnMonitorTypeChange() {
            const fieldDefinitions = getFields(monitorType);
            const currentFieldNames = new Set(
                fieldDefinitions.map((field) => field.name)
            );
            resetFieldsForMonitorType({
                currentFieldNames,
                currentValues: monitorFieldValues,
                setters: {
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
                },
            });
        },
        [
            getFields,
            monitorFieldValues,
            monitorType,
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

    // Reset name and site identifier when switching modes - using useEffect to avoid render-time setState
    useEffect(
        function resetFieldsOnAddModeChange() {
            resetFieldsForModeChange({
                addMode,
                generateSiteIdentifier: generateUuid,
                setName: setSanitizedName,
                setSiteIdentifier,
            });
        },
        [
            addMode,
            setSanitizedName,
            setSiteIdentifier,
        ]
    );

    const isFormValid = useCallback(
        () => {
            if (
                validateAddModeSelection({
                    addMode,
                    name,
                    selectedExistingSite,
                }).length > 0
            ) {
                return false;
            }

            // Dynamic validation based on monitor type fields
            const currentFields = getFields(monitorType);
            const lookup: Record<string, string> = monitorFieldValues;
            for (const field of currentFields) {
                if (field.required) {
                    const rawValue = lookup[field.name] ?? "";
                    if (rawValue.trim().length === 0) {
                        return false;
                    }
                }
            }

            return true;
        },
        [
            addMode,
            getFields,
            monitorFieldValues,
            monitorType,
            name,
            selectedExistingSite,
        ]
    );

    const resetForm = useCallback(() => {
        setBaselineUrl(DEFAULT_ADD_SITE_MONITOR_FIELD_INPUTS.baselineUrl);
        setUrl(DEFAULT_ADD_SITE_MONITOR_FIELD_INPUTS.url);
        setHost(DEFAULT_ADD_SITE_MONITOR_FIELD_INPUTS.host);
        setPort(DEFAULT_ADD_SITE_MONITOR_FIELD_INPUTS.port);
        setRecordType(DEFAULT_ADD_SITE_MONITOR_FIELD_INPUTS.recordType);
        setExpectedValue(DEFAULT_ADD_SITE_MONITOR_FIELD_INPUTS.expectedValue);
        setEdgeLocations(DEFAULT_ADD_SITE_MONITOR_FIELD_INPUTS.edgeLocations);
        setBodyKeyword(DEFAULT_ADD_SITE_MONITOR_FIELD_INPUTS.bodyKeyword);
        setExpectedStatusCode(
            DEFAULT_ADD_SITE_MONITOR_FIELD_INPUTS.expectedStatusCode
        );
        setExpectedHeaderValue(
            DEFAULT_ADD_SITE_MONITOR_FIELD_INPUTS.expectedHeaderValue
        );
        setExpectedJsonValue(
            DEFAULT_ADD_SITE_MONITOR_FIELD_INPUTS.expectedJsonValue
        );
        setHeaderName(DEFAULT_ADD_SITE_MONITOR_FIELD_INPUTS.headerName);
        setJsonPath(DEFAULT_ADD_SITE_MONITOR_FIELD_INPUTS.jsonPath);
        setMaxPongDelayMs(DEFAULT_ADD_SITE_MONITOR_FIELD_INPUTS.maxPongDelayMs);
        setMaxReplicationLagSeconds(
            DEFAULT_ADD_SITE_MONITOR_FIELD_INPUTS.maxReplicationLagSeconds
        );
        setMaxResponseTimeMs(
            DEFAULT_ADD_SITE_MONITOR_FIELD_INPUTS.maxResponseTimeMs
        );
        setCertificateWarningDays(
            DEFAULT_ADD_SITE_MONITOR_FIELD_INPUTS.certificateWarningDays
        );
        setPrimaryStatusUrl(
            DEFAULT_ADD_SITE_MONITOR_FIELD_INPUTS.primaryStatusUrl
        );
        setReplicaStatusUrl(
            DEFAULT_ADD_SITE_MONITOR_FIELD_INPUTS.replicaStatusUrl
        );
        setReplicationTimestampField(
            DEFAULT_ADD_SITE_MONITOR_FIELD_INPUTS.replicationTimestampField
        );
        setHeartbeatStatusField(
            DEFAULT_ADD_SITE_MONITOR_FIELD_INPUTS.heartbeatStatusField
        );
        setHeartbeatTimestampField(
            DEFAULT_ADD_SITE_MONITOR_FIELD_INPUTS.heartbeatTimestampField
        );
        setHeartbeatExpectedStatus(
            DEFAULT_ADD_SITE_MONITOR_FIELD_INPUTS.heartbeatExpectedStatus
        );
        setHeartbeatMaxDriftSeconds(
            DEFAULT_ADD_SITE_MONITOR_FIELD_INPUTS.heartbeatMaxDriftSeconds
        );
        setSanitizedName("");
        setMonitorType("http");
        setCheckIntervalMs(DEFAULT_CHECK_INTERVAL);
        setSiteIdentifier(generateUuid());
        setAddMode("new");
        setSelectedExistingSite("");
        setFormError(undefined);
    }, [
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
        setPort,
        setPrimaryStatusUrl,
        setRecordType,
        setReplicaStatusUrl,
        setReplicationTimestampField,
        setSanitizedName,
        setSelectedExistingSite,
        setSiteIdentifier,
        setUrl,
    ]);

    return {
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
        isFormValid,
        jsonPath,
        maxPongDelayMs,
        maxReplicationLagSeconds,
        maxResponseTimeMs,
        monitorFieldsError,
        monitorFieldsLoaded,
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
        setName: setSanitizedName,
        setPort,
        setPrimaryStatusUrl,
        setRecordType,
        setReplicaStatusUrl,
        setReplicationTimestampField,
        setSelectedExistingSite,
        setSiteIdentifier,
        setUrl,
        siteIdentifier,
        url,
    };
}

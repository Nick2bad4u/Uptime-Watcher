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
    /** Set latency max response time */
    setMaxResponseTime: (value: string) => void;
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
    /** Maximum response time for latency monitors */
    maxResponseTime: string;
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

// Helper functions for add site form logic (reduces function length by
// composition)
interface MonitorFieldValues {
    [key: string]: string;
    baselineUrl: string;
    bodyKeyword: string;
    certificateWarningDays: string;
    edgeLocations: string;
    expectedHeaderValue: string;
    expectedJsonValue: string;
    expectedStatusCode: string;
    expectedValue: string;
    headerName: string;
    heartbeatExpectedStatus: string;
    heartbeatMaxDriftSeconds: string;
    heartbeatStatusField: string;
    heartbeatTimestampField: string;
    host: string;
    jsonPath: string;
    maxPongDelayMs: string;
    maxReplicationLagSeconds: string;
    maxResponseTime: string;
    port: string;
    primaryStatusUrl: string;
    recordType: string;
    replicaStatusUrl: string;
    replicationTimestampField: string;
    url: string;
}

const resetFieldsForMonitorType = (
    currentFieldNames: Set<string>,
    currentValues: MonitorFieldValues,
    setters: {
        setBaselineUrl: (value: string) => void;
        setBodyKeyword: (value: string) => void;
        setCertificateWarningDays: (value: string) => void;
        setEdgeLocations: (value: string) => void;
        setExpectedHeaderValue: (value: string) => void;
        setExpectedJsonValue: (value: string) => void;
        setExpectedStatusCode: (value: string) => void;
        setExpectedValue: (value: string) => void;
        setHeaderName: (value: string) => void;
        setHeartbeatExpectedStatus: (value: string) => void;
        setHeartbeatMaxDriftSeconds: (value: string) => void;
        setHeartbeatStatusField: (value: string) => void;
        setHeartbeatTimestampField: (value: string) => void;
        setHost: (value: string) => void;
        setJsonPath: (value: string) => void;
        setMaxPongDelayMs: (value: string) => void;
        setMaxReplicationLagSeconds: (value: string) => void;
        setMaxResponseTime: (value: string) => void;
        setPort: (value: string) => void;
        setPrimaryStatusUrl: (value: string) => void;
        setRecordType: (value: string) => void;
        setReplicaStatusUrl: (value: string) => void;
        setReplicationTimestampField: (value: string) => void;
        setUrl: (value: string) => void;
    }
): void => {
    const fieldResetters: Array<{
        defaultValue: string;
        name: string;
        setter: (value: string) => void;
        value: string;
    }> = [
        {
            defaultValue: "",
            name: "baselineUrl",
            setter: setters.setBaselineUrl,
            value: currentValues.baselineUrl,
        },
        {
            defaultValue: "",
            name: "url",
            setter: setters.setUrl,
            value: currentValues.url,
        },
        {
            defaultValue: "",
            name: "host",
            setter: setters.setHost,
            value: currentValues.host,
        },
        {
            defaultValue: "",
            name: "port",
            setter: setters.setPort,
            value: currentValues.port,
        },
        {
            defaultValue: "A",
            name: "recordType",
            setter: setters.setRecordType,
            value: currentValues.recordType,
        },
        {
            defaultValue: "",
            name: "expectedValue",
            setter: setters.setExpectedValue,
            value: currentValues.expectedValue,
        },
        {
            defaultValue: "30",
            name: "certificateWarningDays",
            setter: setters.setCertificateWarningDays,
            value: currentValues.certificateWarningDays,
        },
        {
            defaultValue: "",
            name: "edgeLocations",
            setter: setters.setEdgeLocations,
            value: currentValues.edgeLocations,
        },
        {
            defaultValue: "",
            name: "bodyKeyword",
            setter: setters.setBodyKeyword,
            value: currentValues.bodyKeyword,
        },
        {
            defaultValue: "200",
            name: "expectedStatusCode",
            setter: setters.setExpectedStatusCode,
            value: currentValues.expectedStatusCode,
        },
        {
            defaultValue: "",
            name: "headerName",
            setter: setters.setHeaderName,
            value: currentValues.headerName,
        },
        {
            defaultValue: "",
            name: "expectedHeaderValue",
            setter: setters.setExpectedHeaderValue,
            value: currentValues.expectedHeaderValue,
        },
        {
            defaultValue: "",
            name: "jsonPath",
            setter: setters.setJsonPath,
            value: currentValues.jsonPath,
        },
        {
            defaultValue: "",
            name: "expectedJsonValue",
            setter: setters.setExpectedJsonValue,
            value: currentValues.expectedJsonValue,
        },
        {
            defaultValue: "2000",
            name: "maxResponseTime",
            setter: setters.setMaxResponseTime,
            value: currentValues.maxResponseTime,
        },
        {
            defaultValue: "1500",
            name: "maxPongDelayMs",
            setter: setters.setMaxPongDelayMs,
            value: currentValues.maxPongDelayMs,
        },
        {
            defaultValue: "10",
            name: "maxReplicationLagSeconds",
            setter: setters.setMaxReplicationLagSeconds,
            value: currentValues.maxReplicationLagSeconds,
        },
        {
            defaultValue: "",
            name: "primaryStatusUrl",
            setter: setters.setPrimaryStatusUrl,
            value: currentValues.primaryStatusUrl,
        },
        {
            defaultValue: "",
            name: "replicaStatusUrl",
            setter: setters.setReplicaStatusUrl,
            value: currentValues.replicaStatusUrl,
        },
        {
            defaultValue: "lastAppliedTimestamp",
            name: "replicationTimestampField",
            setter: setters.setReplicationTimestampField,
            value: currentValues.replicationTimestampField,
        },
        {
            defaultValue: "status",
            name: "heartbeatStatusField",
            setter: setters.setHeartbeatStatusField,
            value: currentValues.heartbeatStatusField,
        },
        {
            defaultValue: "timestamp",
            name: "heartbeatTimestampField",
            setter: setters.setHeartbeatTimestampField,
            value: currentValues.heartbeatTimestampField,
        },
        {
            defaultValue: "ok",
            name: "heartbeatExpectedStatus",
            setter: setters.setHeartbeatExpectedStatus,
            value: currentValues.heartbeatExpectedStatus,
        },
        {
            defaultValue: "60",
            name: "heartbeatMaxDriftSeconds",
            setter: setters.setHeartbeatMaxDriftSeconds,
            value: currentValues.heartbeatMaxDriftSeconds,
        },
    ];

    for (const field of fieldResetters) {
        if (
            !currentFieldNames.has(field.name) &&
            field.value !== field.defaultValue
        ) {
            field.setter(field.defaultValue);
        }
    }
};

const resetFieldsForModeChange = (
    addMode: FormMode,
    setters: {
        setName: (value: string) => void;
        setSiteIdentifier: (value: string) => void;
    }
): void => {
    if (addMode === "new") {
        setters.setName("");
        setters.setSiteIdentifier(generateUuid());
    } else {
        setters.setName("");
    }
};

/**
 * Validates form fields based on operation mode and monitor type requirements.
 *
 * @remarks
 * Performs comprehensive validation including mode-specific checks (site name
 * for new sites, existing site selection for existing sites) and dynamic field
 * validation based on the selected monitor type's required fields.
 *
 * @param addMode - Form operation mode (new site vs existing site)
 * @param name - Site name for new sites
 * @param selectedExistingSite - Selected existing site for monitor addition
 * @param monitorType - Type of monitor being configured
 * @param fieldValues - Current field values from the form
 * @param getFields - Function to get required fields for monitor type
 *
 * @returns True if form data is valid, false otherwise
 *
 * @internal
 */
const validateFormFields = (
    addMode: FormMode,
    name: string,
    selectedExistingSite: string,
    monitorType: MonitorType,
    fieldValues: MonitorFieldValues,
    getFields: (type: MonitorType) => Array<{ name: string; required: boolean }>
): boolean => {
    // Basic validation for mode and name
    if (addMode === "new" && !name.trim()) {
        return false;
    }
    if (addMode === "existing" && !selectedExistingSite) {
        return false;
    }

    // Dynamic validation based on monitor type fields
    const currentFields = getFields(monitorType);
    const lookup: Record<string, string> = fieldValues;
    for (const field of currentFields) {
        if (field.required) {
            const rawValue = lookup[field.name] ?? "";
            if (rawValue.trim().length === 0) {
                return false;
            }
        }
    }

    return true;
};

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
    const [url, setUrl] = useState("");
    const [baselineUrl, setBaselineUrl] = useState("");
    const [host, setHost] = useState("");
    const [port, setPort] = useState("");
    const [recordType, setRecordType] = useState("A");
    const [expectedValue, setExpectedValue] = useState("");
    const [edgeLocations, setEdgeLocations] = useState("");
    const [bodyKeyword, setBodyKeyword] = useState("");
    const [expectedStatusCode, setExpectedStatusCode] = useState("200");
    const [expectedHeaderValue, setExpectedHeaderValue] = useState("");
    const [expectedJsonValue, setExpectedJsonValue] = useState("");
    const [headerName, setHeaderName] = useState("");
    const [jsonPath, setJsonPath] = useState("");
    const [maxResponseTime, setMaxResponseTime] = useState("2000");
    const [maxPongDelayMs, setMaxPongDelayMs] = useState("1500");
    const [maxReplicationLagSeconds, setMaxReplicationLagSeconds] =
        useState("10");
    const [certificateWarningDays, setCertificateWarningDays] = useState("30");
    const [primaryStatusUrl, setPrimaryStatusUrl] = useState("");
    const [replicaStatusUrl, setReplicaStatusUrl] = useState("");
    const [replicationTimestampField, setReplicationTimestampField] = useState(
        "lastAppliedTimestamp"
    );
    const [heartbeatStatusField, setHeartbeatStatusField] = useState("status");
    const [heartbeatTimestampField, setHeartbeatTimestampField] =
        useState("timestamp");
    const [heartbeatExpectedStatus, setHeartbeatExpectedStatus] =
        useState("ok");
    const [heartbeatMaxDriftSeconds, setHeartbeatMaxDriftSeconds] =
        useState("60");
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
        () => ({
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
            maxResponseTime,
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
            maxResponseTime,
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
            resetFieldsForMonitorType(currentFieldNames, monitorFieldValues, {
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
                setMaxResponseTime,
                setPort,
                setPrimaryStatusUrl,
                setRecordType,
                setReplicaStatusUrl,
                setReplicationTimestampField,
                setUrl,
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
            setMaxResponseTime,
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
            resetFieldsForModeChange(addMode, {
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
        () =>
            validateFormFields(
                addMode,
                name,
                selectedExistingSite,
                monitorType,
                monitorFieldValues,
                getFields
            ),
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
        setBaselineUrl("");
        setUrl("");
        setHost("");
        setPort("");
        setRecordType("A");
        setExpectedValue("");
        setEdgeLocations("");
        setBodyKeyword("");
        setExpectedStatusCode("200");
        setExpectedHeaderValue("");
        setExpectedJsonValue("");
        setHeaderName("");
        setJsonPath("");
        setMaxPongDelayMs("1500");
        setMaxReplicationLagSeconds("10");
        setMaxResponseTime("2000");
        setCertificateWarningDays("30");
        setPrimaryStatusUrl("");
        setReplicaStatusUrl("");
        setReplicationTimestampField("lastAppliedTimestamp");
        setHeartbeatStatusField("status");
        setHeartbeatTimestampField("timestamp");
        setHeartbeatExpectedStatus("ok");
        setHeartbeatMaxDriftSeconds("60");
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
        setMaxResponseTime,
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
        maxResponseTime,
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
        setMaxResponseTime,
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

/**
 * Dynamic form component that generates monitor fields based on type configuration.
 * Eliminates hard-coded form field rendering by loading field definitions from backend.
 */

import { useState, useEffect } from "react";
import { TextField } from "./FormFields";
import {
    getMonitorTypeConfig,
    type MonitorFieldDefinition,
    type MonitorTypeConfig,
} from "../../utils/monitorTypeHelper";

interface DynamicMonitorFieldsProps {
    /** Selected monitor type */
    readonly monitorType: string;
    /** Current form values */
    readonly values: Record<string, string | number>;
    /** Change handlers for each field */
    readonly onChange: Record<string, (value: string | number) => void>;
    /** Whether the form is in a loading state */
    readonly isLoading?: boolean;
}

/**
 * Renders form fields dynamically based on monitor type configuration loaded from backend.
 */
export function DynamicMonitorFields({ monitorType, values, onChange, isLoading = false }: DynamicMonitorFieldsProps) {
    const [config, setConfig] = useState<MonitorTypeConfig | undefined>();
    const [isLoadingConfig, setIsLoadingConfig] = useState(true);
    const [error, setError] = useState<string | undefined>();

    // Load monitor type configuration from backend
    useEffect(() => {
        let isCancelled = false;

        const loadConfig = async () => {
            try {
                setIsLoadingConfig(true);
                setError(undefined);
                const configData = await getMonitorTypeConfig(monitorType);
                if (!isCancelled) {
                    setConfig(configData);
                }
            } catch (error_) {
                if (!isCancelled) {
                    const errorMessage = error_ instanceof Error ? error_.message : "Failed to load monitor config";
                    setError(errorMessage);
                    console.error("Failed to load monitor type config:", error_);
                }
            } finally {
                if (!isCancelled) {
                    setIsLoadingConfig(false);
                }
            }
        };

        void loadConfig();

        return () => {
            isCancelled = true;
        };
    }, [monitorType]);

    if (isLoadingConfig) {
        return <div className="text-gray-500">Loading monitor fields...</div>;
    }

    if (error) {
        return <div className="text-red-600">Error loading monitor fields: {error}</div>;
    }

    if (!config) {
        return <div className="text-red-600">Unknown monitor type: {monitorType}</div>;
    }

    return (
        <div className="flex flex-col gap-2">
            {config.fields.map((field) => (
                <DynamicField
                    key={field.name}
                    field={field}
                    value={values[field.name] ?? ""}
                    onChange={onChange[field.name] ?? (() => {})}
                    disabled={isLoading}
                />
            ))}
        </div>
    );
}

interface DynamicFieldProps {
    /** Field definition */
    readonly field: MonitorFieldDefinition;
    /** Current field value */
    readonly value: string | number;
    /** Change handler */
    readonly onChange: (value: string | number) => void;
    /** Whether the field is disabled */
    readonly disabled?: boolean;
}

/**
 * Renders a single form field based on its definition.
 */
function DynamicField({ field, value, onChange, disabled = false }: DynamicFieldProps) {
    const handleChange = (newValue: string | number) => {
        onChange(newValue);
    };

    switch (field.type) {
        case "text":
        case "url": {
            return (
                <TextField
                    disabled={disabled}
                    {...(field.helpText && { helpText: field.helpText })}
                    id={field.name}
                    label={field.label}
                    onChange={(val: string) => handleChange(val)}
                    {...(field.placeholder && { placeholder: field.placeholder })}
                    required={field.required}
                    type={field.type}
                    value={String(value)}
                />
            );
        }

        case "number": {
            return (
                <TextField
                    disabled={disabled}
                    {...(field.helpText && { helpText: field.helpText })}
                    id={field.name}
                    label={field.label}
                    {...(field.max && { max: field.max })}
                    {...(field.min && { min: field.min })}
                    onChange={(val: string) => handleChange(Number(val))}
                    {...(field.placeholder && { placeholder: field.placeholder })}
                    required={field.required}
                    type="number"
                    value={String(value)}
                />
            );
        }

        default: {
            return <div className="text-red-600">Unsupported field type: {field.type}</div>;
        }
    }
}

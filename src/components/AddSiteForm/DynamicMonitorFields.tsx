/**
 * Dynamic form component that generates monitor fields based on type configuration.
 * Eliminates hard-coded form field rendering by loading field definitions from backend.
 */

import { useState, useEffect } from "react";
import { TextField } from "./FormFields";
import { ThemedText } from "../../theme/components";
import logger from "../../services/logger";

import { getMonitorTypeConfig, type MonitorTypeConfig } from "../../utils/monitorTypeHelper";
import type { MonitorFieldDefinition } from "../../../shared/types";

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
                    logger.error("Failed to load monitor type config", error_ as Error);
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
        return <ThemedText variant="secondary">Loading monitor fields...</ThemedText>;
    }

    if (error) {
        return <ThemedText variant="error">Error loading monitor fields: {error}</ThemedText>;
    }

    if (!config) {
        return <ThemedText variant="error">Unknown monitor type: {monitorType}</ThemedText>;
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
            return <ThemedText variant="error">Unsupported field type: {field.type}</ThemedText>;
        }
    }
}

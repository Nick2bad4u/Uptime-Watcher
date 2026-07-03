import { getOwnDataProperty } from "@shared/utils/errorPropertyAccess";
import { isValidUrl } from "@shared/validation/validatorUtils";
import { isFinite as isFiniteNumber } from "ts-extras";

/**
 * Result of resolving a required monitor string field.
 */
export type RequiredMonitorStringFieldResult =
    | Readonly<{ message: string; ok: false }>
    | Readonly<{ ok: true; value: string }>;

/**
 * Reads and trims a required string field from a monitor object.
 *
 * @param monitor - Monitor-like object containing configuration fields.
 * @param fieldName - Field key to resolve.
 * @param errorMessage - Error message returned when the field is missing or
 *   invalid.
 *
 * @returns Discriminated result containing either a normalized value or a
 *   validation message.
 */
export function resolveRequiredMonitorStringField(
    monitor: object,
    fieldName: string,
    errorMessage: string
): RequiredMonitorStringFieldResult {
    const property = getOwnDataProperty(monitor, fieldName);
    const candidate = property.found ? property.value : undefined;
    if (typeof candidate !== "string") {
        return {
            message: errorMessage,
            ok: false,
        };
    }

    const normalized = candidate.trim();
    if (normalized.length === 0) {
        return {
            message: errorMessage,
            ok: false,
        };
    }

    return {
        ok: true,
        value: normalized,
    };
}

/**
 * Reads and validates a required URL field from a monitor object.
 *
 * @param monitor - Monitor-like object containing configuration fields.
 * @param fieldName - URL field key to resolve.
 * @param errorMessage - Error message returned when the field is missing or
 *   invalid.
 * @param protocols - Optional allowed protocols passed to URL validation.
 *
 * @returns Discriminated result containing either a validated URL or a
 *   validation message.
 */
export function resolveRequiredMonitorUrlField(
    monitor: object,
    fieldName: string,
    errorMessage: string,
    protocols?: readonly string[]
): RequiredMonitorStringFieldResult {
    const valueResult = resolveRequiredMonitorStringField(
        monitor,
        fieldName,
        errorMessage
    );

    if (!valueResult.ok) {
        return valueResult;
    }

    const isUrlLooksValid = isValidUrl(valueResult.value, {
        ...(protocols && { protocols: [...protocols] }),
    });

    if (!isUrlLooksValid) {
        return {
            message: errorMessage,
            ok: false,
        };
    }

    return valueResult;
}

/**
 * Resolves a numeric override with monitor-first precedence and service-level
 * fallback.
 *
 * @remarks
 * This utility centralizes the repeated pattern used by monitor services where
 * a numeric value can be provided on the monitor instance, then by service
 * configuration, otherwise defaulting to a constant.
 *
 * @param options - Resolution options.
 *
 * @returns The resolved numeric value.
 */
export function resolveMonitorNumericOverride(options: {
    readonly allowEqualMinimum?: boolean;
    readonly fallbackValue: number;
    readonly minimumValue: number;
    readonly monitor: object;
    readonly monitorFieldName: string;
    readonly serviceConfig: object;
    readonly serviceConfigFieldName?: string;
}): number {
    const {
        allowEqualMinimum = true,
        fallbackValue,
        minimumValue,
        monitor,
        monitorFieldName,
        serviceConfig,
        serviceConfigFieldName,
    } = options;

    const isCandidateAccepted = (candidate: unknown): candidate is number => {
        if (typeof candidate !== "number" || !isFiniteNumber(candidate)) {
            return false;
        }

        return allowEqualMinimum
            ? candidate >= minimumValue
            : candidate > minimumValue;
    };

    const monitorProperty = getOwnDataProperty(monitor, monitorFieldName);
    const monitorCandidate = monitorProperty.found
        ? monitorProperty.value
        : undefined;
    if (isCandidateAccepted(monitorCandidate)) {
        return monitorCandidate;
    }

    const resolvedServiceConfigFieldName =
        serviceConfigFieldName ?? monitorFieldName;
    const serviceConfigProperty = getOwnDataProperty(
        serviceConfig,
        resolvedServiceConfigFieldName
    );
    if (serviceConfigProperty.found) {
        const serviceCandidate = serviceConfigProperty.value;

        if (isCandidateAccepted(serviceCandidate)) {
            return serviceCandidate;
        }
    }

    return fallbackValue;
}

/**
 * SettingItem component for consistent settings layout
 */

import type { CoreComponentProperties } from "@shared/types/componentProps";
import type { FC, ReactNode } from "react";
import type { IconType } from "react-icons";

import { ThemedText } from "../../theme/components/ThemedText";

/**
 * Props for the SettingItem component
 */
export interface SettingItemProperties extends CoreComponentProperties {
    /**
     * Control component (input, select, checkbox, etc.).
     *
     * @remarks
     * A render callback is supported to avoid passing JSX as a prop in places
     * where strict performance lint rules are enabled.
     */
    readonly control: (() => ReactNode) | ReactNode;
    /** Description of the setting */
    readonly description?: string;
    /** Whether the setting is disabled */
    readonly disabled?: boolean;
    /** Optional leading icon for the setting title */
    readonly icon?: ReactNode;
    /** Optional className forwarded to the icon element (e.g., settings accent colors). */
    readonly iconClassName?: string;
    /** Preferred icon API: pass an IconType instead of JSX to avoid jsx-as-prop perf lint issues. */
    readonly iconComponent?: IconType;
    /** Optional icon size (px). Defaults to 16. */
    readonly iconSize?: number;
    /** Title of the setting */
    readonly title: string;
}

/**
 * Standardized setting item layout with title, description, and control
 *
 * @example
 *
 * ```tsx
 * <SettingItem
 *     title="Auto Start"
 *     description="Launch the application on system startup"
 *     control={
 *         <ThemedCheckbox
 *             checked={settings.autoStart}
 *             onChange={handleChange}
 *         />
 *     }
 * />;
 * ```
 *
 * @param props - SettingItem props
 *
 * @returns Setting item component with consistent layout
 */
export const SettingItem: FC<SettingItemProperties> = ({
    className = "",
    control,
    description,
    disabled = false,
    icon,
    iconClassName,
    iconComponent: IconComponent,
    iconSize,
    title,
}) => {
    const resolvedControl =
        typeof control === "function" ? (control as () => ReactNode)() : control;

    const resolvedIconNode = IconComponent ? (
        <IconComponent
            aria-hidden
            className={iconClassName}
            size={iconSize ?? 16}
        />
    ) : (
        icon
    );

    return (
        <div
            className={`setting-item ${disabled ? "disabled" : ""} ${className}`.trim()}
        >
            <div className="setting-info">
                <div className="setting-title-row">
                    {resolvedIconNode ? (
                        <span aria-hidden className="setting-item__icon">
                            {resolvedIconNode}
                        </span>
                    ) : null}
                    <ThemedText
                        className="setting-title"
                        size="sm"
                        weight="medium"
                    >
                        {title}
                    </ThemedText>
                </div>
                {description ? (
                    <ThemedText
                        className="setting-description"
                        size="xs"
                        variant="tertiary"
                    >
                        {description}
                    </ThemedText>
                ) : null}
            </div>
            <div className="setting-control">{resolvedControl}</div>
        </div>
    );
};

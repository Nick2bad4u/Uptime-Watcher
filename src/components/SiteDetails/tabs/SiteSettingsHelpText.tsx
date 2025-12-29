import type { ReactElement, ReactNode } from "react";
import type { IconType } from "react-icons";

import { ThemedText } from "../../../theme/components/ThemedText";
import { AppIcons } from "../../../utils/icons";

/**
 * Props for {@link SiteSettingsHelpText}.
 */
export interface SiteSettingsHelpTextProps {
    readonly children: ReactNode;
    readonly className?: string;
    readonly icon?: IconType;
    readonly tone?: "info" | "warning";
}

/**
 * Consistent helper / description text used throughout the Site Details
 * Settings tab.
 */
export const SiteSettingsHelpText = ({
    children,
    className,
    icon,
    tone = "info",
}: SiteSettingsHelpTextProps): ReactElement => {
    const Icon = icon ?? AppIcons.ui.info;
    const toneClassName = tone === "warning" ? "site-settings-help--warning" : "";
    const resolvedClassName = `site-settings-help ${toneClassName} ${className ?? ""}`.trim();

    return (
        <div className={resolvedClassName}>
            <span aria-hidden className="site-settings-help__icon">
                <Icon size={14} />
            </span>
            <ThemedText as="span" size="xs" variant="secondary">
                {children}
            </ThemedText>
        </div>
    );
};

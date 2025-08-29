import type { CoreComponentProperties } from "@shared/types/componentProps";

import { type JSX, memo, type NamedExoticComponent } from "react";

/**
 * Props for the ThemedTooltip component
 *
 * @public
 */
export interface ThemedTooltipProperties extends CoreComponentProperties {
    /** Text content to display in the tooltip */
    readonly content: string;
}

/**
 * A themed tooltip component for displaying hover information
 *
 * @param props - The tooltip properties
 *
 * @returns The themed tooltip JSX element
 *
 * @public
 */
const ThemedTooltipComponent = ({
    children,
    className = "",
    content,
}: ThemedTooltipProperties): JSX.Element => (
    <div className={`themed-tooltip ${className}`} title={content}>
        {children}
    </div>
);

export const ThemedTooltip: NamedExoticComponent<ThemedTooltipProperties> =
    memo(ThemedTooltipComponent);

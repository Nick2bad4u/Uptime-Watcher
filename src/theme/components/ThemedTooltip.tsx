import React from "react";

/**
 * Props for the ThemedTooltip component
 *
 * @public
 */
export interface ThemedTooltipProperties {
    readonly children: React.ReactNode;
    readonly className?: string;
    readonly content: string;
}

/**
 * A themed tooltip component for displaying hover information
 *
 * @param props - The tooltip properties
 * @returns The themed tooltip JSX element
 * @public
 */
const ThemedTooltip = ({
    children,
    className = "",
    content,
}: ThemedTooltipProperties): React.JSX.Element => (
    <div className={`themed-tooltip ${className}`} title={content}>
        {children}
    </div>
);

export default ThemedTooltip;

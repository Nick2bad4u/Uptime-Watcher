import React from "react";

/**
 * Props for the ThemedTooltip component
 *
 * @public
 */
export interface ThemedTooltipProperties {
    /** Child elements to wrap with tooltip functionality */
    readonly children: React.ReactNode;
    /** Additional CSS classes to apply to the component */
    readonly className?: string;
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

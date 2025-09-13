/**
 * StatusDivider component for creating visual separators in status sections.
 *
 * @remarks
 * This component provides a standardized divider element for separating status
 * components in the header.
 */

import type { JSX } from "react";

/**
 * StatusDivider component for status sections.
 *
 * @returns JSX element representing a vertical divider
 */
export const StatusDivider = (): JSX.Element => (
    <div className="h-8 w-px bg-current opacity-20" />
);

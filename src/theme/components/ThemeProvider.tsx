import type React from "react";

import { useTheme } from "../useTheme";

/**
 * Props for the ThemeProvider component
 *
 * @public
 */
export interface ThemeProviderProperties {
    readonly children: React.ReactNode;
}

/**
 * A theme provider component that initializes the theme system
 *
 * @param props - The theme provider properties
 * @returns The children wrapped with theme context
 * @public
 */

export default function ThemeProvider({
    children,
}: ThemeProviderProperties): React.ReactNode {
    // Initialize theme system on mount to ensure theme context is available
    useTheme();

    return children;
}

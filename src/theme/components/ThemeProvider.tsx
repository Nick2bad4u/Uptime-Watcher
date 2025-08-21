/**
 * Theme provider component for initializing and providing theme context.
 *
 * @remarks
 * Wraps the application or components to provide theme context and initialize
 * the theme system. This component ensures that theme settings are available
 * throughout the component tree and handles theme initialization on mount.
 *
 * @packageDocumentation
 */

import type React from "react";

import { useTheme } from "../useTheme";

/**
 * Props for the ThemeProvider component
 *
 * @public
 */
export interface ThemeProviderProperties {
    /** Child components to render within the theme context */
    readonly children: React.ReactNode;
}

/**
 * A theme provider component that initializes the theme system
 *
 * @param props - The theme provider properties
 *
 * @returns The children wrapped with theme context
 *
 * @public
 */

export default function ThemeProvider({
    children,
}: ThemeProviderProperties): React.ReactNode {
    // Initialize theme system on mount to ensure theme context is available
    useTheme();

    return children;
}

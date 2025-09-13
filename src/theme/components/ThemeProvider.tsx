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

import {
    Fragment,
    memo,
    type NamedExoticComponent,
    type ReactElement,
    type ReactNode,
} from "react";

import { useTheme } from "../useTheme";

/**
 * Props for the ThemeProvider component
 *
 * @public
 */
export interface ThemeProviderProperties {
    /** Child components to render within the theme context */
    readonly children: ReactNode;
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
const ThemeProviderComponent = ({
    children,
}: ThemeProviderProperties): ReactElement => {
    // Initialize theme system on mount to ensure theme context is available
    useTheme();

    // eslint-disable-next-line react/jsx-no-useless-fragment -- Children passthrough pattern requires fragments
    return <Fragment>{children}</Fragment>;
};

export const ThemeProvider: NamedExoticComponent<ThemeProviderProperties> =
    memo(ThemeProviderComponent);

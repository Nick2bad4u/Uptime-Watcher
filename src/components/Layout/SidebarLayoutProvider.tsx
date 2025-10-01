/**
 * Sidebar layout provider component that shares toggle state with descendants.
 */

import type { NamedExoticComponent, ReactNode } from "react";
import type { JSX } from "react/jsx-runtime";

import { memo, useMemo } from "react";

import {
    SidebarLayoutContext,
    type SidebarLayoutContextValue,
} from "./SidebarLayoutContext";

/**
 * Creates a memoizable context value for the sidebar layout provider.
 */
/**
 * Properties for {@link SidebarLayoutProvider}.
 */
export interface SidebarLayoutProviderProperties {
    /** Child nodes that should receive sidebar context. */
    readonly children: ReactNode;
    /** Whether the sidebar should be rendered as open. */
    readonly isSidebarOpen: boolean;
    /** Handler invoked to toggle sidebar visibility. */
    readonly toggleSidebar: () => void;
}

const SidebarLayoutProviderComponent = ({
    children,
    isSidebarOpen,
    toggleSidebar,
}: SidebarLayoutProviderProperties): JSX.Element => {
    const value: SidebarLayoutContextValue = useMemo(
        () => ({
            isSidebarOpen,
            toggleSidebar,
        }),
        [isSidebarOpen, toggleSidebar]
    );

    return (
        <SidebarLayoutContext value={value}>{children}</SidebarLayoutContext>
    );
};

SidebarLayoutProviderComponent.displayName = "SidebarLayoutProvider";

/**
 * Provider component that publishes sidebar layout state to descendants.
 */
export const SidebarLayoutProvider: NamedExoticComponent<SidebarLayoutProviderProperties> =
    memo(SidebarLayoutProviderComponent);

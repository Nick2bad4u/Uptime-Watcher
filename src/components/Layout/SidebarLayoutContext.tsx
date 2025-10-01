/**
 * Context utilities for coordinating sidebar layout state across the renderer.
 *
 * @remarks
 * The application shell exposes a collapsible sidebar on compact viewports.
 * Components such as {@link Header} and {@link AppSidebar} need to toggle or
 * observe that state without prop drilling, therefore we use a lightweight
 * React context with a resilient fallback for tests.
 */

import { type Context, createContext, use } from "react";

/**
 * Shape of the sidebar layout coordination context.
 *
 * @public
 */
export interface SidebarLayoutContextValue {
    /** Indicates whether the sidebar is currently visible. */
    readonly isSidebarOpen: boolean;
    /** Callback that toggles the sidebar visibility. */
    readonly toggleSidebar: () => void;
}

/**
 * Fallback value returned when a consumer accesses the context outside the
 * provider tree. The noop toggle keeps component behaviour predictable during
 * isolated unit tests.
 */
export const DEFAULT_SIDEBAR_LAYOUT: SidebarLayoutContextValue = Object.freeze({
    isSidebarOpen: true,
    toggleSidebar: () => {
        /* noop fallback */
    },
});

/**
 * Internal React context used to publish sidebar layout state.
 */
export const SidebarLayoutContext: Context<SidebarLayoutContextValue> =
    createContext<SidebarLayoutContextValue>(DEFAULT_SIDEBAR_LAYOUT);

SidebarLayoutContext.displayName = "SidebarLayoutContext";

/**
 * Hook exposing the sidebar layout context with a resilient fallback.
 *
 * @returns Sidebar layout state and controls.
 */
export const useSidebarLayout = (): SidebarLayoutContextValue =>
    use(SidebarLayoutContext);

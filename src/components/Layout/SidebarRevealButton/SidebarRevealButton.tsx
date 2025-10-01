/**
 * Floating button that reveals the collapsed sidebar.
 */

import type { JSX } from "react/jsx-runtime";

import { memo, type NamedExoticComponent, useMemo } from "react";

import { useTheme } from "../../../theme/useTheme";
import { useSidebarLayout } from "../SidebarLayoutContext";

/**
 * Floating sidebar toggle rendered when the navigation is collapsed.
 */
export const SidebarRevealButton: NamedExoticComponent = memo(
    function SidebarRevealButton(): JSX.Element | null {
        const { isDark } = useTheme();
        const { isSidebarOpen, toggleSidebar } = useSidebarLayout();

        const className = useMemo(() => {
            const classes = ["sidebar-reveal-button"];
            if (isDark) {
                classes.push("sidebar-reveal-button--dark");
            }
            return classes.join(" ");
        }, [isDark]);

        if (isSidebarOpen) {
            return null;
        }

        return (
            <button
                aria-label="Open navigation"
                className={className}
                onClick={toggleSidebar}
                type="button"
            >
                <span aria-hidden="true">☰</span>
            </button>
        );
    }
);

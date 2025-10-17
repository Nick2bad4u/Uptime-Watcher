/**
 * Floating button that reveals the collapsed sidebar.
 */

import type { JSX } from "react/jsx-runtime";

import { memo, type NamedExoticComponent, useMemo } from "react";

import { useTheme } from "../../../theme/useTheme";
import { AppIcons } from "../../../utils/icons";
import { Tooltip } from "../../common/Tooltip/Tooltip";
import { useSidebarLayout } from "../SidebarLayoutContext";

const RevealIcon = AppIcons.ui.sidebarExpand;

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
            <Tooltip content="Open navigation sidebar" position="right">
                {(triggerProps) => (
                    <button
                        {...triggerProps}
                        aria-label="Open navigation"
                        className={className}
                        data-testid="sidebar-reveal-button"
                        onClick={toggleSidebar}
                        type="button"
                    >
                        <span
                            aria-hidden="true"
                            className="sidebar-reveal-button__icon"
                        >
                            <RevealIcon size={18} />
                        </span>
                        <span className="sidebar-reveal-button__label">
                            Open Sidebar
                        </span>
                    </button>
                )}
            </Tooltip>
        );
    }
);

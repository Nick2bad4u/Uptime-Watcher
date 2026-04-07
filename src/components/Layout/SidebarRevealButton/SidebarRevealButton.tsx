/**
 * Floating button that reveals the collapsed sidebar.
 */

import type { JSX } from "react/jsx-runtime";

import { memo, type NamedExoticComponent, useCallback, useMemo } from "react";
import { arrayJoin } from "ts-extras";

import { useUIStore } from "../../../stores/ui/useUiStore";
import { useTheme } from "../../../theme/useTheme";
import { AppIcons } from "../../../utils/icons";
import { Tooltip } from "../../common/Tooltip/Tooltip";
import { useSidebarLayout } from "../SidebarLayoutContext";

const RevealIcon = AppIcons.ui.sidebarExpand;

/**
 * Floating sidebar toggle rendered when the navigation is collapsed.
 */
export const SidebarRevealButton: NamedExoticComponent = memo(
    function SidebarRevealButtonComponent(): JSX.Element | null {
        const { isDark } = useTheme();
        const { isSidebarOpen, toggleSidebar } = useSidebarLayout();
        const hasBlockingOverlay = useUIStore(
            useCallback(
                (state) =>
                    state.showAddSiteModal ||
                    state.showSettings ||
                    state.showSiteDetails,
                []
            )
        );
        const className = useMemo(() => {
            const classes = ["sidebar-reveal-button"];
            if (isDark) {
                classes.push("sidebar-reveal-button--dark");
            }
            return arrayJoin(classes, " ");
        }, [isDark]);

        if (hasBlockingOverlay || isSidebarOpen) {
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
                    </button>
                )}
            </Tooltip>
        );
    }
);

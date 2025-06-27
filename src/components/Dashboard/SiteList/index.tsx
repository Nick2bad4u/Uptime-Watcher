import { useStore } from "../../../store";
import { useTheme } from "../../../theme/useTheme";
import { SiteCard } from "../SiteCard";
import { EmptyState } from "./EmptyState";

/**
 * Refactored SiteList component with improved organization
 */
export function SiteList() {
    const { sites } = useStore();
    const { isDark } = useTheme();

    if (sites.length === 0) {
        return <EmptyState />;
    }

    return (
        <div className={`divider-y ${isDark ? "dark" : ""}`}>
            {sites.map((site) => (
                <SiteCard key={site.identifier} site={site} />
            ))}
        </div>
    );
}
